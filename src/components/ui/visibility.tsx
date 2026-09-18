import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   The one rule of the product, made visual.

   Every project, milestone, deliverable, note and comment is either INTERNAL
   or CLIENT_VISIBLE, drawn the same way everywhere. Nothing crosses to the
   client without a person choosing Publish.

   "Published" is not a third state. It is the transition into client-visible,
   and the resulting object wears a stamp saying who published it and when.

   Two treatments ship, per the design decision:
   - `VisibilityGutter` (1b) in tables — a 3px rule plus one icon button per
     row, which stacks into a readable column down a long list.
   - `VisibilitySwitch` (1a) on detail headers — the explicit two-position
     control, where there is room to be unambiguous.
--------------------------------------------------------------------------- */

export type Visibility = "internal" | "client";

/* --- Tags ---------------------------------------------------------------- */

/** INTERNAL — dashed, muted, eye-off. The default for everything. */
export function InternalTag({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "label-caps inline-flex h-5 w-fit items-center gap-1.5 rounded-chip border border-dashed border-fog bg-canvas px-2",
        className,
      )}
      {...props}
    >
      <EyeOff className="size-2.5" strokeWidth={2.5} aria-hidden />
      Internal
    </span>
  );
}

/** CLIENT-VISIBLE — solid, primary text, a green dot. */
export function ClientVisibleTag({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "label-caps inline-flex h-5 w-fit items-center gap-1.5 rounded-chip border border-smoke bg-surface px-2 text-charcoal!",
        className,
      )}
      {...props}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-success" />
      Client-visible
    </span>
  );
}

export function VisibilityTag({
  visibility,
  className,
}: {
  visibility: Visibility;
  className?: string;
}) {
  return visibility === "client" ? (
    <ClientVisibleTag className={className} />
  ) : (
    <InternalTag className={className} />
  );
}

/**
 * The stamp a published object wears. A client-visible object *always* carries
 * who published it and when — that is what makes the state auditable rather
 * than merely visual.
 */
export function PublishedStamp({
  at,
  by,
  className,
}: {
  /** Already formatted, e.g. "15 Sep 17:40". */
  at: string;
  by?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-chip border border-smoke bg-surface px-2 font-mono text-meta text-charcoal",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-success" />
      Published {at}
      {by ? <span className="text-steel">· {by}</span> : null}
    </span>
  );
}

/* --- 1a: the explicit segmented switch, for detail headers --------------- */

export function VisibilitySwitch({
  value,
  onChange,
  size = "md",
  disabled,
  className,
}: {
  value: Visibility;
  onChange?: (next: Visibility) => void;
  /** `sm` is the 24px form used in dense task rows, `xs` the 26px composer. */
  size?: "xs" | "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const h = { xs: "h-6", sm: "h-6", md: "h-7" }[size];
  const pad = size === "md" ? "px-2.5" : "px-2";
  const isInternal = value === "internal";

  return (
    <div
      role="group"
      aria-label="Visibility"
      className={cn(
        "inline-flex overflow-hidden rounded-control border border-smoke",
        h,
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={isInternal}
        title="Keep internal"
        onClick={() => onChange?.("internal")}
        className={cn(
          "inline-flex items-center gap-1.5 border-r border-smoke text-meta font-medium disabled:pointer-events-none",
          pad,
          isInternal
            ? "bg-canvas text-charcoal"
            : "bg-surface text-steel hover:bg-canvas",
        )}
      >
        <EyeOff className="size-3" strokeWidth={2} aria-hidden />
        Internal
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!isInternal}
        title="Publish to client · P"
        onClick={() => onChange?.("client")}
        className={cn(
          "inline-flex items-center gap-1.5 text-meta font-medium disabled:pointer-events-none",
          pad,
          isInternal
            ? "bg-surface text-steel hover:bg-canvas"
            : "bg-charcoal text-white",
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isInternal ? "bg-smoke" : "bg-success",
          )}
        />
        Client
      </button>
    </div>
  );
}

/* --- 1b: the gutter rule and its one icon button, for tables ------------- */

/**
 * The 3px left rule that carries the state down a long list: dashed grey for
 * internal, solid green for client-visible. Put it on the row itself.
 */
export function visibilityRowClass(visibility: Visibility) {
  return visibility === "client"
    ? "border-l-[3px] border-l-success"
    : "border-l-[3px] [border-left-style:dashed] border-l-fog text-steel";
}

/** The single 28px toggle that sits at the end of a table row. */
export function VisibilityToggle({
  value,
  onChange,
  disabled,
  className,
}: {
  value: Visibility;
  onChange?: (next: Visibility) => void;
  disabled?: boolean;
  className?: string;
}) {
  const isInternal = value === "internal";
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={isInternal ? "Publish to client" : "Unpublish"}
      title={isInternal ? "Publish to client · P" : "Unpublish"}
      onClick={() => onChange?.(isInternal ? "client" : "internal")}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-control hover:bg-canvas disabled:pointer-events-none disabled:text-smoke",
        isInternal ? "text-fog" : "text-charcoal",
        className,
      )}
    >
      {isInternal ? (
        <EyeOff className="size-4" strokeWidth={1.5} aria-hidden />
      ) : (
        <Eye className="size-4" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}

/**
 * The inline mini-tag used in activity rows, where a full tag would crowd the
 * sentence it annotates.
 */
export function VisibilityMiniTag({
  visibility,
  className,
}: {
  visibility: Visibility;
  className?: string;
}) {
  const isInternal = visibility === "internal";
  return (
    <span
      className={cn(
        "inline-flex h-4 shrink-0 items-center gap-1 rounded-chip px-1.5 text-[10px] font-medium tracking-[0.04em] uppercase",
        isInternal
          ? "border border-dashed border-fog bg-canvas text-steel"
          : "border border-smoke bg-surface text-charcoal",
        className,
      )}
    >
      <span
        className={cn(
          "size-[5px] shrink-0 rounded-full",
          isInternal ? "bg-fog" : "bg-success",
        )}
      />
      {isInternal ? "Internal" : "Client"}
    </span>
  );
}
