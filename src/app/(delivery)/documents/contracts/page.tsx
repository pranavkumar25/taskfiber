import Link from "next/link";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDueCompact, formatMoney } from "@/server/format";
import { nowMs } from "@/server/now";
import { Banner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/pill";
import { BrandMark } from "@/components/ui/avatar";

export const metadata = { title: "Contracts and renewals" };
export const dynamic = "force-dynamic";

const COLS = "minmax(0,1.4fr) minmax(0,1.6fr) 130px 180px 110px 120px 110px";

/** 6.14 · Renewals across clients. Renewal is where agency revenue leaks. */
export default async function RenewalsPage() {
  const { agency } = await currentWorkspace();

  const contracts = await db.contract.findMany({
    where: { client: { agencyId: agency.id } },
    orderBy: [{ termEnd: "asc" }],
    include: { client: { select: { name: true, slug: true, brandColor: true } } },
  });

  const now = nowMs();
  const soon = contracts.filter(
    (c) => c.termEnd && c.termEnd.getTime() - now <= 90 * 86400000 && c.termEnd.getTime() > now,
  );
  const urgent = soon.filter((c) => c.termEnd!.getTime() - now <= 30 * 86400000);

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Contracts and renewals</h1>
        <FilterPill selected count={soon.length}>
          Next 90 days
        </FilterPill>
        <FilterPill count={contracts.filter((c) => c.status === "ACTIVE").length}>
          All active
        </FilterPill>
        <FilterPill count={contracts.filter((c) => c.status === "DRAFT" || c.status === "SENT").length}>
          Drafts and sent
        </FilterPill>
      </div>

      {urgent.map((c) => (
        <Banner
          key={c.id}
          tone="warning"
          className="mb-3"
          action={<Button variant="neutral" size="xs">Draft renewal</Button>}
        >
          {c.client.name} contract ends{" "}
          <span className="font-mono">{formatDate(c.termEnd!)}</span> (
          {formatDueCompact(c.termEnd!).replace("due ", "")}). No renewal has been sent. The
          renewal signal is written back to the CRM.
        </Banner>
      ))}

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Client</span>
          <span>Contract</span>
          <span>Value</span>
          <span>Term</span>
          <span>Ends in</span>
          <span>Alert</span>
          <span>Status</span>
        </TableHeader>
        {contracts.map((c) => {
          const days = c.termEnd ? Math.round((c.termEnd.getTime() - now) / 86400000) : null;
          return (
            <TableRow key={c.id} cols={COLS}>
              <Link
                href={`/clients/${c.client.slug}/contract`}
                className="flex min-w-0 items-center gap-2 hover:underline"
              >
                <BrandMark name={c.client.name} color={c.client.brandColor} size="sm" />
                <span className="truncate text-charcoal">{c.client.name}</span>
              </Link>
              <span className="truncate text-steel">{c.title}</span>
              <span className="tabular text-meta text-charcoal">
                {formatMoney(Number(c.annualValue ?? 0), c.currency)}
              </span>
              <span className="truncate font-mono text-meta text-fog">
                {c.termStart ? formatDate(c.termStart) : "—"} –{" "}
                {c.termEnd ? formatDate(c.termEnd) : "—"}
              </span>
              <span
                className={`font-mono text-meta ${
                  days !== null && days <= 30 ? "text-warning-fg" : "text-steel"
                }`}
              >
                {days === null ? "—" : days < 0 ? "ended" : `${days} days`}
              </span>
              <span className="font-mono text-meta text-fog">
                {c.alertsFired.length
                  ? `${c.alertsFired.length} sent`
                  : days !== null && days <= 90
                    ? "90 d due"
                    : "—"}
              </span>
              <StatusPill>{c.status.charAt(0) + c.status.slice(1).toLowerCase()}</StatusPill>
            </TableRow>
          );
        })}
      </DataTable>

      <p className="mt-3 text-meta text-steel">
        Alerts fire at 90, 60 and 30 days. A portal keeps working after a contract expires; it
        becomes read-only only when the client is offboarded.
      </p>
    </div>
  );
}
