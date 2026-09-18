import Link from "next/link";
import { getBoard } from "@/server/cross-client";
import { currentWorkspace } from "@/server/session";
import { formatDateShort } from "@/server/format";
import { requestNow } from "@/server/now";
import { Card } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const metadata = { title: "Delivery" };
export const dynamic = "force-dynamic";

/**
 * 6.12 · Delivery board and capacity.
 *
 * Everything shipping in the next four weeks, regardless of client. The card
 * borders carry the same encoding as everywhere else, and Capacity answers the
 * question the board raises: who is going to miss.
 */
export default async function DeliveryPage({ searchParams }: PageProps<"/delivery">) {
  const sp = await searchParams;
  const view = typeof sp.view === "string" ? sp.view : "client";
  const { agency } = await currentWorkspace();
  const { milestones, members } = await getBoard(agency.id);

  const weeks = nextWeeks(4);

  const lanes =
    view === "owner"
      ? members
          .filter((m) => m.role !== "LIMITED")
          .map((m) => ({ key: m.id, label: m.name, sub: m.discipline }))
      : uniqueBy(milestones.map((m) => m.project.client), (c) => c.slug).map((c) => ({
          key: c.slug,
          label: c.name,
          sub: null as string | null,
        }));

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Delivery</h1>
        <Link href="/delivery">
          <FilterPill selected={view === "client"}>By client</FilterPill>
        </Link>
        <Link href="?view=owner">
          <FilterPill selected={view === "owner"}>By owner</FilterPill>
        </Link>
        <Link href="?view=capacity">
          <FilterPill selected={view === "capacity"}>Capacity</FilterPill>
        </Link>
        <span className="ml-auto font-mono text-meta text-steel">
          Weeks {weeks[0].label} – {weeks[weeks.length - 1].label}
        </span>
      </div>

      {view === "capacity" ? (
        <Card className="overflow-hidden">
          <div
            className="grid items-center gap-3 border-b border-ash bg-canvas px-4 py-2"
            style={{ gridTemplateColumns: `minmax(0,1.4fr) repeat(${weeks.length}, 1fr)` }}
          >
            <span className="label-caps">Person · 40 h/wk</span>
            {weeks.map((w) => (
              <span key={w.label} className="label-caps">
                {w.label}
              </span>
            ))}
          </div>
          {members.map((m) => {
            const hours = m.ownedTasks.reduce((n, t) => n + (t.estimateHours ?? 0), 0);
            const clients = new Set(m.ownedTasks.map((t) => t.project.clientId)).size;
            return (
              <div
                key={m.id}
                className="grid items-center gap-3 border-b border-canvas px-4 py-3 last:border-b-0"
                style={{ gridTemplateColumns: `minmax(0,1.4fr) repeat(${weeks.length}, 1fr)` }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-charcoal">
                    {m.name}
                  </span>
                  <span className="block truncate text-meta text-steel">
                    {m.discipline}
                    {m.isFreelance ? " · freelance" : ""}
                  </span>
                </span>
                {weeks.map((w, i) => {
                  // The first week carries the live estimate; later weeks taper.
                  const load = Math.max(0, hours - i * 8);
                  const tone =
                    load > 40
                      ? "bg-danger text-danger-fg"
                      : load >= 36
                        ? "bg-warning text-warning-fg"
                        : "bg-ash text-steel";
                  return (
                    <span key={w.label} className="flex flex-col gap-1">
                      <span className="h-1.5 w-full rounded-full bg-canvas">
                        <span
                          className={cn("block h-full rounded-full", tone.split(" ")[0])}
                          style={{ width: `${Math.min(100, (load / 48) * 100)}%` }}
                        />
                      </span>
                      <span className={cn("font-mono text-meta", tone.split(" ")[1])}>
                        {load ? `${load} h` : "—"}
                        {i === 0 && clients ? (
                          <span className="text-fog"> · {clients} clients</span>
                        ) : null}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })}
          <p className="border-t border-ash px-4 py-2.5 text-meta text-fog">
            Red is over 40 h. Amber is at capacity. Hours come from task estimates; time tracking is
            off for this workspace.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <div
            className="grid min-w-200 items-center gap-3 border-b border-ash bg-canvas px-4 py-2"
            style={{ gridTemplateColumns: `160px repeat(${weeks.length}, minmax(0,1fr))` }}
          >
            <span className="label-caps">{view === "owner" ? "Owner" : "Client"}</span>
            {weeks.map((w, i) => (
              <span key={w.label} className={cn("label-caps", i === 0 && "text-electric")}>
                {w.label} · {w.range}
              </span>
            ))}
          </div>

          {lanes.map((lane) => (
            <div
              key={lane.key}
              className="grid min-w-200 gap-3 border-b border-canvas px-4 py-3 last:border-b-0"
              style={{ gridTemplateColumns: `160px repeat(${weeks.length}, minmax(0,1fr))` }}
            >
              <span className="min-w-0 self-start">
                <span className="block truncate text-body font-medium text-charcoal">
                  {lane.label}
                </span>
                {lane.sub ? (
                  <span className="block truncate text-meta text-steel">{lane.sub}</span>
                ) : null}
              </span>
              {weeks.map((w) => {
                const inWeek = milestones.filter((m) => {
                  const matchesLane =
                    view === "owner"
                      ? m.project.ownerId === lane.key
                      : m.project.client.slug === lane.key;
                  return matchesLane && m.date >= w.start && m.date < w.end;
                });
                return (
                  <span key={w.label} className="flex flex-col gap-1.5">
                    {inWeek.map((m) => {
                      const late = m.state === "MISSED" || (m.date < requestNow() && m.state !== "DONE");
                      const internal = m.visibility === "INTERNAL";
                      return (
                        <span
                          key={m.id}
                          className={cn(
                            "rounded-chip border px-2 py-1.5 text-meta",
                            late
                              ? "border-danger/40 bg-danger/6 text-danger-fg"
                              : m.state === "AT_RISK"
                                ? "border-warning/40 bg-warning/6 text-warning-fg [border-style:dashed]"
                                : internal
                                  ? "border-fog bg-surface text-fog [border-style:dashed]"
                                  : "border-ash bg-surface text-charcoal border-l-2 border-l-success",
                          )}
                        >
                          <span className="block truncate">{m.name}</span>
                          <span className="block truncate font-mono text-[10px] opacity-75">
                            {view === "owner" ? m.project.client.name : m.project.name} ·{" "}
                            {formatDateShort(m.date)}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function nextWeeks(count: number) {
  const out: { label: string; range: string; start: Date; end: Date }[] = [];
  const base = requestNow();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7)); // back to Monday
  for (let i = 0; i < count; i++) {
    const start = new Date(base);
    start.setDate(base.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const week = Math.ceil(
      ((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
    );
    out.push({
      label: `W${week}`,
      range: `${formatDateShort(start)}–${formatDateShort(new Date(end.getTime() - 86400000))}`,
      start,
      end,
    });
  }
  return out;
}

function uniqueBy<T>(list: T[], key: (item: T) => string) {
  const map = new Map<string, T>();
  for (const item of list) map.set(key(item), item);
  return [...map.values()];
}
