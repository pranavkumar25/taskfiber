import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   The landing page's product illustrations.

   Each one is drawn as UI rather than as a screenshot, so it stays sharp,
   reflows on a phone and can be read by a screen reader as the table or
   record it depicts. They follow the product's rules: mono for data, colour
   only where something needs attention.
--------------------------------------------------------------------------- */

type Tone = "ok" | "warn" | "bad" | "muted";

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-emerald-400",
  warn: "text-amber-300",
  bad: "text-red-400",
  muted: "text-white/55",
};

const TONE_DOT: Record<Tone, string> = {
  ok: "bg-emerald-400",
  warn: "bg-amber-300",
  bad: "bg-red-400",
  muted: "bg-white/30",
};

/* --- Hero: the client roster -------------------------------------------- */

const ROSTER: {
  client: string;
  engagement: string;
  cycle: string;
  allowance: { label: string; used: number; of: number };
  receivables: { label: string; tone: Tone };
  action: { label: string; tone: Tone; flag?: boolean };
}[] = [
  {
    client: "Northwind Foods",
    engagement: "SEO retainer",
    cycle: "Sep · 18/30",
    allowance: { label: "31 / 40 hrs", used: 31, of: 40 },
    receivables: { label: "₹1,20,000 due 4d", tone: "warn" },
    action: { label: "Approved via email · 2h", tone: "ok" },
  },
  {
    client: "Kite & Co",
    engagement: "Brand identity",
    cycle: "Refinement",
    allowance: { label: "Rounds 2 / 2", used: 2, of: 2 },
    receivables: { label: "Paid", tone: "ok" },
    action: { label: "Changes requested · v3", tone: "warn" },
  },
  {
    client: "Arcline",
    engagement: "Design subscription",
    cycle: "Cycle 7",
    allowance: { label: "9 / 12 req", used: 9, of: 12 },
    receivables: { label: "32d overdue", tone: "bad" },
    action: { label: "No response · 6d", tone: "bad", flag: true },
  },
  {
    client: "Halden Labs",
    engagement: "Dev sprint retainer",
    cycle: "Sprint 14",
    allowance: { label: "7 / 10 days", used: 7, of: 10 },
    receivables: { label: "Paid", tone: "ok" },
    action: { label: "Accepted at demo · 1d", tone: "ok" },
  },
];

export function ClientRoster() {
  return (
    <figure className="overflow-hidden rounded-[14px] border border-night-line bg-night-raised shadow-[0_40px_80px_-24px_rgb(0_0_0/0.6)]">
      <div className="flex items-center gap-3 border-b border-night-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/12" />
          <span className="size-2.5 rounded-full bg-white/12" />
          <span className="size-2.5 rounded-full bg-white/12" />
        </span>
        <span className="font-mono text-meta text-white/55">Clients · 4 active</span>
        <span className="ml-auto hidden items-center gap-1.5 font-mono text-meta text-white/40 sm:flex">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Synced 2m ago
        </span>
      </div>
      <div className="scrollbar-none relative overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left font-mono text-meta">
          <caption className="sr-only">
            A sample client roster: engagement, cycle, allowance, receivables and the
            last client action for four clients.
          </caption>
          <thead>
            <tr className="text-[10.5px] tracking-[0.08em] text-white/40 uppercase">
              {["Client", "Engagement", "Cycle", "Allowance", "Receivables", "Last client action"].map(
                (h) => (
                  <th key={h} scope="col" className="px-4 py-2.5 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {ROSTER.map((r) => {
              const pct = r.allowance.used / r.allowance.of;
              return (
                <tr key={r.client} className="border-t border-night-line text-white/85">
                  <th scope="row" className="px-4 py-3.5 font-sans text-body font-semibold text-white">
                    {r.client}
                  </th>
                  <td className="px-4 py-3.5 text-white/70">{r.engagement}</td>
                  <td className="px-4 py-3.5 text-white/70">{r.cycle}</td>
                  <td className="px-4 py-3.5">
                    <span className="block">{r.allowance.label}</span>
                    <span className="mt-1.5 block h-[3px] w-24 overflow-hidden rounded-full bg-white/10" aria-hidden>
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          pct >= 1 ? "bg-amber-300" : pct >= 0.75 ? "bg-white/70" : "bg-white/45",
                        )}
                        style={{ width: `${Math.min(100, pct * 100)}%` }}
                      />
                    </span>
                  </td>
                  <td className={cn("px-4 py-3.5", TONE_TEXT[r.receivables.tone])}>
                    {r.receivables.label}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <span className={cn("size-1.5 rounded-full", TONE_DOT[r.action.tone])} aria-hidden />
                      <span className={r.action.tone === "ok" ? "text-white/80" : TONE_TEXT[r.action.tone]}>
                        {r.action.label}
                      </span>
                      {r.action.flag ? (
                        <span className="text-red-400" aria-label="Flagged">
                          ⚑
                        </span>
                      ) : null}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/* --- 01 · Pattern card ---------------------------------------------------- */

export function PatternCard() {
  const rows = [
    ["Allowance", "12 requests / month · 2 revisions each"],
    ["Queue", "1 active · 1 queued"],
    ["Approval", "Named approver · auto-approve after 7d: off"],
    ["Billing", "Monthly, in advance · overage per request"],
    ["Report", "Sent with the invoice"],
  ];
  return (
    <Frame>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ash px-5 py-4">
        <p className="font-heading text-[17px] font-bold text-charcoal">Design subscription</p>
        <p className="font-mono text-meta text-steel">v4 · used by 11 clients</p>
      </div>
      <dl className="divide-y divide-ash">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[96px_1fr] gap-4 px-5 py-3 sm:grid-cols-[120px_1fr]">
            <dt className="text-meta font-medium tracking-[0.04em] text-fog uppercase">{k}</dt>
            <dd className="font-mono text-meta text-charcoal">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-2 border-t border-ash bg-canvas/60 px-5 py-3">
        <span className="rounded-chip border border-ash bg-surface px-2 py-0.5 font-mono text-[11px] text-steel">
          Install
        </span>
        <span className="rounded-chip border border-ash bg-surface px-2 py-0.5 font-mono text-[11px] text-steel">
          Clone from Arcline
        </span>
        <span className="ml-auto font-mono text-[11px] text-fog">pattern</span>
      </div>
    </Frame>
  );
}

/* --- 02 · The digest in a client's inbox --------------------------------- */

export function DigestEmail() {
  return (
    <Frame>
      <div className="space-y-1 border-b border-ash px-5 py-4 font-mono text-meta">
        <p>
          <span className="text-fog">From </span>
          <span className="text-charcoal">Kite Studio</span>
          <span className="text-steel"> &lt;updates@kitestudio.in&gt;</span>
        </p>
        <p>
          <span className="text-fog">Subject </span>
          <span className="font-sans text-body font-semibold text-charcoal">
            Northwind · week 38 · 2 things need you
          </span>
        </p>
      </div>
      <div className="space-y-5 px-5 py-5">
        <DigestBlock label="Needs you">
          <DigestAction title="Homepage hero v3" actions={["Approve", "Request changes"]} />
          <DigestAction title="Invoice #1042 · ₹1,20,000" mono actions={["Pay with UPI"]} />
        </DigestBlock>
        <DigestBlock label="Delivered this week">
          <p className="text-body text-charcoal">4 blog posts published · technical audit complete</p>
        </DigestBlock>
        <DigestBlock label="Allowance">
          <p className="font-mono text-meta text-charcoal">31 of 40 hours used · 12 days left in cycle</p>
          <Meter used={31} of={40} className="mt-2" />
        </DigestBlock>
      </div>
    </Frame>
  );
}

function DigestBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DigestAction({
  title,
  actions,
  mono,
}: {
  title: string;
  actions: string[];
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-control border border-ash px-3 py-2.5">
      <span className={cn("flex-1 text-body text-charcoal", mono && "font-mono text-meta")}>{title}</span>
      <span className="flex gap-1.5">
        {actions.map((a, i) => (
          <span
            key={a}
            className={cn(
              "inline-flex h-7 items-center rounded-control px-2.5 text-meta font-medium",
              i === 0 ? "bg-charcoal text-white" : "border border-ash bg-surface text-charcoal",
            )}
          >
            {a}
          </span>
        ))}
      </span>
    </div>
  );
}

/* --- 03 · The scope ledger, seen from both sides -------------------------- */

export function ScopeLedger() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Frame>
        <div className="flex items-center justify-between border-b border-ash px-5 py-3">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">
            Operator view
          </span>
          <span className="font-mono text-[11px] text-fog">Kite &amp; Co</span>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-body font-semibold text-charcoal">Revision rounds</span>
              <span className="font-mono text-meta text-charcoal">2 / 2</span>
            </div>
            <Meter used={2} of={2} segments={2} className="mt-2.5" />
          </div>
          <Notice>
            Allowance used. The next &ldquo;changes requested&rdquo; is billed as overage,
            itemised on the invoice.
          </Notice>
          <p className="font-mono text-[11px] text-fog">Brand identity · Refinement · v3</p>
        </div>
      </Frame>
      <Frame>
        <div className="flex items-center justify-between border-b border-ash px-5 py-3">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">
            Client digest
          </span>
          <span className="font-mono text-[11px] text-fog">week 38</span>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">Allowance</p>
            <p className="mt-1.5 font-mono text-meta text-charcoal">2 of 2 revision rounds used</p>
            <Meter used={2} of={2} segments={2} className="mt-2.5" />
          </div>
          <Notice>
            You&rsquo;ve used both included rounds. Further changes are itemised on the next invoice.
          </Notice>
          <p className="font-mono text-[11px] text-fog">Same number. Both sides. Before the work.</p>
        </div>
      </Frame>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-control bg-warning-tint px-3 py-2.5 text-meta text-warning-fg">
      <span aria-hidden className="mt-[5px] size-1.5 shrink-0 rounded-full bg-warning" />
      <span>{children}</span>
    </p>
  );
}

/* --- Engagement types: one client, two engagements ------------------------ */

export function EngagementTree() {
  const rows = [
    ["Brand identity", "project", "milestone billing 50 / 50", "Refinement"],
    ["Design subscription", "subscription", "₹45,000 / month in advance", "Cycle 3"],
  ];
  return (
    <Frame>
      <div className="flex items-center gap-3 border-b border-ash px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-control bg-charcoal font-heading text-body font-bold text-white">
          K
        </span>
        <span className="font-heading text-[17px] font-bold text-charcoal">Kite &amp; Co</span>
        <span className="ml-auto font-mono text-meta text-fog">2 engagements</span>
      </div>
      <ul className="py-2">
        {rows.map(([name, type, billing, state], i) => (
          <li key={name} className="relative py-3.5 pr-5 pl-14">
            <span
              aria-hidden
              className={cn(
                "absolute left-[29px] w-px bg-smoke",
                i === rows.length - 1 ? "top-0 h-[26px]" : "inset-y-0",
              )}
            />
            <span aria-hidden className="absolute top-[26px] left-[29px] h-px w-4 bg-smoke" />
            <span className="flex items-center justify-between gap-3">
              <span className="text-item font-semibold text-charcoal">{name}</span>
              <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] text-charcoal">
                {state}
              </span>
            </span>
            <span className="mt-1 flex flex-wrap gap-x-2 font-mono text-meta text-steel">
              <span>{type}</span>
              <span className="text-smoke" aria-hidden>·</span>
              <span>{billing}</span>
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* --- Shared --------------------------------------------------------------- */

export function Frame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-ash bg-surface shadow-[0_1px_2px_rgb(23_23_23/0.04),0_12px_32px_-12px_rgb(23_23_23/0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Meter({
  used,
  of,
  segments,
  className,
}: {
  used: number;
  of: number;
  segments?: number;
  className?: string;
}) {
  const full = used >= of;
  if (segments) {
    return (
      <span className={cn("flex gap-1", className)} aria-hidden>
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i < used ? (full ? "bg-warning" : "bg-charcoal") : "bg-ash")}
          />
        ))}
      </span>
    );
  }
  return (
    <span className={cn("block h-1.5 overflow-hidden rounded-full bg-ash", className)} aria-hidden>
      <span
        className={cn("block h-full rounded-full", used / of >= 0.8 ? "bg-warning" : "bg-charcoal")}
        style={{ width: `${Math.min(100, (used / of) * 100)}%` }}
      />
    </span>
  );
}
