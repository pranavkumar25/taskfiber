import Link from "next/link";
import { Link2 } from "lucide-react";
import { ClientStage } from "@/generated/prisma/enums";
import { clientStageCounts, listClients, type ClientRow } from "@/server/clients";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDueCompact, formatSince } from "@/server/format";
import { StagePill, type Stage } from "@/components/ui/pill";
import { AddFilterPill, FilterPill } from "@/components/ui/field";
import { BrandMark } from "@/components/ui/avatar";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export const metadata = { title: "Clients" };

/**
 * 6.3 · All clients.
 *
 * Density 1g: ten rows fit at 1440×900, each cell a primary line over a
 * secondary one. The at-risk reason is written into the row, not hidden in a
 * tooltip — a health signal you cannot read is not a signal.
 */
const COLS = "minmax(240px,1fr) 150px 130px 130px 28px";

const STAGE_LABEL: Record<ClientStage, string> = {
  PROSPECT: "Prospect",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  AT_RISK: "At risk",
  RENEWAL: "Renewal",
  OFFBOARDED: "Offboarded",
};

const FILTERS: (ClientStage | "ALL")[] = [
  "ALL",
  ClientStage.ACTIVE,
  ClientStage.ONBOARDING,
  ClientStage.AT_RISK,
  ClientStage.RENEWAL,
];

export default async function ClientsPage({ searchParams }: PageProps<"/clients">) {
  const { agency } = await currentWorkspace();
  const params = await searchParams;
  const raw = typeof params.stage === "string" ? params.stage : undefined;
  const stage = raw && raw in ClientStage ? (raw as ClientStage) : undefined;

  const [clients, { total, counts }] = await Promise.all([
    listClients(agency.id, stage),
    clientStageCounts(agency.id),
  ]);

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Clients</h1>
        {FILTERS.map((f) => {
          const selected = f === "ALL" ? !stage : stage === f;
          const count = f === "ALL" ? total : (counts[f] ?? 0);
          if (f !== "ALL" && count === 0) return null;
          return (
            <Link key={f} href={f === "ALL" ? "/clients" : `/clients?stage=${f}`}>
              <FilterPill selected={selected} count={count}>
                {f === "ALL" ? "All" : STAGE_LABEL[f]}
              </FilterPill>
            </Link>
          );
        })}
        <AddFilterPill />

        <div className="ml-auto flex items-center gap-4 text-meta text-steel">
          <span>
            Views: <span className="font-medium text-charcoal">My clients</span> · Renewals Q4
          </span>
          <span>Sort: next milestone ↑</span>
        </div>
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Client</span>
          <span>Next milestone</span>
          <span>Approvals</span>
          <span>Portal</span>
          <span className="sr-only">Portal link</span>
        </TableHeader>
        {clients.map((c) => (
          <ClientListRow key={c.id} client={c} />
        ))}
      </DataTable>

      <p className="mt-3 text-meta text-steel">
        {clients.length} client{clients.length === 1 ? "" : "s"} · at-risk reasons are written into
        the row · select rows for bulk actions
      </p>
    </div>
  );
}

function ClientListRow({ client: c }: { client: ClientRow }) {
  const atRisk = c.stage === ClientStage.AT_RISK || c.stage === ClientStage.RENEWAL;
  const overdue =
    c.approvals.soonest !== null && c.approvals.soonest.getTime() < Date.now();

  // The second line: the reason, when there is one, otherwise the work itself.
  const subtitle = c.healthFlags.length
    ? c.healthFlags.join(" · ")
    : c.projectNames.join(" · ") || "No active projects";

  return (
    <TableRow cols={COLS} tall className="hover:bg-canvas/60">
      <Link href={`/clients/${c.slug}`} className="flex min-w-0 items-center gap-2.5">
        <BrandMark name={c.name} color={c.brandColor} size="lg" />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-item font-medium text-charcoal">{c.name}</span>
            <StagePill stage={STAGE_LABEL[c.stage].toLowerCase() as Stage} />
          </span>
          <span
            className={cn(
              "block truncate text-meta",
              c.healthFlags.length ? "text-warning-fg" : "text-steel",
            )}
          >
            {subtitle}
          </span>
        </span>
      </Link>

      <span className="min-w-0">
        {c.nextMilestone ? (
          <>
            <span className="block truncate font-mono text-meta text-charcoal">
              {formatDate(c.nextMilestone.date)}
            </span>
            <span className="block truncate text-meta text-steel">{c.nextMilestone.name}</span>
          </>
        ) : (
          <span className="block text-meta text-fog">Not set</span>
        )}
      </span>

      <span className="min-w-0">
        {c.approvals.count ? (
          <>
            <span
              className={cn(
                "block font-mono text-meta",
                overdue ? "text-danger-fg" : "text-charcoal",
              )}
            >
              {c.approvals.count} open
            </span>
            {c.approvals.soonest ? (
              <span
                className={cn(
                  "block truncate text-meta",
                  overdue ? "text-danger-fg" : "text-steel",
                )}
              >
                {formatDueCompact(c.approvals.soonest)}
              </span>
            ) : null}
          </>
        ) : (
          <span className="block font-mono text-meta text-fog">—</span>
        )}
      </span>

      <span className="min-w-0">
        <span
          className={cn(
            "block font-mono text-meta",
            c.lastPortalActivity ? "text-charcoal" : "text-fog",
          )}
        >
          {formatSince(c.lastPortalActivity)}
        </span>
        <span className="block truncate text-meta text-steel">
          {c.lastPortalActivity ? (c.lastVisitor ?? "—") : "Portal not sent"}
        </span>
      </span>

      <button
        type="button"
        title="Copy portal link"
        className="inline-flex size-7 items-center justify-center rounded-control text-fog hover:bg-canvas hover:text-charcoal"
      >
        <Link2 className="size-3.5" strokeWidth={1.5} />
      </button>
    </TableRow>
  );
}
