"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Kbd } from "./button";

/**
 * The row menu. Every item that has a shortcut shows it, right-aligned and in
 * mono — the same key the screen accepts.
 */
export function Menu({
  trigger,
  children,
  width = 220,
  align = "end",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  align?: "start" | "center" | "end";
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          style={{ width }}
          className="animate-enter z-60 rounded-overlay border border-ash bg-surface p-1 shadow-overlay focus:outline-none"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MenuItem({
  shortcut,
  destructive,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item> & {
  shortcut?: string;
  destructive?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex cursor-default items-center justify-between gap-3 rounded-control px-2 py-1.5 text-body outline-none data-[highlighted]:bg-canvas",
        destructive ? "text-danger-fg" : "text-charcoal",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {shortcut ? <Kbd>{shortcut}</Kbd> : null}
    </DropdownMenu.Item>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-canvas" />;
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="label-caps px-2 pt-1.5 pb-0.5">{children}</div>;
}
