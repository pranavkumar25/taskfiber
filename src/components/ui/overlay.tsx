"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Kbd } from "./button";

/* ---------------------------------------------------------------------------
   Floating layers: the 480px slide-over, the 420px modal, and popovers.

   These are the only surfaces that cast a real shadow. Everything at rest is a
   1px border. Two durations: 180ms for the drawer's slide, 160ms for anything
   that appears in place.
--------------------------------------------------------------------------- */

const SCRIM = "fixed inset-0 z-50 bg-charcoal/12 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

/**
 * The deliverable slide-over — the delivery side's centre of gravity. Docked
 * right, rounded on the left edge only, `esc` to close.
 */
export function SlideOver({
  open,
  onOpenChange,
  title,
  meta,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Version chip, visibility badge — whatever belongs beside the title. */
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={SCRIM} />
        <Dialog.Content
          className={cn(
            "fixed top-0 right-0 z-55 flex h-full w-120 flex-col overflow-hidden rounded-l-overlay border border-ash bg-surface shadow-overlay",
            "data-[state=open]:animate-slide-over focus:outline-none",
          )}
        >
          <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-ash px-4">
            <Dialog.Title className="truncate text-item font-semibold text-charcoal">
              {title}
            </Dialog.Title>
            {meta}
            <Dialog.Close className="ml-auto shrink-0" aria-label="Close">
              <Kbd>esc</Kbd>
            </Dialog.Close>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>

          {footer ? (
            <footer className="relative shrink-0 border-t border-ash p-4">{footer}</footer>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * The confirmation modal. Destructive confirmations keep the safe choice as the
 * ghost on the left and the destructive one as a danger *outline* on the right
 * — never a filled red button.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  width = 420,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={SCRIM} />
        <Dialog.Content
          style={{ width }}
          className="animate-enter fixed top-1/2 left-1/2 z-55 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-overlay border border-ash bg-surface p-5 shadow-overlay focus:outline-none"
        >
          <Dialog.Title className="text-h3 font-semibold text-charcoal">{title}</Dialog.Title>
          <div className="mt-1.5 text-body text-steel">{children}</div>
          {footer ? <div className="mt-4 flex justify-end gap-2">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * The publish confirmation and its kin. 300–320px, and it always names the
 * blast radius before the action fires.
 */
export function ConfirmPopover({
  trigger,
  title,
  children,
  footer,
  open,
  onOpenChange,
  width = 320,
  align = "end",
  side = "top",
}: {
  trigger: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: number;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          style={{ width }}
          className="animate-enter z-60 rounded-overlay border border-ash bg-surface p-4 shadow-overlay focus:outline-none"
        >
          <p className="text-item font-semibold text-charcoal">{title}</p>
          <div className="mt-1.5 text-body text-steel">{children}</div>
          {footer ? <div className="mt-3.5 flex justify-end gap-2">{footer}</div> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** A plain anchored panel — notifications, filters, template drawers. */
export function Panel({
  trigger,
  children,
  width = 360,
  align = "end",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  align?: "start" | "center" | "end";
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          style={{ width }}
          className="animate-enter z-60 overflow-hidden rounded-overlay border border-ash bg-surface shadow-overlay focus:outline-none"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
