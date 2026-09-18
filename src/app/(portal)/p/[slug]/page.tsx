import Link from "next/link";
import { portalContext } from "@/server/portal-session";
import {
  formatCount,
  formatDate,
  formatDateShort,
  formatDue,
  formatDueCompact,
} from "@/server/format";
import { hasNeedsYou } from "@/server/visibility";
import { Card } from "@/components/ui/surface";
import { StatusPill } from "@/components/ui/pill";
import { MetricStrip, ProgressRail } from "@/components/ui/chart";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/**
 * 6.20 · Portal home — the screen that decides whether a client comes back.
 *
 * Two layouts over the same data. When the account lead has written an update,
 * the portal reads like the weekly digest: a human lede, the asks named in
 * prose, and the facts in a margin. When nobody has written anything it falls
 * back to stacked blocks, which always render. The agency never has to write
 * for the portal to work, and when they do, it sounds like them.
 */
export default async function PortalHome({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);

  const [client, projects, needsYou, updates, deliverables, widgets] = await Promise.all([
    ctx.q.client(),
    ctx.q.projects(),
    ctx.q.needsYou(),
    ctx.q.updates(),
    ctx.q.deliverables(),
    ctx.q.widgets(),
  ]);

  const showNeedsYou = hasNeedsYou(ctx.viewer.role, needsYou.length);
  const lead = projects[0];
  const latest = updates[0];
  const nextMilestone = lead
    ? (await ctx.q.timeline(lead.id))?.milestones.find((m) => m.state !== "DONE")
    : null;

  const recent = deliverables.filter((d) => d.publishedAt).slice(0, 3);

  const strip = widgets
    .map((w) => ({ w, cfg: w.config as { value?: number | string; delta?: string } }))
    .filter(({ cfg }) => cfg.value !== undefined)
    .slice(0, 4)
    .map(({ w, cfg }) => ({
      label: w.title,
      value:
        typeof cfg.value === "number"
          ? formatCount(cfg.value, client.currency)
          : String(cfg.value),
      delta: cfg.delta,
      source: w.source ?? undefined,
    }));

  const phaseProgress = lead?.phases.length
    ? Math.round(
        ((lead.phases.findIndex((p) => p.status === "DUE") + 1) / lead.phases.length) * 100,
      )
    : 0;

  // 1e when a lead has written; 1d otherwise.
  const letter = Boolean(latest);

  return (
    <div className="mx-auto w-full max-w-190 px-5 pt-8 pb-16">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-display font-semibold">{client.name}</h1>
        {letter ? (
          <span className="font-mono text-meta text-steel">
            {formatDate(latest!.publishedAt ?? latest!.createdAt)}
          </span>
        ) : null}
      </header>

      {!letter ? (
        <p className="mt-1.5 text-read text-steel">
          What is happening and what needs you. Updated by {client.agency.name}.
        </p>
      ) : null}

      {letter ? (
        /* ---- 1e · the letter layout ---- */
        <div className="mt-7 grid gap-7 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="min-w-0">
            <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.02em] text-balance">
              {showNeedsYou && needsYou.length
                ? `${spell(needsYou.length)} ${needsYou.length === 1 ? "thing needs" : "things need"} you this week.`
                : "Here is where things stand."}{" "}
              {lead ? `${lead.name} is ${statusWord(lead.status)}.` : ""}
            </h2>

            <p className="mt-4 text-read leading-relaxed text-charcoal">{latest!.body}</p>

            {showNeedsYou && needsYou.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {needsYou.slice(0, 2).map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/p/${slug}/deliverables/${a.version.deliverable.id}`}
                    className={buttonVariants({
                      variant: i === 0 ? "accent" : "secondary",
                      size: "lg",
                    })}
                  >
                    Review {a.version.deliverable.name}
                  </Link>
                ))}
              </div>
            ) : null}

            {recent.length ? (
              <p className="mt-5 text-read text-steel">
                Delivered since your last visit:{" "}
                {recent.map((d) => d.name).join(", ")}.
              </p>
            ) : null}

            <Link
              href={`/p/${slug}/updates`}
              className="mt-4 inline-block text-read text-accent hover:underline"
            >
              Read {latest!.author?.name.split(" ")[0] ?? "the"} full update →
            </Link>
          </div>

          <aside className="flex flex-col gap-5 text-meta text-steel sm:border-l sm:border-ash sm:pl-6">
            {nextMilestone ? (
              <div>
                <p className="label-caps">Next milestone</p>
                <p className="mt-1 font-mono text-charcoal">{formatDate(nextMilestone.date)}</p>
                <p className="mt-0.5">{nextMilestone.name}</p>
              </div>
            ) : null}
            {lead ? (
              <div>
                <p className="label-caps">{lead.type === "CAMPAIGN" ? "Campaign" : "Project"}</p>
                <p className="mt-1 text-charcoal">{lead.name}</p>
                <ProgressRail percent={phaseProgress} className="mt-2" />
              </div>
            ) : null}
            {strip.length ? (
              <div>
                <p className="label-caps">Last 7 days</p>
                {strip.slice(0, 3).map((m) => (
                  <p key={m.label} className="mt-1.5">
                    <span className="block font-mono text-charcoal">{m.value}</span>
                    <span className="block">{m.label}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      ) : (
        /* ---- 1d · stacked blocks, the fallback that always renders ---- */
        <div className="mt-7 flex flex-col gap-7">
          {showNeedsYou && needsYou.length ? (
            <NeedsYou slug={slug} items={needsYou} />
          ) : null}

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {lead ? (
              <Card className="p-4">
                <p className="label-caps">In progress</p>
                <p className="mt-1.5 flex items-center gap-2 text-item font-medium text-charcoal">
                  {lead.name}
                  <StatusPill>{statusLabel(lead.status)}</StatusPill>
                </p>
                <ProgressRail percent={phaseProgress} className="mt-3" />
              </Card>
            ) : null}
            {nextMilestone ? (
              <Card className="p-4">
                <p className="label-caps">Next milestone</p>
                <p className="mt-1.5 font-mono text-item text-charcoal">
                  {formatDate(nextMilestone.date)} · {formatDue(nextMilestone.date)}
                </p>
                <p className="mt-0.5 text-body text-steel">{nextMilestone.name}</p>
              </Card>
            ) : null}
          </div>

          {recent.length ? (
            <section>
              <h2 className="text-h2 font-semibold">Recently delivered</h2>
              <Card className="mt-2.5 divide-y divide-canvas">
                {recent.map((d) => (
                  <Link
                    key={d.id}
                    href={`/p/${slug}/deliverables/${d.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-canvas/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-read text-charcoal">{d.name}</span>
                      <span className="block truncate text-meta text-steel">{d.type}</span>
                    </span>
                    <span className="shrink-0 font-mono text-meta text-fog">
                      {d.publishedVersion} · {formatDateShort(d.publishedAt!)}
                    </span>
                  </Link>
                ))}
              </Card>
            </section>
          ) : null}

          {strip.length ? <MetricStrip metrics={strip} /> : null}
        </div>
      )}
    </div>
  );
}

type NeedsYouItem = Awaited<ReturnType<Awaited<ReturnType<typeof portalContext>>["q"]["needsYou"]>>[number];

function NeedsYou({ slug, items }: { slug: string; items: NeedsYouItem[] }) {
  return (
    <section>
      <h2 className="text-h2 font-semibold">Needs you ({items.length})</h2>
      <Card className="mt-2.5 divide-y divide-canvas">
        {items.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="size-1.5 shrink-0 rounded-full bg-warning" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-read text-charcoal">
                Approve {a.version.deliverable.name} {a.version.label}
              </span>
              <span className="block truncate text-meta text-steel">
                {a.version.deliverable.type}
              </span>
            </span>
            {a.dueAt ? (
              <span className="shrink-0 font-mono text-meta text-warning-fg">
                {formatDueCompact(a.dueAt)}
              </span>
            ) : null}
            <Link
              href={`/p/${slug}/deliverables/${a.version.deliverable.id}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Open
            </Link>
          </div>
        ))}
      </Card>
    </section>
  );
}

function spell(n: number) {
  return ["Nothing", "One", "Two", "Three", "Four", "Five"][n] ?? String(n);
}
function statusWord(s: string) {
  return s === "ON_TRACK" ? "on track" : s === "AT_RISK" ? "at risk" : s.toLowerCase();
}
function statusLabel(s: string) {
  return s === "ON_TRACK" ? "On track" : s === "AT_RISK" ? "At risk" : s.charAt(0) + s.slice(1).toLowerCase();
}
