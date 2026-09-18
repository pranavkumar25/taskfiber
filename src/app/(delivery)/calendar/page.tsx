import { getCalendar, type CalEvent } from "@/server/cross-client";
import { currentWorkspace } from "@/server/session";
import { requestNow } from "@/server/now";
import { Card } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * 6.12 · Cross-client calendar.
 *
 * Where an agency spots a collision. The chip's left rule is the encoding, and
 * the legend states it: filled is client-visible, dashed is internal.
 */
export default async function CalendarPage() {
  const { agency } = await currentWorkspace();
  const events = await getCalendar(agency.id);

  const today = requestNow();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // weeks start Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startOffset + daysInMonth) / 7) * 7 }, (_, i) => {
    const dayNumber = i - startOffset + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const byDay = new Map<number, CalEvent[]>();
  for (const e of events) {
    if (e.date.getFullYear() !== year || e.date.getMonth() !== month) continue;
    const list = byDay.get(e.date.getDate()) ?? [];
    list.push(e);
    byDay.set(e.date.getDate(), list);
  }

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">
          {first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </h1>
        <FilterPill selected>Month</FilterPill>
        <FilterPill>Week</FilterPill>
        <FilterPill>All clients</FilterPill>
        <FilterPill>Milestones and deadlines</FilterPill>
        <span className="ml-auto text-meta text-steel">
          Filled = client-visible · dashed = internal
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ash bg-canvas">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn("label-caps px-2 py-1.5", i >= 5 && "text-fog")}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === today.getDate();
            const weekend = i % 7 >= 5;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-r border-b border-canvas p-1.5 last:border-r-0",
                  weekend && "bg-canvas/40",
                  isToday && "shadow-[inset_0_0_0_1px_var(--color-electric)]",
                )}
              >
                {day ? (
                  <>
                    <span
                      className={cn(
                        "font-mono text-meta",
                        isToday ? "font-medium text-electric" : "text-fog",
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {(byDay.get(day) ?? []).map((e) => (
                        <EventChip key={e.id} event={e} />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function EventChip({ event }: { event: CalEvent }) {
  const tone =
    event.state === "missed"
      ? "border-l-danger text-danger-fg"
      : event.kind === "approval" || event.state === "at-risk"
        ? "border-l-warning text-warning-fg"
        : event.state === "done"
          ? "border-l-success text-steel"
          : event.internal
            ? "border-l-fog text-fog"
            : "border-l-success text-charcoal";

  return (
    <span
      title={`${event.client} · ${event.label}`}
      className={cn(
        "block truncate rounded-[3px] border-l-2 bg-canvas py-0.5 pr-1 pl-1.5 text-[11px]",
        event.internal && "[border-left-style:dashed] bg-surface",
        tone,
      )}
    >
      {event.client.split(" ")[0]} · {event.label}
    </span>
  );
}
