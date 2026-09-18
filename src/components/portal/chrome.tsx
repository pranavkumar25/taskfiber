"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarStack } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * The client portal's chrome.
 *
 * 56px, sticky, and blurred so the content scrolls under it. On a phone the nav
 * drops to its own scrollable row rather than collapsing into a hamburger — a
 * client who has to hunt for the nav will not come back, and approving from a
 * phone is the whole mobile strategy.
 */
export function PortalChrome({
  slug,
  agency,
  client,
  contact,
  team,
  nav,
  preview,
  children,
}: {
  slug: string;
  agency: { name: string; accentHex: string; domain: string };
  client: { name: string };
  contact: { name: string; role: string };
  team: { name: string; role: string }[];
  nav: { key: string; label: string; href: string }[];
  preview: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/p/${slug}`;
  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  const isActive = (href: string) => {
    const full = `${base}${href}`;
    if (href === "") return pathname === base;
    return pathname.startsWith(full);
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-canvas"
      style={{ ["--accent" as string]: agency.accentHex }}
    >
      {preview ? (
        <div className="bg-charcoal px-4 py-1.5 text-center text-meta text-white">
          Previewing as {contact.name} · {contact.role.toLowerCase()} — this is exactly what they
          see
        </div>
      ) : null}

      <header className="sticky top-0 z-20 border-b border-ash bg-surface/88 backdrop-blur-[10px] backdrop-saturate-180">
        <div className="mx-auto flex h-14 max-w-270 items-center gap-2.5 px-4">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-meta font-semibold text-white"
            style={{ background: agency.accentHex }}
          >
            {agency.name[0]}
          </span>
          <Link href={base} className="shrink-0 text-body font-semibold text-charcoal">
            {agency.name}
          </Link>
          <span className="shrink-0 text-smoke">/</span>
          <span className="truncate text-body text-steel">{client.name}</span>

          <nav className="ml-6 hidden min-w-0 items-center gap-4 overflow-hidden xl:flex">
            {nav.map((n) => (
              <Link
                key={n.key}
                href={`${base}${n.href}`}
                className={cn(
                  "shrink-0 text-body",
                  isActive(n.href)
                    ? "font-medium text-charcoal"
                    : "text-steel hover:text-charcoal",
                )}
                style={
                  isActive(n.href) ? { boxShadow: "inset 0 -2px 0 var(--accent)" } : undefined
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 md:flex">
              <AvatarStack people={team} max={3} />
              <span className="text-meta text-steel">Your team at {agency.name}</span>
            </span>
            <span className="hidden h-6 w-px bg-ash md:block" />
            <span className="flex items-center gap-2">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-meta font-semibold text-white"
                style={{ background: agency.accentHex }}
              >
                {initials}
              </span>
              <span className="hidden md:block">
                <span className="block text-meta font-medium text-charcoal">{contact.name}</span>
                <span className="block text-meta text-steel capitalize">
                  {contact.role.toLowerCase()}
                </span>
              </span>
            </span>
          </div>
        </div>

        <nav className="scrollbar-none flex gap-4 overflow-x-auto border-t border-canvas px-4 py-2.5 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.key}
              href={`${base}${n.href}`}
              className={cn(
                "shrink-0 text-body",
                isActive(n.href) ? "font-medium text-charcoal" : "text-steel",
              )}
              style={isActive(n.href) ? { boxShadow: "inset 0 -2px 0 var(--accent)" } : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mx-auto flex w-full max-w-270 flex-wrap items-center justify-between gap-2 px-4 py-6 text-meta text-fog">
        <span>
          {agency.name} · portal for {client.name}
        </span>
        <span>Your link is personal. Notifications by email or WhatsApp · Preferences</span>
      </footer>
    </div>
  );
}
