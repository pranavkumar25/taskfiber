import Link from "next/link";
import { Link2 } from "lucide-react";
import { ClientStage } from "@/generated/prisma/enums";
import { clientStageCounts, listClients, type ClientRow } from "@/server/clients";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDueCompact, formatSince } from "@/server/format";
import { nowMs } from "@/server/now";
import { StagePill, type Stage } from "@/components/ui/pill";
import { AddFilterPill, FilterPill } from "@/components/ui/field";
import { BrandMark } from "@/components/ui/avatar";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
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

  // Key state · empty workspace. Drive is already connected at this point, so
  // the useful offer is to import what it already found, not to start typing.
  if (total === 0) {
    return (
      <div className="px-8 pt-8 pb-24">
        <h1 className="text-h1 font-semibold">Clients</h1>
        <EmptyState
          className="mt-6 py-16"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary">Import from Drive</Button>
              <Button variant="secondary">Add one client</Button>
            </div>
          }
        >
          <span className="block text-h3 font-semibold text-charcoal">
            Your workspace is ready. No clients yet.
          </span>
          <span className="mt-1.5 block">
            Drive is connected. Add the first client, or import the folders it already found
            under your clients root.
          </span>
        </EmptyState>
      </div>
    );
  }

  // Key state · first client. The portal link is the last onboarding step, and
  // until it is sent the client sees nothing at all — so say so.
  const firstRun = total === 1 && !clients[0]?.portalSentAt;

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

      {firstRun ? (
        <div className="mt-4 border-t border-dashed border-smoke pt-4">
          <p className="text-body font-medium text-charcoal">
            Next: build {clients[0].name}&rsquo;s portal from the template
          </p>
          <p className="mt-1 max-w-xl text-body text-steel">
            Sending the portal link is the last step.{" "}
            <span className="font-medium text-charcoal">
              Nothing is visible to {clients[0].contacts[0]?.name ?? "them"} until you do.
            </span>
          </p>
          <Link
            href={`/clients/${clients[0].slug}/portal`}
            className="mt-3 inline-block"
          >
            <Button variant="primary" size="sm">
              Continue onboarding
            </Button>
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-meta text-steel">
          {clients.length} client{clients.length === 1 ? "" : "s"} · at-risk reasons are written
          into the row · select rows for bulk actions
        </p>
      )}
    </div>
  );
}

function ClientListRow({ client: c }: { client: ClientRow }) {
  const overdue =
    c.approvals.soonest !== null && c.approvals.soonest.getTime() < nowMs();

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
