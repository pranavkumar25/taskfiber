import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Status, stage, aging and type indicators.

   Colour is reserved for state, so a healthy client list reads as almost
   monochrome. Six tones cover every status in both surfaces; each is a dot, an
   8% tint and a 700-weight foreground that holds 4.5:1 on the tint.
--------------------------------------------------------------------------- */

const TONES = {
  /** Done, Approved, Delivered, Paid, Posted, Signed, Active, On track. */
  success: { dot: "bg-success", pill: "bg-success-tint text-success-fg" },
  /** Awaiting your approval, Needs you, At risk, Due today, In review. */
  warning: { dot: "bg-warning", pill: "bg-warning-tint text-warning-fg" },
  /** Overdue, Blocked. */
  danger: { dot: "bg-danger", pill: "bg-danger-tint text-danger-fg" },
  /** Open, In review — anything awaiting a decision but not yet late. */
  info: { dot: "bg-info", pill: "bg-info-tint text-info-fg" },
  /** Draft, Upcoming, Contracted, Briefed, Done-and-filed. */
  neutral: { dot: "bg-fog", pill: "bg-canvas text-steel" },
  /** In progress. The only pill whose dot carries the agency accent. */
  progress: { dot: "bg-accent", pill: "bg-charcoal/5 text-charcoal" },
} as const;

export type Tone = keyof typeof TONES;

/**
 * Maps a status string from anywhere in the product onto a tone, so a status
 * only ever has to be spelled once.
 */
export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase();
  if (/(overdue|blocked|failed|expired)/.test(s)) return "danger";
  if (/(at risk|needs you|awaiting|due|behind|expiring|in review)/.test(s))
    return "warning";
  if (/(in progress|current)/.test(s)) return "progress";
  if (/(approved|delivered|paid|posted|signed|active|on track|complete)/.test(s))
    return "success";
  if (/(open|sent|requested)/.test(s)) return "info";
  return "neutral";
}

/** The six-kind status pill. h20, fully round, 12px/500, 6px dot. */
export function StatusPill({
  children,
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  const resolved = tone ?? toneForStatus(String(children ?? ""));
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full px-2 text-meta font-medium",
        TONES[resolved].pill,
        className,
      )}
      {...props}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", TONES[resolved].dot)}
      />
      {children}
    </span>
  );
}

/** A bare state dot, for dense rows where a full pill would cost too much. */
export function StatusDot({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        TONES[tone].dot,
        className,
      )}
      {...props}
    />
  );
}

/* --- Client lifecycle stage. Outline, no dot. ---------------------------- */

const STAGES = {
  prospect: "text-steel border-ash",
  onboarding: "text-ink border-ash",
  active: "text-charcoal border-ash",
  "at risk": "text-warning-fg border-warning/40",
  renewal: "text-steel border-ash",
  offboarded: "text-fog border-ash",
} as const;

export type Stage = keyof typeof STAGES;

export function StagePill({
  stage,
  className,
  ...props
}: React.ComponentProps<"span"> & { stage: Stage }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center rounded-full border bg-surface px-2 text-meta font-medium capitalize",
        STAGES[stage],
        className,
      )}
      {...props}
    >
      {stage}
    </span>
  );
}

/* --- Invoice and approval aging. Always mono — it is a measurement. ------ */

const aging = cva(
  "inline-flex h-5 w-fit items-center rounded-chip px-1.5 font-mono text-meta",
  {
    variants: {
      tone: {
        danger: "bg-danger-tint text-danger-fg",
        warning: "bg-warning-tint text-warning-fg",
        neutral: "bg-canvas text-steel",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function AgingPill({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof aging>) {
  return <span className={cn(aging({ tone }), className)} {...props} />;
}

/* --- Small labels ------------------------------------------------------- */

/** Project type: Retainer, Campaign, Sprint, Booking, Project. */
export function TypeChip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center rounded-chip bg-canvas px-[7px] text-meta text-steel",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A deliverable version. `current` draws the outlined, primary-text form used
 * for the version a client is looking at; the subtle form is for history.
 */
export function VersionTag({
  current,
  className,
  ...props
}: React.ComponentProps<"span"> & { current?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center rounded-chip px-1.5 font-mono text-meta",
        current
          ? "border border-smoke bg-surface text-charcoal"
          : "bg-canvas text-steel",
        className,
      )}
      {...props}
    />
  );
}

/** Contact role: Approver, Collaborator, Viewer, Billing. */
export function RoleTag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "label-caps inline-flex w-fit items-center rounded-chip border border-ash px-1.5 py-px",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Where a number or a file came from, and how stale it is. Every connected
 * figure in the product carries one; a figure without one is either manual or
 * a bug.
 */
export function SourceBadge({
  children,
  failed,
  mark,
  className,
  ...props
}: React.ComponentProps<"span"> & { failed?: boolean; mark?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit items-center gap-1.5 rounded-chip border bg-surface px-2 text-meta",
        failed ? "border-danger/30 text-danger-fg" : "border-ash text-steel",
        className,
      )}
      {...props}
    >
      {mark ?? (
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-[2px]",
            failed ? "bg-danger" : "bg-steel",
          )}
        />
      )}
      {children}
    </span>
  );
}
