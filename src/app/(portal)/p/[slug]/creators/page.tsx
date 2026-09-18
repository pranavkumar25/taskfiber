import { portalContext } from "@/server/portal-session";
import { formatCompact, formatCount, formatDate, formatMoney, formatSince } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { StatusPill, toneForStatus } from "@/components/ui/pill";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  BRIEFED: "Briefed",
  CONTRACTED: "Contracted",
  CONTENT_IN_REVIEW: "Content in review",
  POSTED: "Posted",
};

/**
 * Creators — the module that makes influencer and talent viable.
 *
 * Whether the brand sees what each creator is paid is the agency's call, set on
 * the portal config. Default is to show it, because pass-through billing is
 * usually disclosed — but an agency that prices all-in can turn it off, and the
 * flag hides it here, on Contracts and in the invoice footnote together.
 */
export default async function PortalCreators({ params }: PageProps<"/p/[slug]/creators">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, roster, portal] = await Promise.all([
    ctx.q.client(),
    ctx.q.roster(),
    db.portalConfig.findUniqueOrThrow({
      where: { clientId: ctx.viewer.clientId },
      select: { showCreatorFees: true },
    }),
  ]);

  const posts = roster.flatMap((r) => r.posts.map((p) => ({ ...p, handle: r.handle })));
  const cols = portal.showCreatorFees
    ? "minmax(0,2fr) 1.2fr 0.8fr 1.4fr 1fr 1fr 1.2fr"
    : "minmax(0,2fr) 1.2fr 0.8fr 1.4fr 1fr 1.2fr";

  return (
    <div className="mx-auto w-full max-w-240 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Creators</h1>
      <p className="mt-1.5 text-read text-steel">
        The creators on {client.name}&rsquo;s campaign, and how their posts are doing.
      </p>

      <Card className="mt-6 overflow-hidden">
        <div
          className="label-caps hidden gap-3 border-b border-ash bg-canvas px-4 py-2 md:grid"
          style={{ gridTemplateColumns: cols }}
        >
          <span>Creator</span>
          <span>Channels</span>
          <span>Followers</span>
          <span>Deliverables</span>
          <span>Posting</span>
          {portal.showCreatorFees ? <span>Fee</span> : null}
          <span>Status</span>
        </div>

        {roster.map((r) => (
          <div
            key={r.id}
            className="grid gap-3 border-b border-canvas px-4 py-3 last:border-b-0 md:items-center"
            style={{ gridTemplateColumns: cols }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-meta font-semibold text-white"
                style={{ background: r.avatarColor }}
              >
                {r.realName[0]}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-body text-charcoal">
                  {r.handle}
                </span>
                <span className="block truncate text-meta text-steel">{r.realName}</span>
              </span>
            </span>
            <span className="truncate text-meta text-steel">{r.channels.join(", ")}</span>
            <span className="font-mono text-meta text-charcoal">
              {r.followers ? formatCompact(r.followers) : "—"}
            </span>
            <span className="truncate text-meta text-steel">{r.deliverableSummary}</span>
            <span className="font-mono text-meta text-steel">
              {r.postingDate ? formatDate(r.postingDate) : "—"}
            </span>
            {portal.showCreatorFees ? (
              <span className="tabular text-meta text-charcoal">
                {r.feeAmount ? formatMoney(Number(r.feeAmount), client.currency) : "—"}
              </span>
            ) : null}
            <StatusPill tone={toneForStatus(STATUS_LABEL[r.status])}>
              {STATUS_LABEL[r.status]}
            </StatusPill>
          </div>
        ))}
      </Card>

      {posts.length ? (
        <section className="mt-8">
          <h2 className="text-h2 font-semibold">Post performance</h2>
          <Card className="mt-2.5 divide-y divide-canvas">
            {posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-body text-charcoal">
                    {p.handle}
                  </span>
                  <span className="block truncate text-meta text-steel">
                    {p.kind}
                    {p.postedAt ? ` · ${formatDate(p.postedAt)}` : ""}
                  </span>
                </span>
                <Metric label="Reach" value={p.reach ? formatCount(p.reach, "INR") : "—"} />
                <Metric label="Engagement" value={p.engagement ? `${p.engagement}%` : "—"} />
                <Metric label="Likes" value={p.likes ? formatCount(p.likes, "INR") : "—"} />
                <Metric label="Saves" value={p.saves ? formatCount(p.saves, "INR") : "—"} />
                <span className="shrink-0 text-right text-meta text-fog">
                  {p.source} · synced {formatSince(p.syncedAt)}
                </span>
              </div>
            ))}
          </Card>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="shrink-0">
      <span className="block text-meta text-steel">{label}</span>
      <span className="block font-mono text-body text-charcoal">{value}</span>
    </span>
  );
}
