import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Cards, tables and tabs.

   Borders over shadows: a resting surface is a 1px hairline with the barely
   visible card seat under it. Only floating layers cast properly.
--------------------------------------------------------------------------- */

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-card border border-ash bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}

/** Title row for a card. `action` sits hard right, usually a link or a button. */
export function CardHead({
  title,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    >
      <h2 className="text-body font-semibold text-charcoal">{title}</h2>
      {action}
    </div>
  );
}

/* --- Tabs ---------------------------------------------------------------- */

export function TabStrip({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "scrollbar-none flex gap-0.5 overflow-x-auto border-b border-ash",
        className,
      )}
      {...props}
    />
  );
}

export function Tab({
  active,
  count,
  accent,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  active?: boolean;
  count?: number | string;
  /** Portal tabs underline in the agency accent, not the product blue. */
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 text-body font-medium",
        active
          ? accent
            ? "text-charcoal shadow-[inset_0_-2px_0_var(--accent)]"
            : "text-charcoal shadow-[inset_0_-2px_0_var(--color-electric)]"
          : "text-steel hover:text-charcoal",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span className="rounded-chip bg-canvas px-[5px] font-mono text-label text-steel">
          {count}
        </span>
      ) : null}
    </button>
  );
}

/* --- Data table ---------------------------------------------------------- */

/**
 * The table is a CSS grid, not a `<table>`: every screen in the design defines
 * its own column template, and rows carry a visibility gutter that a table cell
 * cannot.
 */
export function DataTable({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="table"
      className={cn(
        "overflow-hidden rounded-card border border-ash bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function TableHeader({
  cols,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { cols: string }) {
  return (
    <div
      role="row"
      className={cn(
        "label-caps grid h-8 items-center gap-3 border-b border-ash bg-canvas px-3",
        className,
      )}
      style={{ gridTemplateColumns: cols, ...style }}
      {...props}
    />
  );
}

export function TableRow({
  cols,
  selected,
  tall,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  cols: string;
  selected?: boolean;
  /** 48px two-line rows — the density chosen for the all-clients list. */
  tall?: boolean;
}) {
  return (
    <div
      role="row"
      className={cn(
        "grid items-center gap-3 border-b border-canvas px-3 text-body last:border-b-0",
        tall ? "h-12" : "h-9",
        selected && "bg-electric/5 shadow-[inset_2px_0_0_var(--color-electric)]",
        className,
      )}
      style={{ gridTemplateColumns: cols, ...style }}
      {...props}
    />
  );
}

/**
 * Loading rows match the real row's geometry exactly, with no shimmer. A
 * skeleton that animates reads as progress; one that does not reads as shape.
 */
export function SkeletonRow({
  cols,
  widths,
  tall,
}: {
  cols: string;
  widths: number[];
  tall?: boolean;
}) {
  return (
    <div
      role="row"
      aria-hidden
      className={cn(
        "grid items-center gap-3 border-b border-canvas px-3 last:border-b-0",
        tall ? "h-12" : "h-9",
      )}
      style={{ gridTemplateColumns: cols }}
    >
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-2.5 rounded-[3px] bg-canvas"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}
