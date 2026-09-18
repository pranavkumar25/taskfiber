"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  ChevronsUpDown,
  FileBarChart,
  Folder,
  House,
  LayoutGrid,
  LayoutTemplate,
  Menu,
  MessageSquare,
  Plug,
  Search,
  Settings,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { buttonVariants, Kbd } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   The delivery-side shell: a 240px sidebar and a 48px topbar.

   The sidebar is where an agency lives all day, so it stays quiet — the active
   row is a fill, a blue icon and a 2px left rail, and nothing else is coloured
   except the two counts that mean work is waiting.
--------------------------------------------------------------------------- */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count?: number;
  /** Routes that should also light this item. */
  also?: string[];
};

export type ShellProps = {
  agency: { name: string; vertical: string; city: string | null; accentHex: string };
  member: { name: string };
  counts: { clients: number; deals: number; needsYou: number };
  children: React.ReactNode;
};

const VERTICAL_LABEL: Record<string, string> = {
  MARKETING: "Marketing agency",
  DESIGN: "Design studio",
  PRODUCT: "Product agency",
  TECH: "Tech agency",
  INFLUENCER: "Influencer management",
  TALENT: "Talent management",
};

export function DeliveryShell({ agency, member, counts, children }: ShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  const primary: NavItem[] = [
    { href: "/", label: "Home", icon: House },
    { href: "/clients", label: "Clients", icon: Users, count: counts.clients },
    { href: "/delivery", label: "Delivery", icon: LayoutGrid },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/pipeline", label: "Pipeline", icon: TrendingUp, count: counts.deals },
    { href: "/reports", label: "Reports", icon: FileBarChart },
    { href: "/documents", label: "Documents", icon: Folder, also: ["/documents/approvals", "/documents/contracts"] },
    { href: "/channels", label: "Channels", icon: MessageSquare },
  ];

  const secondary: NavItem[] = [
    { href: "/templates", label: "Portal templates", icon: LayoutTemplate },
    { href: "/integrations", label: "Integrations", icon: Plug },
    { href: "/team", label: "Team", icon: UsersRound },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // `[` toggles the sidebar, matching the topbar's own tooltip.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "[") setCollapsed((c) => !c);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href)) ||
    item.also?.some((h) => pathname.startsWith(h)) ||
    false;

  return (
    <div className="flex min-h-screen bg-surface">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-ash bg-canvas transition-[width] duration-[120ms] ease-out",
          collapsed ? "w-13" : "w-60",
        )}
      >
        {/* Workspace switcher */}
        <button
          type="button"
          className="flex h-12 items-center gap-2.5 px-3 text-left hover:bg-ash/40"
        >
          <BrandMark name={agency.name} color={agency.accentHex} size="md" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold text-charcoal">
                  {agency.name}
                </span>
                <span className="block truncate text-meta text-steel">
                  {VERTICAL_LABEL[agency.vertical] ?? agency.vertical}
                  {agency.city ? ` · ${agency.city}` : ""}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-fog" strokeWidth={1.5} />
            </>
          )}
        </button>

        <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2 pb-2">
          {primary.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(item)} collapsed={collapsed} />
          ))}
          <div className="my-2 border-t border-ash" />
          {secondary.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(item)} collapsed={collapsed} />
          ))}
        </nav>

        <div className="border-t border-ash p-2">
          <Link
            href="/"
            className="flex h-7 items-center gap-2 rounded-control px-2 text-body text-charcoal hover:bg-ash/50"
            title="Everything waiting on you"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-warning" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Needs you</span>
                <span className="font-mono text-meta text-steel">{counts.needsYou}</span>
              </>
            )}
          </Link>
          <div className="mt-1 flex h-7 items-center gap-2 px-2">
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ash text-[9px] font-semibold text-steel">
              {member.name
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-body text-charcoal">{member.name}</span>
                <Kbd>⌘K</Kbd>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-ash bg-surface px-4">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title="Toggle sidebar · ["
            className="inline-flex size-7 items-center justify-center rounded-control text-steel hover:bg-canvas hover:text-charcoal"
          >
            <Menu className="size-4" strokeWidth={1.5} />
          </button>

          <Breadcrumbs />

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-70 items-center gap-2 rounded-control border border-ash bg-surface px-2.5 text-body text-fog hover:bg-canvas"
            >
              <Search className="size-3.5 shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left">Search…</span>
              <Kbd>⌘K</Kbd>
            </button>
            <button
              type="button"
              title="Notifications"
              className="relative inline-flex size-7.5 items-center justify-center rounded-control text-steel hover:bg-canvas hover:text-charcoal"
            >
              <Bell className="size-4" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-danger" />
            </button>
            <Link
              href="/clients/new"
              className={buttonVariants({ variant: "primary" })}
            >
              New client
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavRow({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex h-7 items-center gap-2 rounded-control px-2 text-body",
        active
          ? "bg-ash/60 text-charcoal shadow-[inset_2px_0_0_var(--color-electric)]"
          : "text-steel hover:bg-ash/40 hover:text-charcoal",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", active ? "text-electric" : "text-fog")}
        strokeWidth={1.5}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.count !== undefined ? (
            <span className="font-mono text-meta text-fog">{item.count}</span>
          ) : null}
        </>
      )}
    </Link>
  );
}

/** Breadcrumbs, slash-separated, last crumb in primary text. */
function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-body">
      {crumbs.map((c, i) => (
        <React.Fragment key={c.label + i}>
          {i > 0 ? <span className="text-smoke">/</span> : null}
          {c.href && i < crumbs.length - 1 ? (
            <Link href={c.href} className="truncate text-steel hover:text-charcoal">
              {c.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-charcoal">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const seg = pathname.split("/").filter(Boolean);
  if (seg.length === 0) return [{ label: "Home" }];

  const map: Record<string, string> = {
    clients: "Clients",
    delivery: "Delivery",
    calendar: "Calendar",
    pipeline: "Pipeline",
    reports: "Reports",
    documents: "Documents",
    approvals: "Approvals",
    contracts: "Contracts and renewals",
    templates: "Portal templates",
    integrations: "Integrations",
    team: "Team and permissions",
    settings: "Settings",
    new: "New client",
  };

  return seg.map((s, i) => ({
    label: map[s] ?? titleCase(decodeURIComponent(s).replace(/-/g, " ")),
    href: "/" + seg.slice(0, i + 1).join("/"),
  }));
}

function titleCase(s: string) {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
