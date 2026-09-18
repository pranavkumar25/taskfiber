import { render } from "@react-email/render";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDateShort, formatDueCompact } from "@/server/format";
import {
  approvalTemplate,
  decisionReceipt,
  paymentReminderTemplate,
  paymentTemplate,
  updateTemplate,
} from "@/server/channels";
import { approvalRecordLine } from "@/server/approvals";
import { nowMs, requestNow } from "@/server/now";
import { WeeklyDigest, subjectFor, type DigestProps } from "@/components/channels/weekly-digest";
import { WhatsAppThread } from "@/components/channels/whatsapp";
import { Card } from "@/components/ui/surface";

export const metadata = { title: "Channels" };
export const dynamic = "force-dynamic";

/**
 * 6.29 and 6.30 · Channels.
 *
 * The digest and the WhatsApp templates, rendered from the same builders the
 * send path uses and filled with this client's real data — so what an agency
 * reviews here is exactly what lands.
 */
export default async function ChannelsPage() {
  const { agency } = await currentWorkspace();

  const client = await db.client.findFirstOrThrow({
    where: { agencyId: agency.id, slug: "kiro-foods" },
    include: {
      contacts: true,
      portal: { select: { slug: true } },
      projects: {
        include: {
          updates: {
            where: { visibility: "CLIENT_VISIBLE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { author: true },
          },
          milestones: {
            where: { state: { not: "DONE" }, visibility: "CLIENT_VISIBLE" },
            orderBy: { date: "asc" },
            take: 2,
          },
        },
      },
      invoices: { where: { status: { not: "PAID" } }, orderBy: { dueAt: "asc" } },
      deliverables: {
        where: { visibility: "CLIENT_VISIBLE" },
        orderBy: { publishedAt: "desc" },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { requests: { where: { state: "WAITING" }, include: { approver: true } } },
          },
        },
      },
    },
  });

  const approver = client.contacts.find((c) => c.role === "APPROVER")!;
  const billing = client.contacts.find((c) => c.role === "BILLING")!;
  const lead = client.projects[0];
  const update = lead?.updates[0];
  const pending = client.deliverables.find((d) => d.versions[0]?.requests.length);
  const request = pending?.versions[0]?.requests[0];
  const invoice = client.invoices[0];
  const portalUrl = `https://${agency.customDomain ?? agency.portalDomain}/${client.portal?.slug}`;

  const shipped = client.deliverables
    .filter((d) => d.publishedAt && d.id !== pending?.id)
    .slice(0, 2)
    .map((d) => ({
      item: d.name,
      outcome: d.assetSummary ?? d.type,
      date: formatDateShort(d.publishedAt!),
    }));

  const digest: DigestProps = {
    agency: { name: agency.name, accentHex: agency.accentHex },
    client: { name: client.name },
    contact: { name: approver.name },
    week: 38,
    date: formatDate(requestNow()),
    headline: `Hi ${approver.name.split(" ")[0]}. One thing needs you, ${shipped.length} things shipped, and ${lead?.name ?? "the work"} is on track.`,
    needsYou:
      pending && request
        ? {
            title: pending.name,
            version: pending.versions[0].label,
            whatChanged: pending.versions[0].note ?? "",
            dueLabel: request.dueAt ? `Due ${formatDateShort(request.dueAt)}` : "",
            approveUrl: `${portalUrl}/deliverables/${pending.id}`,
            portalUrl,
          }
        : null,
    shipped,
    next: (lead?.milestones ?? []).map((m) => ({
      date: formatDateShort(m.date),
      event: m.name,
    })),
    metrics: [
      { label: "Sessions", value: "1,84,220" },
      { label: "Purchases", value: "3,918" },
      { label: "Cost per purchase", value: "₹163" },
    ],
    signOff: { name: lead?.updates[0]?.author?.name ?? "Your lead", role: "account manager" },
    preferencesUrl: `${portalUrl}/preferences`,
    portalUrl,
  };

  // React Email's renderer, rather than react-dom/server, which a Server
  // Component may not import.
  const digestHtml = await render(<WeeklyDigest {...digest} />);

  const recordLine = pending
    ? approvalRecordLine({
        decision: "APPROVED",
        versionLabel: pending.versions[0].label,
        approverName: approver.name,
        decidedAt: requestNow(),
        channel: "WHATSAPP",
      })
    : "";

  return (
    <div className="px-8 pt-8 pb-24">
      <h1 className="text-h1 font-semibold">Channels</h1>
      <p className="mt-1.5 max-w-2xl text-body text-steel">
        The target is that over 60% of client actions happen here rather than in the portal, so
        these are not notifications pointing at the product — they are the product&rsquo;s voice.
        Every decision taken from a channel writes the same approval record, with the channel
        named.
      </p>

      <section className="mt-8">
        <h2 className="text-h3 font-semibold">Weekly digest</h2>
        <p className="mt-1 font-mono text-meta text-steel">
          From {agency.emailSender ?? agency.name} · Subject: {subjectFor(digest)}
        </p>
        <Card className="mt-3 overflow-hidden bg-canvas p-6">
          <iframe
            title="Weekly digest preview"
            srcDoc={digestHtml}
            className="mx-auto block h-[1100px] w-full max-w-[640px] rounded-card border-0 bg-transparent"
          />
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-h3 font-semibold">WhatsApp</h2>
        <p className="mt-1 text-meta text-steel">
          Three Meta-approved templates · sender {agency.name} (verified)
        </p>

        <div className="mt-3 flex flex-wrap gap-5">
          {update ? (
            <WhatsAppThread
              agency={agency.name}
              accentHex={agency.accentHex}
              verified
              dayDivider={formatDate(update.createdAt)}
              messages={[
                {
                  from: "agency",
                  at: "09:32",
                  template: updateTemplate({
                    agency: agency.name,
                    client: client.name,
                    contactFirstName: approver.name.split(" ")[0],
                    author: update.author?.name ?? agency.name,
                    updateTitle: update.title,
                    body: update.body,
                    portalUrl,
                  }),
                },
              ]}
            />
          ) : null}

          {pending && request ? (
            <WhatsAppThread
              agency={agency.name}
              accentHex={agency.accentHex}
              verified
              dayDivider={formatDate(requestNow())}
              messages={[
                {
                  from: "agency",
                  at: "14:02",
                  template: approvalTemplate({
                    contactFirstName: approver.name.split(" ")[0],
                    deliverable: pending.name,
                    version: pending.versions[0].label,
                    whatChanged: pending.versions[0].note ?? "",
                    dueLabel: request.dueAt ? formatDateShort(request.dueAt) : "",
                  }),
                },
                {
                  from: "client",
                  text: `✓ Approve ${pending.versions[0].label}`,
                  at: "14:06",
                },
                {
                  from: "agency",
                  plain: true,
                  at: "14:06",
                  text: decisionReceipt(recordLine, agency.name),
                },
              ]}
            />
          ) : null}

          {invoice ? (
            <WhatsAppThread
              agency={agency.name}
              accentHex={agency.accentHex}
              verified
              dayDivider={`${formatDate(invoice.dueAt)} · to ${billing.name} (billing)`}
              messages={[
                {
                  from: "agency",
                  at: "10:00",
                  template: paymentTemplate({
                    contactFirstName: billing.name.split(" ")[0],
                    client: client.name,
                    number: invoice.number,
                    amount: Number(invoice.amount),
                    currency: invoice.currency,
                    dueAt: invoice.dueAt,
                    gstin: client.gstin,
                    upiHandle: `${agency.slug}@icici`,
                    invoiceUrl: invoice.paymentLink ?? "#",
                  }),
                },
                {
                  from: "agency",
                  at: "10:00",
                  template: paymentReminderTemplate({
                    number: invoice.number,
                    amount: Number(invoice.amount),
                    currency: invoice.currency,
                    dueAt: invoice.dueAt,
                    daysOverdue: Math.max(
                      1,
                      Math.round((nowMs() - invoice.dueAt.getTime()) / 86400000),
                    ),
                    accountingTool: "Zoho Books",
                  }),
                },
              ]}
            />
          ) : null}
        </div>

        <p className="mt-4 max-w-2xl text-meta text-steel">
          Quick-reply decisions write an approval record with channel = WhatsApp, in the same
          grammar as the portal. Reminders stop the moment a payment webhook or a decision
          arrives — {invoice ? formatDueCompact(invoice.dueAt) : ""}
          {invoice ? " on this one." : ""}
        </p>
      </section>
    </div>
  );
}
