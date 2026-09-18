import Link from "next/link";
import { portalContext } from "@/server/portal-session";
import { formatDate } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { StatusPill, VersionTag } from "@/components/ui/pill";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "Awaiting your approval",
  APPROVED: "Approved",
  DELIVERED: "Delivered",
};

/** 6.22 · Deliverables. Everything the agency has published, previewable in place. */
export default async function PortalDeliverables({
  params,
}: PageProps<"/p/[slug]/deliverables">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, rows] = await Promise.all([ctx.q.client(), ctx.q.deliverables()]);

  return (
    <div className="mx-auto w-full max-w-190 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Deliverables</h1>
      <p className="mt-1.5 text-read text-steel">
        Everything {client.agency.name} has published.{" "}
        <span className="font-medium text-charcoal">
          Preview in the browser, no download needed.
        </span>
      </p>

      <Card className="mt-6 divide-y divide-canvas">
        {rows.map((d) => (
          <Link
            key={d.id}
            href={`/p/${slug}/deliverables/${d.id}`}
            className="flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-canvas/50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-chip bg-canvas text-meta text-fog">
              {d.type.slice(0, 3).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-read text-charcoal">{d.name}</span>
              <span className="block truncate text-meta text-steel">
                {d.assetSummary ?? d.type}
              </span>
            </span>
            <VersionTag current>{d.publishedVersion ?? d.versions[0]?.label}</VersionTag>
            <StatusPill>{STATUS_LABEL[d.status] ?? d.status}</StatusPill>
            <span className="w-24 shrink-0 text-right font-mono text-meta text-fog">
              {d.publishedAt ? formatDate(d.publishedAt) : ""}
            </span>
          </Link>
        ))}
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-read text-steel">
            Nothing has been published yet.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
