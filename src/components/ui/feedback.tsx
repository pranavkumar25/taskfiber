import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Banners, toasts and empty states.

   Every failure message in this product follows the same shape: name the
   cause, quantify what it affects, say what is still safe, and offer exactly
   one recovery action.
--------------------------------------------------------------------------- */

const BANNERS = {
  info: "border-info/25 bg-info/6 [--dot:var(--color-info)]",
  warning: "border-warning/30 bg-warning/6 [--dot:var(--color-warning)]",
  error: "border-danger/30 bg-danger/6 [--dot:var(--color-danger)]",
} as const;

export function Banner({
  tone = "info",
  action,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  tone?: keyof typeof BANNERS;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-control border px-3 py-2.5 text-body",
        BANNERS[tone],
        className,
      )}
      {...props}
    >
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--dot)]" />
      <div className="min-w-0 flex-1 text-charcoal">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * The toast states its consequence in the client's terms — "Kiro Foods no
 * longer sees this version" — not in the system's.
 */
export function Toast({
  children,
  onDismiss,
  className,
  ...props
}: React.ComponentProps<"div"> & { onDismiss?: () => void }) {
  return (
    <div
      role="status"
      className={cn(
        "animate-enter flex items-center gap-2.5 rounded-lg bg-charcoal px-3 py-2.5 text-body text-white shadow-overlay",
        className,
      )}
      {...props}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-success" />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 shrink-0 font-medium text-fog hover:text-white"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  children,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & { action?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-smoke p-6 text-center text-body text-steel",
        className,
      )}
      {...props}
    >
      <p className="max-w-xs text-pretty">{children}</p>
      {action ? <div className="mt-2.5">{action}</div> : null}
    </div>
  );
}

/**
 * The "not shared with your role" screen. No CTA, because the resolution is
 * social: it names the policy, the roles and the person to ask.
 */
export function DeniedState({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2.5 px-5 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-card bg-canvas text-steel">
        {icon}
      </div>
      <h2 className="text-h2 font-semibold text-charcoal">{title}</h2>
      <p className="max-w-sm text-pretty text-read text-steel">{children}</p>
    </div>
  );
}
