import { Lock } from "lucide-react";
import { portalContext } from "@/server/portal-session";
import { canSeeInvoices } from "@/server/visibility";
import { formatDate, formatDueCompact, formatMoney } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { AgingPill, SourceBadge, StatusPill } from "@/components/ui/pill";
import { DeniedState } from "@/components/ui/feedback";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const PAY_LABEL: Record<string, string> = {
  RAZORPAY_UPI: "Pay with UPI or card",
  RAZORPAY_CARD: "Pay with UPI or card",
  STRIPE_CARD: "Pay by card",
  BANK_TRANSFER: "Pay by transfer",
};

const RAIL_SENTENCE: Record<string, string> = {
  RAZORPAY_UPI: "UPI and cards via Razorpay.",
  RAZORPAY_CARD: "UPI and cards via Razorpay.",
  STRIPE_CARD: "Cards and bank transfer via Stripe.",
  BANK_TRANSFER: "Bank transfer.",
};

/**
 * 6.26 · Invoices, and the state a collaborator gets instead.
 *
 * The nav link is deliberately left visible to everyone. Hiding it would leave
 * a collaborator wondering; showing the policy, and naming the person to ask,
 * resolves it socially — which is how it actually gets resolved.
 */
export default async function PortalInvoices({ params }: PageProps<"/p/[slug]/invoices">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const client = await ctx.q.client();

  if (!canSeeInvoices(ctx.viewer.role)) {
    const approver = await db.contact.findFirst({
      where: { clientId: ctx.viewer.clientId, role: "APPROVER" },
      select: { name: true },
    });
    return (
      <div className="mx-auto w-full max-w-190 px-5">
        <DeniedState
          icon={<Lock className="size-4.5" strokeWidth={1.5} aria-hidden />}
          title="Invoices are not shared with your role"
        >
          {client.agency.name} shares invoices with the approver and billing contact at{" "}
          {client.name}. If you need access, ask {approver?.name ?? "your account lead"}.
        </DeniedState>
      </div>
    );
  }

  const [invoices, contacts] = await Promise.all([
    ctx.q.invoices(),
    db.contact.findMany({
      where: { clientId: ctx.viewer.clientId, role: { in: ["APPROVER", "BILLING"] } },
      select: { name: true, role: true },
    }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((n, i) => n + Number(i.amount), 0);
  const rail = invoices.find((i) => i.paymentRail)?.paymentRail ?? "RAZORPAY_UPI";
  const me = ctx.contact.name;

  return (
    <div className="mx-auto w-full max-w-190 px-5 pt-8 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">Invoices</h1>
          <p className="mt-1.5 text-read text-steel">
            Visible to{" "}
            {contacts
              .map((c) => `${c.name} (${c.role.toLowerCase()})`)
              .join(" and ")}{" "}
            only.
          </p>
        </div>
        <SourceBadge>Zoho Books · synced recently</SourceBadge>
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="label-caps">Outstanding</p>
          <p className="mt-1 font-mono text-h1 font-medium text-charcoal">
            {formatMoney(outstanding, client.currency)}
          </p>
        </div>
        <p className="max-w-xs text-body text-steel">
          {RAIL_SENTENCE[rail]} Receipts are emailed to {me}.
        </p>
      </Card>

      <Card className="mt-4 divide-y divide-canvas">
        {invoices.map((i) => {
          const late = i.status === "OVERDUE";
          const paid = i.status === "PAID";
          return (
            <div key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-body text-charcoal">{i.number}</span>
                <span className="block font-mono text-meta text-steel">
                  Issued {formatDate(i.issuedAt)} · Due {formatDate(i.dueAt)}
                </span>
              </span>
              <span className="tabular shrink-0 text-h3 text-charcoal">
                {formatMoney(Number(i.amount), i.currency, { decimals: i.currency !== "INR" })}
              </span>
              <AgingPill tone={late ? "danger" : "neutral"}>
                {paid && i.paidAt ? `Paid ${formatDate(i.paidAt)}` : formatDueCompact(i.dueAt)}
              </AgingPill>
              <StatusPill tone={late ? "danger" : paid ? "success" : "info"}>
                {i.status.charAt(0) + i.status.slice(1).toLowerCase()}
              </StatusPill>
              {paid ? (
                <Button variant="secondary" size="sm">
                  Receipt
                </Button>
              ) : (
                <Button variant="accent" size="sm">
                  {PAY_LABEL[i.paymentRail ?? "RAZORPAY_UPI"]}
                </Button>
              )}
            </div>
          );
        })}
      </Card>

      <p className="mt-4 text-meta text-fog">
        {client.gstin ? `GSTIN ${client.gstin} · Amounts include 18% GST. ` : ""}
        Invoices are issued by {client.agency.name} from their accounting system; this portal shows
        their status and does not replace the invoice document.
      </p>
    </div>
  );
}
