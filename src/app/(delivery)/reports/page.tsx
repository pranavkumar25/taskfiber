import Link from "next/link";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { StatusPill } from "@/components/ui/pill";
import { BrandMark } from "@/components/ui/avatar";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { agency } = await currentWorkspace();
  const reports = await db.report.findMany({
    where: { client: { agencyId: agency.id } },
    orderBy: { period: "desc" },
    include: { client: { select: { name: true, slug: true, brandColor: true } } },
  });

  return (
    <div className="px-8 pt-8 pb-24">
      <h1 className="text-h1 font-semibold">Reports</h1>
      <p className="mt-1 text-meta text-steel">
        The monthly report assembles itself from the work and the metrics. A human still edits and
        publishes it.
      </p>

      <div
        className="mt-4 grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {reports.map((r) => (
          <Link key={r.id} href={`/reports/${r.client.slug}/${r.period}`}>
            <Card className="h-full p-4 hover:border-smoke hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <BrandMark name={r.client.name} color={r.client.brandColor} size="sm" />
                  <span className="truncate text-body font-medium text-charcoal">
                    {r.client.name}
                  </span>
                </span>
                <StatusPill tone={r.state === "PUBLISHED" ? "success" : "neutral"}>
                  {r.state === "PUBLISHED" ? "Published" : "Draft"}
                </StatusPill>
              </div>
              <p className="mt-2 text-body text-charcoal">{r.title}</p>
              <p className="mt-1 font-mono text-meta text-fog">{r.period}</p>
              {r.scheduleEnabled ? (
                <p className="mt-2.5 border-t border-canvas pt-2 text-meta text-steel">
                  {r.scheduleCadence}
                  {r.scheduleDraftFirst ? " · draft for review first" : " · sends directly"}
                </p>
              ) : null}
            </Card>
          </Link>
        ))}
        {reports.length === 0 ? (
          <p className="text-body text-steel">No reports yet.</p>
        ) : null}
      </div>
    </div>
  );
}
