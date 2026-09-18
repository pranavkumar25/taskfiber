"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Form controls.

   One focus treatment across all of them: the border turns electric and a 3px
   translucent ring appears. Inputs carry the *strong* border (smoke), not the
   hairline, so a field is distinguishable from a divider at a glance.
--------------------------------------------------------------------------- */

const FIELD =
  "w-full rounded-control border border-smoke bg-surface text-charcoal placeholder:text-fog focus:border-electric focus:shadow-focus focus:outline-none disabled:bg-canvas disabled:text-fog";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input className={cn(FIELD, "h-8 px-2.5 text-body", className)} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(FIELD, "min-h-16 resize-y px-2.5 py-2 text-body", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          FIELD,
          "h-8 appearance-none py-0 pr-8 pl-2.5 text-body",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-steel"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

export function SearchField({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fog"
        strokeWidth={1.5}
        aria-hidden
      />
      <input
        type="search"
        className={cn(FIELD, "h-8 pr-2.5 pl-8 text-body", className)}
        {...props}
      />
    </div>
  );
}

/* --- Segmented control (Month | Week, By client | By owner, …) ----------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly { value: T; label: React.ReactNode }[];
  value: T;
  onChange?: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-7 items-center gap-0 rounded-control bg-canvas p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(o.value)}
            className={cn(
              "inline-flex h-6 items-center rounded-chip px-2.5 text-meta font-medium",
              active
                ? "bg-surface text-charcoal shadow-button"
                : "text-steel hover:text-charcoal",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* --- Toggle, checkbox, radio --------------------------------------------- */

export function Toggle({
  checked,
  onChange,
  accent,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** Uses the agency accent instead of the product sapphire — portal contexts. */
  accent?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 rounded-full disabled:opacity-50",
        checked ? (accent ? "bg-accent" : "bg-sapphire") : "bg-smoke",
        className,
      )}
    >
      <span
        className="absolute top-0.5 size-3.5 rounded-full bg-white transition-[left] duration-[120ms] ease-out"
        style={{ left: checked ? 16 : 2 }}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-chip disabled:opacity-50",
        checked ? "bg-sapphire" : "border border-smoke bg-surface",
        className,
      )}
    >
      {checked ? (
        <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden />
      ) : null}
    </button>
  );
}

export function Radio({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "inline-flex size-4 shrink-0 rounded-full disabled:opacity-50",
        checked
          ? "border-[5px] border-electric bg-surface"
          : "border border-smoke bg-surface",
        className,
      )}
    />
  );
}

/* --- Filter pills -------------------------------------------------------- */

export function FilterPill({
  selected,
  count,
  children,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  selected?: boolean;
  count?: number | string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-meta font-medium",
        selected
          ? "border-charcoal bg-charcoal text-white"
          : "border-ash bg-surface text-charcoal hover:bg-canvas",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            "font-mono",
            selected ? "opacity-70" : "text-fog",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function AddFilterPill({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full border border-dashed border-smoke px-2.5 text-meta font-medium text-steel hover:bg-canvas",
        className,
      )}
      {...props}
    >
      + Filter
    </button>
  );
}
