import { db } from "@/server/db";
import { accountingHealth, getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDueCompact, formatMoney, formatSince } from "@/server/format";
import { Banner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Card, DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { AgingPill, SourceBadge, StatusPill } from "@/components/ui/pill";

export const metadata = { title: "Finance" };

const COLS = "140px 130px 110px 110px 110px 120px minmax(0,1fr)";
const RAIL: Record<string, string> = {
  RAZORPAY_UPI: "Razorpay · UPI",
  RAZORPAY_CARD: "Razorpay · card",
  STRIPE_CARD: "Stripe · card",
  BANK_TRANSFER: "Bank transfer",
};

/**
 * 6.15 · Client record, Finance.
 *
 * This is a read of the agency's ledger, and the header says so rather than
 * pretending otherwise. Nothing here is editable, because the accounts person
 * is not leaving their accounting tool and should not have to.
 */
export default async function FinanceTab({ params }: PageProps<"/clients/[slug]/finance">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);
  const accounting = await accountingHealth(agency.id);

  const invoices = await db.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { issuedAt: "desc" },
  });

  const outstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((n, i) => n + Number(i.amount), 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const paidThisYear = invoices
    .filter((i) => i.status === "PAID" && i.paidAt && i.paidAt.getFullYear() === 2026)
    .reduce((n, i) => n + Number(i.amount), 0);
  const paid = invoices.filter((i) => i.paidAt);
  const avgDays = paid.length
    ? paid.reduce(
        (n, i) => n + (i.paidAt!.getTime() - i.issuedAt.getTime()) / 86400000,
        0,
      ) / paid.length
    : 0;

  const billingContacts = client.contacts.filter(
    (c) => c.role === "BILLING" || c.role === "APPROVER",
  );

  return (
    <div className="px-8 pt-6 pb-24">
      {accounting.failing ? (
        <Banner
          tone="warning"
          className="mb-4"
          action={<Button variant="neutral" size="xs">Reconnect</Button>}
        >
          {accounting.provider} sync failed {formatSince(accounting.syncedAt)}. Amounts may be
          stale.
        </Banner>
      ) : null}

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-h3 font-semibold">Invoices</h2>
          <p className="mt-0.5 text-meta text-steel">
            Read from {accounting.provider}.{" "}
            <span className="font-medium text-charcoal">
              This is not a ledger; edit invoices in {accounting.provider}.
            </span>
          </p>
        </div>
        <SourceBadge failed={accounting.failing}>
          {accounting.provider} ·{" "}
          {accounting.failing
            ? `sync failed ${formatSince(accounting.syncedAt)}`
            : `synced ${formatSince(accounting.syncedAt)}`}
        </SourceBadge>
      </div>

      <div
        className="mb-4 grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <Stat label="Outstanding" value={formatMoney(outstanding, client.currency)} />
        <Stat
          label="Overdue"
          value={formatMoney(
            overdue.reduce((n, i) => n + Number(i.amount), 0),
            client.currency,
          )}
          note={overdue.length ? formatDueCompact(overdue[0].dueAt) : undefined}
          danger={overdue.length > 0}
        />
        <Stat label="Paid in 2026" value={formatMoney(paidThisYear, client.currency)} />
        <Stat label="Average days to pay" value={avgDays ? avgDays.toFixed(1) : "—"} />
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Number</span>
          <span>Amount</span>
          <span>Issued</span>
          <span>Due</span>
          <span>Status</span>
          <span>Aging</span>
          <span>Portal</span>
        </TableHeader>
        {invoices.map((i) => {
          const late = i.status === "OVERDUE";
          return (
            <TableRow key={i.id} cols={COLS}>
              <span className="font-mono text-meta text-charcoal">{i.number}</span>
              <span className="tabular text-charcoal">
                {formatMoney(Number(i.amount), i.currency, { decimals: i.currency !== "INR" })}
              </span>
              <span className="font-mono text-meta text-fog">{formatDate(i.issuedAt)}</span>
              <span className="font-mono text-meta text-fog">{formatDate(i.dueAt)}</span>
              <StatusPill tone={late ? "danger" : i.status === "PAID" ? "success" : "info"}>
                {i.status.charAt(0) + i.status.slice(1).toLowerCase()}
              </StatusPill>
              <AgingPill tone={late ? "danger" : "neutral"}>
                {late
                  ? formatDueCompact(i.dueAt)
                  : i.paidAt
                    ? `Paid ${formatDate(i.paidAt)}`
                    : formatDueCompact(i.dueAt)}
              </AgingPill>
              <span className="truncate text-meta text-steel">
                {i.status === "PAID"
                  ? (RAIL[i.paymentRail ?? ""] ?? "—")
                  : `Visible to ${billingContacts.map((c) => c.name).join(", ")}${
                      i.viewedAt ? ` · viewed ${formatDate(i.viewedAt)}` : ""
                    }${i.paymentLink ? " · pay link live" : ""}`}
              </span>
            </TableRow>
          );
        })}
      </DataTable>

      <p className="mt-3 text-meta text-steel">
        {client.gstin ? `GSTIN ${client.gstin} · ` : ""}Amounts include {client.taxRatePercent}%
        GST · Payment reminders are{" "}
        {client.paymentRemindersEnabled ? "on" : "off"} for this client.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  danger,
}: {
  label: string;
  value: string;
  note?: string;
  danger?: boolean;
}) {
  return (
    <Card className="p-3">
      <p className="text-meta text-steel">{label}</p>
      <p
        className={`mt-1 font-mono text-[18px] font-medium ${
          danger ? "text-danger-fg" : "text-charcoal"
        }`}
      >
        {value}
      </p>
      {note ? <p className="mt-0.5 text-meta text-danger-fg">{note}</p> : null}
    </Card>
  );
}
