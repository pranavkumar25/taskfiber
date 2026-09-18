"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, Eye } from "lucide-react";
import { BrandMark, Avatar } from "@/components/ui/avatar";
import { StagePill, TypeChip, type Stage } from "@/components/ui/pill";
import { Tab, TabStrip } from "@/components/ui/surface";
import { buttonVariants } from "@/components/ui/button";

const STAGE_LABEL: Record<string, string> = {
  PROSPECT: "prospect",
  ONBOARDING: "onboarding",
  ACTIVE: "active",
  AT_RISK: "at risk",
  RENEWAL: "renewal",
  OFFBOARDED: "offboarded",
};

/**
 * The client header, persistent across every tab of the record.
 *
 * The portal URL sits here in mono with a copy affordance, because the single
 * most common thing an account lead does on this screen is send someone the
 * link.
 */
export function ClientHeader({
  client,
  counts,
}: {
  client: {
    name: string;
    slug: string;
    brandColor: string;
    stage: string;
    templateName: string | null;
    accountLead: string | null;
    portalUrl: string;
    portalSlug: string;
  };
  counts: { projects: number; deliverables: number; contacts: number };
}) {
  const pathname = usePathname();
  const base = `/clients/${client.slug}`;
  const [copied, setCopied] = React.useState(false);

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/projects`, label: "Projects", count: counts.projects },
    { href: `${base}/deliverables`, label: "Deliverables", count: counts.deliverables },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/contract`, label: "Contract" },
    { href: `${base}/finance`, label: "Finance" },
    { href: `${base}/contacts`, label: "Contacts", count: counts.contacts },
    { href: `${base}/portal`, label: "Portal" },
    { href: `${base}/activity`, label: "Activity" },
  ];

  function copy() {
    navigator.clipboard?.writeText(`https://${client.portalUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border-b border-ash bg-surface px-8 pt-6">
      <div className="flex flex-wrap items-start gap-4">
        <BrandMark name={client.name} color={client.brandColor} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-h2 font-semibold">{client.name}</h1>
            <StagePill stage={(STAGE_LABEL[client.stage] ?? "active") as Stage} />
            {client.templateName ? <TypeChip>{client.templateName}</TypeChip> : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-steel">
            {client.accountLead ? (
              <span className="flex items-center gap-1.5">
                <Avatar name={client.accountLead} size="xs" />
                {client.accountLead}, account lead
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <span className="font-mono">{client.portalUrl}</span>
              <button
                type="button"
                onClick={copy}
                title="Copy portal link"
                className="inline-flex size-5 items-center justify-center rounded-chip text-fog hover:bg-canvas hover:text-charcoal"
              >
                {copied ? (
                  <Check className="size-3 text-success-fg" strokeWidth={2} />
                ) : (
                  <Copy className="size-3" strokeWidth={1.5} />
                )}
              </button>
              {copied ? (
                <span className="animate-enter text-success-fg">Copied</span>
              ) : null}
            </span>
          </div>
        </div>

        <Link
          href={`/api/preview?slug=${client.portalSlug}&role=APPROVER`}
          target="_blank"
          className={buttonVariants({ variant: "secondary" })}
        >
          <Eye className="size-3.5" strokeWidth={1.5} />
          Preview as client
        </Link>
      </div>

      <TabStrip className="mt-5 border-b-0">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} tabIndex={-1}>
            <Tab active={pathname === t.href} count={t.count}>
              {t.label}
            </Tab>
          </Link>
        ))}
      </TabStrip>
    </div>
  );
}
