import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button.
 *
 * Every variant below appears somewhere in the screens. Two rules are worth
 * stating because they are easy to get wrong:
 *
 * - `primary` is the delivery side's sapphire. `accent` is the same button in
 *   a client portal, where the fill is the agency's own colour. The product
 *   blues never appear inside a portal.
 * - `danger` is an *outline*, never a filled red button. A destructive
 *   confirmation keeps the safe choice as the ghost on the left and the
 *   destructive one as the danger outline on the right.
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap select-none disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-electric/15 focus-visible:border-electric [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-sapphire text-white shadow-primary hover:bg-sapphire-hover disabled:bg-ash disabled:text-fog disabled:shadow-none",
        accent:
          "bg-accent text-white shadow-primary-accent hover:brightness-95 disabled:bg-ash disabled:text-fog disabled:shadow-none",
        secondary:
          "bg-surface text-charcoal border border-ash shadow-button hover:bg-canvas disabled:text-fog disabled:shadow-none",
        ghost:
          "bg-transparent text-steel hover:bg-canvas hover:text-charcoal disabled:text-fog",
        neutral:
          "bg-charcoal text-white hover:bg-charcoal/90 disabled:bg-ash disabled:text-fog",
        danger:
          "bg-surface text-danger-fg border border-danger/30 hover:bg-danger-tint disabled:text-fog disabled:border-ash",
      },
      size: {
        /** Dense rows, banners and inline actions. */
        xs: "h-6 px-2 text-meta",
        /** Filter bars, card footers, secondary actions. */
        sm: "h-7 px-2.5 text-meta",
        /** The default across the delivery side. */
        md: "h-8 px-3 text-body",
        /** Portal actions — approve, request changes. */
        lg: "h-9 px-4 text-body",
        /** Email buttons and portal primary CTAs. */
        xl: "h-10 px-4 text-item",
        /** The magic-link landing's single button. */
        hero: "h-11 w-full px-5 text-item",
      },
      /** A square icon-only button; `size` still sets the edge length. */
      icon: {
        true: "px-0 aspect-square",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "md", class: "px-2.5" },
      { variant: "primary", size: "sm", class: "px-2.5" },
    ],
    defaultVariants: { variant: "secondary", size: "md", icon: false },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof button> {}

export function Button({
  className,
  variant,
  size,
  icon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size, icon }), className)}
      {...props}
    />
  );
}

/**
 * A keyboard hint. Mono, because it is a literal key, and the product puts
 * every literal in mono.
 */
export function Kbd({
  className,
  onDark,
  ...props
}: React.ComponentProps<"kbd"> & { onDark?: boolean }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-4 items-center rounded-chip px-[5px] font-mono text-label",
        onDark
          ? "bg-white/18 text-white"
          : "border border-ash border-b-2 bg-canvas text-steel",
        className,
      )}
      {...props}
    />
  );
}

export { button as buttonVariants };
