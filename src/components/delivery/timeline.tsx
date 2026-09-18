import * as React from "react";
import { formatDateShort } from "@/server/format";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   The project timeline.

   The node shapes carry meaning, and one of them carries the product's rule: an
   INTERNAL milestone is a dashed square, and it is never drawn in the client's
   portal at all.
--------------------------------------------------------------------------- */

export type PhaseSpec = {
  name: string;
  weight: number;
  status: "DONE" | "DUE" | "AT_RISK" | "MISSED" | "UPCOMING";
};

const PHASE_FILL: Record<PhaseSpec["status"], string> = {
  DONE: "bg-ash",
  DUE: "bg-electric/12 border border-electric/40",
  AT_RISK: "bg-warning/15 border border-warning/40",
  MISSED: "bg-danger/15 border border-danger/40",
  UPCOMING: "bg-canvas",
};

/** Proportional phases, weighted by their share of the project. */
export function PhaseBar({ phases }: { phases: PhaseSpec[] }) {
  const total = phases.reduce((n, p) => n + p.weight, 0) || 1;
  return (
    <div>
      <div className="flex gap-1">
        {phases.map((p) => (
          <div key={p.name} style={{ flex: p.weight / total }} className="min-w-0">
            <div className={cn("h-2 rounded-[3px]", PHASE_FILL[p.status])} />
            <p
              className={cn(
                "mt-1.5 truncate text-meta",
                p.status === "DUE" ? "font-medium text-charcoal" : "text-steel",
              )}
            >
              {p.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export type MilestoneSpec = {
  id: string;
  name: string;
  date: Date;
  state: "DONE" | "DUE" | "AT_RISK" | "MISSED" | "UPCOMING";
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
};

/**
 * The rail. `showInternal` is false in every client-facing context — the shape
 * exists so the agency can see what it is withholding, not so the client can.
 */
export function MilestoneRail({
  milestones,
  showInternal = true,
  today = new Date(),
}: {
  milestones: MilestoneSpec[];
  showInternal?: boolean;
  today?: Date;
}) {
  const shown = showInternal
    ? milestones
    : milestones.filter((m) => m.visibility === "CLIENT_VISIBLE");
  if (shown.length === 0) return null;

  const first = shown[0].date.getTime();
  const last = shown[shown.length - 1].date.getTime();
  const span = Math.max(1, last - first);
  const progress = Math.min(100, Math.max(0, ((today.getTime() - first) / span) * 100));

  return (
    <div className="pt-1">
      <div className="relative mx-1.5 h-0.5 rounded-full bg-ash">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-charcoal"
          style={{ width: `${progress}%` }}
        />
        {progress > 0 && progress < 100 ? (
          <span
            className="absolute -top-1 z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${progress}%` }}
            title={`Today · ${formatDateShort(today)}`}
          >
            <span className="h-2.5 w-px bg-electric" />
          </span>
        ) : null}
      </div>

      <ol className="mt-2 flex justify-between gap-2">
        {shown.map((m, i) => (
          <li
            key={m.id}
            className={cn(
              "flex min-w-0 flex-col gap-1.5",
              i === 0 ? "items-start" : i === shown.length - 1 ? "items-end" : "items-center",
            )}
          >
            <MilestoneNode state={m.state} internal={m.visibility === "INTERNAL"} />
            <span
              className={cn(
                "truncate text-meta",
                m.visibility === "INTERNAL" ? "text-fog" : "text-charcoal",
              )}
            >
              {m.name}
            </span>
            <span className="font-mono text-meta text-fog">{formatDateShort(m.date)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MilestoneNode({
  state,
  internal,
}: {
  state: MilestoneSpec["state"];
  internal: boolean;
}) {
  // Internal is a dashed square. That shape means "never shown in the portal".
  if (internal) {
    return (
      <span
        title="Internal · never shown in the portal"
        className="size-3 rounded-[2px] border border-dashed border-fog bg-canvas"
      />
    );
  }
  if (state === "DONE") {
    return (
      <span className="size-3 rounded-full border-2 border-white bg-charcoal shadow-[0_0_0_1px_var(--color-charcoal)]" />
    );
  }
  if (state === "DUE" || state === "AT_RISK") {
    return <span className="size-3 rounded-full border-2 border-warning bg-surface" />;
  }
  if (state === "MISSED") {
    return <span className="size-3 rounded-full border-2 border-danger bg-surface" />;
  }
  return <span className="size-3 rounded-full border-2 border-smoke bg-surface" />;
}
