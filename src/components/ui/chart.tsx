import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Charts.

   Thin 1.5px lines, one accent, mono axis labels, no fills, no shadows, no 3D.
   In a client portal the accent is the agency's, which is why every stroke here
   reads `var(--accent)` rather than a product blue.
--------------------------------------------------------------------------- */

export function WidgetCard({
  title,
  source,
  value,
  delta,
  span,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  source?: React.ReactNode;
  value?: React.ReactNode;
  /** Rendered green when it starts with +, red with −, grey otherwise. */
  delta?: string;
  span?: number;
}) {
  const tone = delta?.startsWith("+")
    ? "text-success-fg"
    : delta?.startsWith("−") || delta?.startsWith("-")
      ? "text-success-fg"
      : "text-steel";

  return (
    <div
      className={cn("rounded-card border border-ash bg-surface p-3 shadow-card", className)}
      style={span && span > 1 ? { gridColumn: `span ${span}` } : undefined}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-2 text-meta">
        <span className="font-semibold text-charcoal">{title}</span>
        {source ? <span className="shrink-0 text-fog">{source}</span> : null}
      </div>
      {value !== undefined ? (
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-[18px] font-medium text-charcoal">{value}</span>
          {delta ? <span className={cn("text-meta", tone)}>{delta}</span> : null}
        </div>
      ) : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

/** A single accent stroke over a 200×40 box. No fill, no dots, no grid. */
export function LineChart({
  series,
  labels,
  accent = true,
  height = 40,
}: {
  series: number[];
  labels?: [string, string];
  accent?: boolean;
  height?: number;
}) {
  if (series.length < 2) return null;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 200;
      const y = 36 - ((v - min) / span) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 200 40" height={height} className="w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          stroke={accent ? "var(--accent)" : "var(--color-electric)"}
        />
      </svg>
      {labels ? (
        <div className="mt-1 flex justify-between font-mono text-[10px] text-fog">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Columns. The last bars carry the accent when `highlightLast` is set. */
export function BarChart({
  values,
  labels,
  highlightLast = 0,
  accent = true,
  height = 48,
}: {
  values: number[];
  labels?: [string, string];
  highlightLast?: number;
  accent?: boolean;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {values.map((v, i) => {
          const hot = i >= values.length - highlightLast;
          return (
            <div
              key={i}
              className={cn("flex-1 rounded-[2px]", hot ? "" : "bg-ash")}
              style={{
                height: `${Math.max(6, (v / max) * height)}px`,
                background: hot
                  ? accent
                    ? "var(--accent)"
                    : "var(--color-sapphire)"
                  : undefined,
              }}
            />
          );
        })}
      </div>
      {labels ? (
        <div className="mt-1 flex justify-between font-mono text-[10px] text-fog">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal bars — reach by creator, and anything else ranked. */
export function RankedBars({
  rows,
}: {
  rows: { label: string; value: number; display: string; muted?: boolean }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2.5">
          <span
            className={cn(
              "w-36 shrink-0 truncate font-mono text-meta",
              r.muted ? "text-fog" : "text-charcoal",
            )}
          >
            {r.label}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
            <span
              className={cn("block h-full rounded-full", r.muted && "bg-ash")}
              style={{
                width: `${Math.max(2, (r.value / max) * 100)}%`,
                background: r.muted ? undefined : "var(--accent)",
              }}
            />
          </span>
          <span
            className={cn(
              "w-20 shrink-0 text-right font-mono text-meta",
              r.muted ? "text-fog" : "text-charcoal",
            )}
          >
            {r.display}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A 3px progress rail — campaign flights, targets, onboarding. */
export function ProgressRail({
  percent,
  accent = true,
  className,
}: {
  percent: number;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("block h-[3px] w-full rounded-full bg-ash", className)}>
      <span
        className="block h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: accent ? "var(--accent)" : "var(--color-sapphire)",
        }}
      />
    </span>
  );
}

/** The hairline-separated metric strip used on portal home and in reports. */
export function MetricStrip({
  metrics,
  className,
}: {
  metrics: { label: string; value: string; delta?: string; source?: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-card border border-ash bg-ash",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))` }}
    >
      {metrics.map((m) => (
        <div key={m.label} className="bg-surface p-3">
          <div className="text-label font-medium tracking-[0.04em] text-steel uppercase">
            {m.label}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[18px] font-medium text-charcoal">{m.value}</span>
            {m.delta ? <span className="text-meta text-success-fg">{m.delta}</span> : null}
          </div>
          {m.source ? <div className="mt-0.5 text-meta text-fog">{m.source}</div> : null}
        </div>
      ))}
    </div>
  );
}
