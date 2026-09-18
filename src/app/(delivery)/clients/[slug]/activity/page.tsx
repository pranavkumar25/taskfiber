import Link from "next/link";
import { db } from "@/server/db";
import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { Card } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { ActivityRow } from "@/components/delivery/activity";

export const metadata = { title: "Activity" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "client", label: "Client actions" },
  { key: "publishes", label: "Publishes" },
  { key: "drive", label: "Drive" },
] as const;

/**
 * Client record · Activity — the audit trail.
 *
 * Visibility changes matter most here, so publishes get their own filter and
 * every row carries the state it moved to.
 */
export default async function ActivityTab({
  params,
  searchParams,
}: PageProps<"/clients/[slug]/activity">) {
  const { slug } = await params;
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : "all";

  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const where =
    filter === "client"
      ? { clientId: client.id, actorIsClient: true }
      : filter === "publishes"
        ? { clientId: client.id, verb: { in: ["published", "unpublished"] } }
        : filter === "drive"
          ? { clientId: client.id, source: "DRIVE" as const }
          : { clientId: client.id };

  const rows = await db.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-3xl px-8 pt-6 pb-24">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? `/clients/${slug}/activity` : `?filter=${f.key}`}
          >
            <FilterPill selected={filter === f.key}>{f.label}</FilterPill>
          </Link>
        ))}
      </div>

      <Card className="px-4 py-1">
        {rows.map((a) => (
          <ActivityRow
            key={a.id}
            item={{
              id: a.id,
              actorName: a.actorName,
              actorIsClient: a.actorIsClient,
              verb: a.verb,
              objectName: a.objectName,
              detail: a.detail,
              source: a.source,
              visibility: a.visibility,
              createdAt: a.createdAt,
            }}
          />
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-body text-steel">Nothing yet under this filter.</p>
        ) : null}
      </Card>
    </div>
  );
}
