import Link from "next/link";
import { getHome } from "@/server/home";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDueCompact, formatSince } from "@/server/format";
import { Card, CardHead } from "@/components/ui/surface";
import { StatusDot } from "@/components/ui/pill";
import { InternalTag } from "@/components/ui/visibility";
import { cn } from "@/lib/utils";

export const metadata = { title: "Home" };

/**
 * 6.2 · Home.
 *
 * The four numbers at the top are the plan's own metrics, not vanity: portals
 * actually opened, how much of the client's work happens outside the portal,
 * approval turnaround, and whether the integrations are healthy. The north star
 * is client-side, so it is the first thing on the screen.
 */
export default async function HomePage() {
  const { agency } = await currentWorkspace();
  const home = await getHome(agency.id);
  const today = new Date();

  const weekNumber = Math.ceil(
    ((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
  );

  const needsYou = [
    ...home.pastSla.map((a) => ({
      key: `sla-${a.id}`,
      tone: "danger" as const,
      text: `${a.version.deliverable.name} ${a.version.label} is past its approval SLA`,
      client: a.version.deliverable.client.name,
      href: `/clients/${a.version.deliverable.client.slug}/deliverables?d=${a.version.deliverable.id}`,
      when: a.dueAt ? formatDueCompact(a.dueAt) : "",
    })),
    ...home.requests.map((r) => ({
      key: `req-${r.id}`,
      tone: "warning" as const,
      text: `Request raised: ${r.details.slice(0, 64)}`,
      client: r.client.name,
      href: `/clients/${r.client.slug}`,
      when: formatSince(r.createdAt),
    })),
    ...home.stats.integrations.failing.map((p) => ({
      key: `int-${p}`,
      tone: "danger" as const,
      text: `${p} sync failed — reconnect`,
      client: "Integrations",
      href: "/integrations",
      when: "",
    })),
    ...home.atRisk.map((c) => ({
      key: `risk-${c.id}`,
      tone: "warning" as const,
      text: c.healthFlags[0],
      client: c.name,
      href: `/clients/${c.slug}`,
      when: formatSince(c.lastPortalActivity),
    })),
  ];

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-h1 font-semibold">
          {today.toLocaleDateString("en-GB", { weekday: "long" })}, {formatDate(today)}
        </h1>
        <span className="font-mono text-meta text-steel">Week {weekNumber}</span>
      </div>

      <div
        className="mt-5 grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat
          label="Portals opened this month"
          value={`${home.stats.portalsOpened.opened} of ${home.stats.portalsOpened.total}`}
          note="clients"
        />
        <Stat
          label="Client actions from email or WhatsApp"
          value={`${home.stats.channelShare}%`}
          note="of decisions"
        />
        <Stat
          label="Approval turnaround"
          value={home.stats.turnaround ? `${home.stats.turnaround.toFixed(1)} d` : "—"}
          note="request to decision"
        />
        <Stat
          label="Integrations connected"
          value={String(home.stats.integrations.connected)}
          note={
            home.stats.integrations.failing.length
              ? `${home.stats.integrations.failing.length} failing`
              : "all healthy"
          }
          alert={home.stats.integrations.failing.length > 0}
        />
      </div>

      <div
        className="mt-6 grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}
      >
        <section className="min-w-0">
          <CardHead title={`Needs you · ${needsYou.length}`} className="mb-2.5" />
          <Card className="divide-y divide-canvas">
            {needsYou.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-canvas/60"
              >
                <StatusDot tone={n.tone} />
                <span className="min-w-0 flex-1 truncate text-body text-charcoal">{n.text}</span>
                <span className="w-28 shrink-0 truncate text-meta text-steel">{n.client}</span>
                <span className="w-24 shrink-0 text-right font-mono text-meta text-fog">
                  {n.when}
                </span>
              </Link>
            ))}
            {needsYou.length === 0 ? (
              <p className="px-3 py-6 text-center text-body text-steel">Nothing waiting on you.</p>
            ) : null}
          </Card>
        </section>

        <div className="flex min-w-0 flex-col gap-6">
          <section>
            <CardHead
              title="Waiting on clients"
              action={
                <span className="text-meta text-warning-fg">{home.pastSla.length} past SLA</span>
              }
              className="mb-2.5"
            />
            <Card className="divide-y divide-canvas">
              {home.openApprovals.map((a) => {
                const late = a.dueAt && a.dueAt.getTime() < Date.now();
                return (
                  <Link
                    key={a.id}
                    href="/documents/approvals"
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-canvas/60"
                  >
                    <span className="min-w-0 flex-1 truncate text-body text-charcoal">
                      {a.version.deliverable.name} {a.version.label}
                      <span className="text-steel"> · {a.approver.name}</span>
                    </span>
                    <span className="w-28 shrink-0 truncate text-meta text-steel">
                      {a.version.deliverable.client.name}
                    </span>
                    <span
                      className={cn(
                        "w-24 shrink-0 text-right font-mono text-meta",
                        late ? "text-danger-fg" : "text-steel",
                      )}
                    >
                      {a.dueAt ? formatDueCompact(a.dueAt) : ""}
                    </span>
                  </Link>
                );
              })}
            </Card>
          </section>

          <section>
            <CardHead
              title={`Publishing this week · ${home.publishing.length}`}
              className="mb-2.5"
            />
            <Card className="divide-y divide-canvas">
              {home.publishing.map((p) => (
                <Link
                  key={p.id}
                  href={`/clients/${p.client.slug}/deliverables?d=${p.id}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-canvas/60"
                >
                  <span className="min-w-0 flex-1 truncate text-body text-charcoal">
                    {p.name}
                    <span className="text-steel"> · {p.client.name}</span>
                  </span>
                  <InternalTag />
                </Link>
              ))}
            </Card>
            <p className="mt-2 text-meta text-fog">
              Nothing here reaches a client until someone publishes it.
            </p>
          </section>
        </div>
      </div>

      <p className="mt-8 text-meta text-steel">
        <Link href="/signup" className="text-electric hover:underline">
          Replay workspace setup
        </Link>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  alert,
}: {
  label: string;
  value: string;
  note: string;
  alert?: boolean;
}) {
  return (
    <Card className="p-3">
      <p className="text-meta text-steel">{label}</p>
      <p className="mt-1.5 font-mono text-[20px] font-medium text-charcoal">{value}</p>
      <p className={cn("mt-0.5 text-meta", alert ? "text-danger-fg" : "text-fog")}>{note}</p>
    </Card>
  );
}
