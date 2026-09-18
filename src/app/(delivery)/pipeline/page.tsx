import { getPipeline } from "@/server/cross-client";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatMoney, formatSince } from "@/server/format";
import { nowMs } from "@/server/now";
import { Banner } from "@/components/ui/feedback";
import { Card } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { SourceBadge } from "@/components/ui/pill";
import { HandoffButton } from "@/components/delivery/handoff";

export const metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

const COLUMNS = [
  { stage: "PROPOSAL", label: "Proposal" },
  { stage: "NEGOTIATION", label: "Negotiation" },
  { stage: "VERBAL_YES", label: "Verbal yes" },
  { stage: "WON", label: "Won · needs handoff" },
] as const;

/**
 * 6.13 · Pipeline.
 *
 * We do not own the pipeline and the screen says so out loud. What we own is
 * the handoff: one action turns a won deal into a client with a portal and a
 * running onboarding checklist, and nothing is re-typed.
 */
export default async function PipelinePage() {
  const { agency } = await currentWorkspace();
  const { deals, crm } = await getPipeline(agency.id);

  const closingSoon = deals.filter((d) => {
    if (!d.closeDate) return false;
    const days = (d.closeDate.getTime() - nowMs()) / 86400000;
    return days <= 45 && d.stage !== "WON";
  });

  const weighted = deals
    .filter((d) => d.stage !== "WON")
    .reduce((n, d) => n + Number(d.value ?? 0) * weightFor(d.stage), 0);

  return (
    <div className="px-8 pt-8 pb-24">
      {crm ? (
        <Banner
          tone="info"
          className="mb-4"
          action={
            <SourceBadge>
              {crm.provider} · synced {formatSince(crm.syncedAt)}
            </SourceBadge>
          }
        >
          Read from {crm.provider}.{" "}
          <span className="font-medium">Manage deals in {crm.provider}.</span>
        </Banner>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Pipeline</h1>
        <FilterPill selected count={closingSoon.length}>
          Closing soon
        </FilterPill>
        <FilterPill count={deals.length}>All open</FilterPill>
        <span className="ml-auto text-meta text-steel">
          Weighted ·{" "}
          <span className="font-mono text-charcoal">{formatMoney(weighted, "INR")}</span>
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const inColumn = deals.filter((d) => d.stage === col.stage);
          return (
            <section key={col.stage} className="min-w-0">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="label-caps">{col.label}</span>
                <span className="font-mono text-meta text-fog">{inColumn.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {inColumn.map((d) => {
                  const won = d.stage === "WON";
                  const soon =
                    d.closeDate &&
                    (d.closeDate.getTime() - nowMs()) / 86400000 <= 14 &&
                    !won;
                  return (
                    <Card
                      key={d.id}
                      className={
                        won
                          ? "border-success/40 p-3 shadow-none"
                          : soon
                            ? "border-warning/40 p-3 shadow-none"
                            : "p-3 shadow-none"
                      }
                    >
                      <div className="flex items-start gap-2">
                        {won ? (
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                        ) : null}
                        <span className="min-w-0 flex-1 text-body font-medium text-charcoal">
                          {d.name}
                        </span>
                      </div>
                      <p className="mt-1.5 font-mono text-meta text-steel">
                        {formatMoney(Number(d.value ?? 0), d.currency)}
                        {d.cadence ?? ""}
                        {d.closeDate
                          ? ` · ${won ? "won" : "close"} ${formatDate(d.closeDate)}`
                          : ""}
                      </p>
                      {d.ownerName ? (
                        <p className="mt-1 text-meta text-fog">Owner: {d.ownerName}</p>
                      ) : null}
                      {d.note ? (
                        <p className="mt-1.5 text-meta text-steel">{d.note}</p>
                      ) : null}
                      {won ? (
                        <HandoffButton
                          deal={{
                            id: d.id,
                            name: d.name,
                            company: d.company,
                            contacts: (d.contacts as { name: string; proposedRole: string }[]) ?? [],
                          }}
                          className="mt-3"
                        />
                      ) : null}
                    </Card>
                  );
                })}
                {inColumn.length === 0 ? (
                  <p className="rounded-card border border-dashed border-smoke px-3 py-6 text-center text-meta text-fog">
                    Nothing here
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Rough stage weighting, used only for the header's forecast number. */
function weightFor(stage: string) {
  return stage === "VERBAL_YES" ? 0.8 : stage === "NEGOTIATION" ? 0.5 : 0.2;
}
