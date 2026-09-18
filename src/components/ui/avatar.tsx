import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   People and clients.

   A person is a circle; a client or an agency is a rounded square filled with
   its own brand colour. Keeping the two shapes distinct means a row never has
   to say which kind of thing a mark represents.
--------------------------------------------------------------------------- */

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_SIZES = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-7 text-label",
  lg: "size-8 text-meta",
  xl: "size-9 text-body",
} as const;

export function Avatar({
  name,
  size = "sm",
  accent,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  name: string;
  size?: keyof typeof AVATAR_SIZES;
  /** Fills the avatar with a colour and white initials — used for the signed-in
      contact and for creators, who each get their own. */
  accent?: string;
}) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        AVATAR_SIZES[size],
        accent ? "text-white" : "bg-canvas text-steel",
        className,
      )}
      style={accent ? { background: accent } : undefined}
      {...props}
    >
      {initialsOf(name)}
    </span>
  );
}

/**
 * The overlapping team stack in the portal header. Fills grade from light to
 * dark so the stack reads as one object rather than five.
 */
export function AvatarStack({
  people,
  max = 4,
  className,
}: {
  people: { name: string; role?: string }[];
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  const grades = ["bg-canvas", "bg-ash", "bg-smoke", "bg-ash"];

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <span
          key={p.name}
          title={p.role ? `${p.name} · ${p.role}` : p.name}
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-steel ring-2 ring-surface",
            grades[i % grades.length],
            i > 0 && "-ml-1.5",
          )}
        >
          {initialsOf(p.name)}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="-ml-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-ash bg-surface text-[9px] font-semibold text-steel ring-2 ring-surface">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

const LOGO_SIZES = {
  sm: "size-5 rounded-[5px] text-[10px]",
  md: "size-6 rounded-control text-[11px]",
  lg: "size-7 rounded-[7px] text-meta",
  xl: "size-9 rounded-control text-item",
} as const;

/**
 * A client or agency mark: a square, its own colour, one white initial. Client
 * fills are dark and desaturated so a list of them stays quiet.
 */
export function BrandMark({
  name,
  color,
  size = "md",
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "color" | "children"> & {
  name: string;
  color: string;
  size?: keyof typeof LOGO_SIZES;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold text-white",
        LOGO_SIZES[size],
        className,
      )}
      style={{ background: color }}
      {...props}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}
