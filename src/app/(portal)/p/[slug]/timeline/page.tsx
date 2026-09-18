import { notFound } from "next/navigation";
import { portalContext } from "@/server/portal-session";
import { formatDate } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { StatusPill, toneForStatus } from "@/components/ui/pill";
import { PhaseBar } from "@/components/delivery/timeline";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const STATE_LABEL: Record<string, string> = {
  DONE: "Done",
  DUE: "Due",
  AT_RISK: "At risk",
  MISSED: "Missed",
  UPCOMING: "Upcoming",
};

/**
 * 6.21 · Timeline.
 *
 * Read-only and simplified — the client sees phases and the milestones the
 * agency published, and the footnote says plainly that internal tasks are not
 * shown. Nothing here implies task management, which is a non-goal.
 */
export default async function PortalTimeline({ params }: PageProps<"/p/[slug]/timeline">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, projects] = await Promise.all([ctx.q.client(), ctx.q.projects()]);
  if (projects.length === 0) notFound();

  const label =
    (await db.portalModule.findFirst({
      where: { portal: { clientId: ctx.viewer.clientId }, key: "TIMELINE" },
      select: { label: true },
    }))?.label ?? "Timeline";

  return (
    <div className="mx-auto w-full max-w-190 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">{label}</h1>
      <p className="mt-1.5 text-read text-steel">
        Where {client.name} is now, and what comes next.
      </p>

      {projects.map(async (p) => {
        const full = await ctx.q.timeline(p.id);
        if (!full) return null;
        return (
          <section key={p.id} className="mt-7">
            <h2 className="text-h2 font-semibold">{p.name}</h2>

            {full.phases.length ? (
              <Card className="mt-3 p-4">
                <PhaseBar
                  phases={full.phases.map((ph) => ({
                    name: ph.name,
                    weight: ph.weight,
                    status: ph.status,
                  }))}
                />
              </Card>
            ) : null}

            <Card className="mt-3 divide-y divide-canvas">
              {full.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-28 shrink-0 font-mono text-meta text-steel">
                    {formatDate(m.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-read text-charcoal">{m.name}</span>
                  <StatusPill tone={toneForStatus(STATE_LABEL[m.state] ?? m.state)}>
                    {STATE_LABEL[m.state] ?? m.state}
                  </StatusPill>
                </div>
              ))}
            </Card>
          </section>
        );
      })}

      <p className="mt-6 text-meta text-fog">
        Dates move as {client.agency.name} updates the plan.{" "}
        <span className="font-medium text-steel">Internal tasks are not shown here.</span>
      </p>
    </div>
  );
}
