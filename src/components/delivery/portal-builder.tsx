"use client";

import * as React from "react";
import { GripVertical, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHead } from "@/components/ui/surface";
import { Segmented, Toggle } from "@/components/ui/field";
import { useToast } from "@/components/ui/toaster";
import { contrastLabel } from "@/lib/color";
import { toggleModuleAction } from "@/server/actions";
import { cn } from "@/lib/utils";

export type BuilderModule = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  roles: string[];
  order: number;
};

const ROLE_WORD: Record<string, string> = {
  APPROVER: "Approver",
  COLLABORATOR: "Collaborator",
  VIEWER: "Viewer",
  BILLING: "Billing",
};

/**
 * 6.9 · Portal builder.
 *
 * Three panes: the module map, a live preview, and branding. The preview swaps
 * with the persona, which is the whole point — an account lead should see the
 * collaborator's Invoices placeholder before they send the link, not after.
 *
 * Turning a module on publishes nothing. Visibility is a separate decision, and
 * the footnote says so.
 */
export function PortalBuilder({
  clientSlug,
  clientName,
  agencyName,
  portalUrl,
  accentHex,
  logoAsset,
  emailSender,
  customDomain,
  dnsVerified,
  templateName,
  modules: initial,
  contacts,
}: {
  clientSlug: string;
  clientName: string;
  agencyName: string;
  portalUrl: string;
  accentHex: string;
  logoAsset: string | null;
  emailSender: string | null;
  customDomain: string | null;
  dnsVerified: boolean;
  templateName: string | null;
  modules: BuilderModule[];
  contacts: { id: string; name: string; role: string }[];
}) {
  const [modules, setModules] = React.useState(initial);
  const [persona, setPersona] = React.useState(contacts[0]?.role ?? "APPROVER");
  const [whiteLabel, setWhiteLabel] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const toast = useToast();

  const on = modules.filter((m) => m.enabled);
  const contrast = contrastLabel(accentHex);
  const viewer = contacts.find((c) => c.role === persona) ?? contacts[0];

  const navFor = on.filter((m) => m.key !== "OVERVIEW");
  const seesInvoices = persona === "APPROVER" || persona === "BILLING";

  function toggle(m: BuilderModule, enabled: boolean) {
    setModules((list) => list.map((x) => (x.id === m.id ? { ...x, enabled } : x)));
    startTransition(() => toggleModuleAction({ moduleId: m.id, enabled, clientSlug }));
  }

  return (
    <div className="px-8 pt-6 pb-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3 font-semibold">Portal builder</h2>
          <p className="mt-0.5 text-meta text-steel">
            {on.length} of {modules.length} modules on
            {templateName ? ` · ${templateName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-caps">Preview as</span>
          <Segmented
            value={persona}
            onChange={setPersona}
            options={contacts.map((c) => ({
              value: c.role,
              label: `${c.name.split(" ")[0]} · ${ROLE_WORD[c.role]?.toLowerCase()}`,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* Pane 1 — the module map */}
        <Card className="h-fit overflow-hidden">
          <p className="label-caps border-b border-ash px-3 py-2">Modules · drag to reorder</p>
          <ul>
            {modules.map((m) => {
              const locked = m.key === "OVERVIEW";
              return (
                <li
                  key={m.id}
                  className="flex min-h-11 items-center gap-2.5 border-b border-canvas px-3 py-2 last:border-b-0"
                >
                  <GripVertical
                    className="size-3 shrink-0 cursor-grab text-smoke"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <Toggle
                    checked={m.enabled}
                    onChange={(next) => !locked && toggle(m, next)}
                    disabled={locked}
                    label={`${m.label} module`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "flex items-center gap-1 truncate text-body font-medium",
                        m.enabled ? "text-charcoal" : "text-fog",
                      )}
                    >
                      {titleFor(m.key)}
                      {locked ? (
                        <Lock className="size-3 text-fog" strokeWidth={1.5} aria-label="Always on" />
                      ) : null}
                    </span>
                    {m.enabled ? (
                      <span className="block truncate text-meta text-steel">
                        <span className="border-b border-dashed border-smoke">{m.label}</span>
                        {" · "}
                        {m.roles.length === 0
                          ? "All roles"
                          : m.roles.map((r) => ROLE_WORD[r]).join(", ")}
                      </span>
                    ) : (
                      <span className="block text-meta text-fog">Off in this portal</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Pane 2 — the live preview */}
        <div className="min-w-0">
          <div
            className="overflow-hidden rounded-card border border-ash bg-canvas shadow-card"
            style={{ ["--accent" as string]: accentHex }}
          >
            <div className="flex h-9 items-center gap-2 border-b border-ash bg-surface px-3">
              <span className="flex gap-1.5">
                <span className="size-2 rounded-full bg-ash" />
                <span className="size-2 rounded-full bg-ash" />
                <span className="size-2 rounded-full bg-ash" />
              </span>
              <span className="mx-auto rounded-full bg-canvas px-3 py-0.5 font-mono text-meta text-steel">
                {portalUrl}
              </span>
            </div>

            <div className="bg-surface">
              <div className="flex h-12 items-center gap-2.5 border-b border-ash px-4">
                <span
                  className="flex size-6 items-center justify-center rounded-[7px] text-meta font-semibold text-white"
                  style={{ background: accentHex }}
                >
                  {agencyName[0]}
                </span>
                <span className="text-body font-semibold text-charcoal">{agencyName}</span>
                <span className="text-smoke">/</span>
                <span className="truncate text-body text-steel">{clientName}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span
                    className="flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: accentHex }}
                  >
                    {viewer?.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                </span>
              </div>

              <div className="scrollbar-none flex gap-4 overflow-x-auto border-b border-ash px-4 py-2 text-meta">
                <span
                  className="shrink-0 font-medium text-charcoal"
                  style={{ boxShadow: `inset 0 -2px 0 ${accentHex}` }}
                >
                  Overview
                </span>
                {navFor.map((m) => (
                  <span key={m.id} className="shrink-0 text-steel">
                    {m.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 bg-canvas p-4">
                {on.some((m) => m.key === "DELIVERABLES") ? (
                  <PreviewBlock title="Needs you">
                    <span className="flex items-center gap-2 text-body">
                      <span className="size-1.5 rounded-full bg-warning" />
                      Approve Diwali creative set v3
                      <span className="ml-auto font-mono text-meta text-steel">Due 19 Sep</span>
                    </span>
                  </PreviewBlock>
                ) : null}

                {on.some((m) => m.key === "TIMELINE") ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PreviewBlock title="In progress">
                      <p className="text-meta text-steel">Flight 2 of 3</p>
                      <span className="mt-2 block h-[3px] rounded-full bg-ash">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: "58%", background: accentHex }}
                        />
                      </span>
                    </PreviewBlock>
                    <PreviewBlock title="Next milestone">
                      <p className="font-mono text-meta text-charcoal">3 Oct 2026 · in 15 days</p>
                      <p className="text-meta text-steel">Diwali flight goes live</p>
                    </PreviewBlock>
                  </div>
                ) : null}

                {on.some((m) => m.key === "UPDATES") ? (
                  <PreviewBlock title="Latest update">
                    <p className="text-body text-charcoal">Week 37: CPA down 12%</p>
                    <p className="text-meta text-steel">Meera Joshi · 16 Sep</p>
                  </PreviewBlock>
                ) : null}

                {on.some((m) => m.key === "DASHBOARDS") ? (
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-ash bg-ash sm:grid-cols-4">
                    {[
                      ["Sessions", "184,220"],
                      ["Ad spend", "₹6,40,000"],
                      ["Purchases", "3,918"],
                      ["CPA", "₹163"],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-surface p-2.5">
                        <p className="text-label text-steel uppercase">{l}</p>
                        <p className="mt-0.5 font-mono text-body font-medium text-charcoal">{v}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {on.some((m) => m.key === "INVOICES") ? (
                  seesInvoices ? (
                    <PreviewBlock title="Invoices">
                      <span className="flex flex-wrap items-center gap-2 text-body">
                        <span className="font-mono">FN-2026-0142</span>
                        <span className="font-mono">₹4,20,000</span>
                        <span className="text-danger-fg">Overdue</span>
                        <span
                          className="ml-auto rounded-control px-2 py-1 text-meta text-white"
                          style={{ background: accentHex }}
                        >
                          Pay with UPI or card
                        </span>
                      </span>
                    </PreviewBlock>
                  ) : (
                    <div className="rounded-card border border-dashed border-smoke bg-surface p-4 text-center text-meta text-steel">
                      Invoices hidden for {viewer?.name} ({ROLE_WORD[persona]?.toLowerCase()})
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-meta text-steel">
            Changes apply to {clientName} only. Toggles reflect immediately in the preview;{" "}
            <span className="font-medium text-charcoal">
              nothing is published by turning a module on.
            </span>
          </p>
        </div>

        {/* Pane 3 — branding and template */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="p-4">
            <CardHead title="Branding" />
            <dl className="mt-3 flex flex-col gap-2.5 text-body">
              <Row label="Logo">
                <span className="flex items-center gap-2">
                  <span className="truncate font-mono text-meta">{logoAsset ?? "None"}</span>
                  <Button variant="secondary" size="xs">
                    Replace
                  </Button>
                </span>
              </Row>
              <Row label="Accent">
                <span className="flex items-center gap-2">
                  <span
                    className="size-4 shrink-0 rounded-chip"
                    style={{ background: accentHex }}
                  />
                  <span className="font-mono text-meta">{accentHex}</span>
                  <span
                    className={cn(
                      "text-meta",
                      contrast.passes ? "text-success-fg" : "text-danger-fg",
                    )}
                  >
                    {contrast.ratio}
                  </span>
                </span>
              </Row>
              {!contrast.passes ? (
                <p className="rounded-control border border-warning/30 bg-warning/6 px-2.5 py-2 text-meta text-warning-fg">
                  White button text will not hold 4.5:1 on this accent. Clients can still read the
                  portal, but the primary buttons will be hard work.
                </p>
              ) : null}
              <Row label="Domain">
                <span className="block truncate font-mono text-meta">{portalUrl}</span>
              </Row>
              {customDomain ? (
                <Row label="Custom">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-meta">{customDomain}</span>
                    <span
                      className={cn(
                        "text-meta",
                        dnsVerified ? "text-success-fg" : "text-warning-fg",
                      )}
                    >
                      {dnsVerified ? "DNS verified" : "DNS pending"}
                    </span>
                  </span>
                </Row>
              ) : null}
              <Row label="Sender">
                <span className="block truncate font-mono text-meta">{emailSender ?? "—"}</span>
              </Row>
              <Row label="White-label">
                <Toggle
                  checked={whiteLabel}
                  onChange={setWhiteLabel}
                  label={`White-label with ${clientName} brand`}
                />
              </Row>
            </dl>
          </Card>

          <Card className="p-4">
            <CardHead title="Template" />
            <p className="mt-2 text-body text-steel">
              Based on <span className="font-medium text-charcoal">{templateName ?? "none"}</span>
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={() => toast(`Saved as template "${agencyName} · ${clientName}"`)}
              >
                Save as template
              </Button>
              <Button variant="ghost" onClick={() => toast("Reset to the template's module map")}>
                Reset to template
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-ash bg-surface p-3">
      <p className="label-caps mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2">
      <dt className="text-meta text-steel">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function titleFor(key: string) {
  return key.charAt(0) + key.slice(1).toLowerCase();
}
