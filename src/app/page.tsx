import type { Metadata } from "next";
import { LINE_Seed_JP } from "next/font/google";
import { ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ClientRoster,
  DigestEmail,
  EngagementTree,
  PatternCard,
  ScopeLedger,
} from "@/components/landing/visuals";
import { EarlyAccessForm } from "@/components/landing/early-access-form";

/* LINE Seed JP sets every heading on this page; Pretendard (self-hosted, see
   globals.css) carries the body and Geist Mono the data. The font is scoped to
   this page, so the product UI never downloads it. */
const lineSeed = LINE_Seed_JP({
  variable: "--font-line-seed",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Taskfiber — Client delivery, run like a product" },
  description:
    "Taskfiber turns how you sell into a reusable engagement pattern, then runs every client on it: intake, scope, approvals, billing and reporting.",
};

/**
 * The landing page.
 *
 * Static and shell-less: it is what a studio sees before it has a workspace.
 * Product illustrations live in `components/landing/visuals.tsx` and are drawn
 * as UI, not screenshots.
 */
export default function LandingPage() {
  return (
    <div className={cn(lineSeed.variable, "min-h-screen bg-surface text-charcoal")}>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Pillars />
        <Teams />
        <EngagementTypes />
        <Workflow />
        <Integrations />
        <Comparison />
        <Principles />
        <EarlyAccess />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

/* --- Chrome ---------------------------------------------------------------- */

function AnnouncementBar() {
  return (
    <div className="bg-night text-meta text-white/70">
      <div className="mx-auto flex max-w-300 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2.5 text-center">
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
          Taskfiber is in private early access for studios and agencies.
        </span>
        <a href="#early-access" className="font-medium text-white underline-offset-4 hover:underline">
          Request an invite →
        </a>
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ash/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-300 items-center gap-8 px-4 sm:px-6">
        <a href="#top" className="shrink-0" aria-label="Taskfiber, back to top">
          <Wordmark />
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-6 text-body text-steel md:flex">
          <a href="#product" className="hover:text-charcoal">Product</a>
          <a href="#how-it-works" className="hover:text-charcoal">How it works</a>
          <a href="#integrations" className="hover:text-charcoal">Integrations</a>
          <a href="#faq" className="hover:text-charcoal">FAQ</a>
        </nav>
        <a
          href="#early-access"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-control bg-charcoal px-4 text-body font-medium text-white hover:bg-charcoal/90"
        >
          Get early access
        </a>
      </div>
    </header>
  );
}

function Wordmark({ dark }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="6" className={dark ? "fill-white" : "fill-charcoal"} />
        <path
          d="M6 8h12M6 12h8M6 16h5"
          strokeWidth="2"
          strokeLinecap="round"
          className={dark ? "stroke-night" : "stroke-white"}
        />
        <circle cx="17" cy="16" r="1.6" className="fill-emerald-400" />
      </svg>
      <span
        className={cn(
          "font-heading text-[17px] font-bold tracking-[-0.01em]",
          dark ? "text-white" : "text-charcoal",
        )}
      >
        Taskfiber
      </span>
    </span>
  );
}

/* --- Hero ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-night text-white">
      {/* A faint ledger grid: the page's one decorative gesture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_50%_0%,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative mx-auto max-w-300 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 lg:pb-24">
        <div className="mx-auto max-w-200 text-center">
          <Eyebrow dark>Client operations for service businesses</Eyebrow>
          <h1 className="mt-6 font-heading text-[40px] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance min-[400px]:text-[44px] sm:text-[64px] lg:text-[76px]">
            Client delivery,{" "}
            run like a product.
          </h1>
          <p className="mx-auto mt-7 max-w-170 text-[17px] leading-[1.6] text-white/65 sm:text-[18px]">
            Taskfiber turns how you sell into a reusable engagement pattern, then runs every
            client on it: intake, scope, approvals, billing and reporting. Clients approve and
            pay from email or WhatsApp. Your team keeps HubSpot, Zoho Books, Figma and GitHub.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#early-access"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-white px-6 text-item font-semibold text-night hover:bg-white/90"
            >
              Get early access
              <ArrowRight className="size-4" strokeWidth={2} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-control border border-white/15 px-6 text-item font-medium text-white hover:border-white/30 hover:bg-white/5"
            >
              See how it works
            </a>
          </div>
          <p className="mt-8 text-meta text-white/45">
            Built for design studios, marketing agencies, dev shops and fractional teams.
          </p>
        </div>

        <div className="mt-16 sm:mt-20">
          <ClientRoster />
        </div>
      </div>
    </section>
  );
}

/* --- Problem --------------------------------------------------------------- */

function Problem() {
  const stats = [
    {
      figure: "10 to 30%",
      body: "Typical client portal adoption in professional services. Clients don't log in.",
    },
    { figure: "58%", body: "Of agency invoices are paid late.", source: "The Kaplan Group, 2026" },
    {
      figure: "1 in 2",
      body: "SaaS licences at small companies go unused. Another login is not the fix.",
      source: "Zylo, 2026",
    },
  ];
  return (
    <Section id="problem">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <H2 className="mt-4">Client work runs on six tools and a WhatsApp thread.</H2>
        </div>
        <div className="space-y-5 text-[17px] leading-[1.65] text-steel lg:pt-9">
          <p>
            Your CRM knows the deal. Zoho Books knows the invoice. Figma knows the file.
            WhatsApp knows the approval.{" "}
            <span className="font-semibold text-charcoal">Nothing knows the client.</span>
          </p>
          <p>
            So someone rebuilds the setup for every new client, answers &ldquo;any update?&rdquo;
            by hand, and finds the extra work after the invoice has gone out.
          </p>
        </div>
      </div>
      <div className="mt-16 grid divide-y divide-ash overflow-hidden rounded-[14px] border border-ash md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((s) => (
          <div key={s.figure} className="bg-surface p-7 sm:p-8">
            <p className="font-heading text-[44px] leading-none font-extrabold tracking-[-0.03em] text-charcoal">
              {s.figure}
            </p>
            <p className="mt-5 text-read text-steel">{s.body}</p>
            {s.source ? <p className="mt-4 font-mono text-[11px] text-fog">{s.source}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --- Product pillars ------------------------------------------------------- */

function Pillars() {
  return (
    <div id="product" className="scroll-mt-16">
      <Pillar
        index="01"
        name="Patterns"
        title="Set up a client in minutes, not a week."
        lede="A pattern is your engagement, written once: intake, scope and allowance, milestones or cadence, deliverable types, approval rules, billing model, cycle report and offboarding. Every new client starts from one."
        points={[
          ["Starter library", "for brand projects, design subscriptions, SEO retainers, dev sprints and fractional roles. Install, then change only what's different."],
          ["Clone a client", "you already set up. Scope, cadence and billing carry over; contacts start blank."],
          ["Won deal → engagement.", "When a deal moves to Won in HubSpot, Taskfiber opens the pattern picker. One click creates the engagement and sends the intake link."],
        ]}
        visual={<PatternCard />}
        tone="paper"
      />
      <Pillar
        index="02"
        name="Inbox-native client channel"
        title="Your clients never need another login."
        lede="Every client action works from the message they already received."
        points={[
          ["Weekly digest", "per engagement: what needs them, what shipped, what's next, allowance used."],
          ["Reply to approve.", "“Approved” becomes an approval. Anything ambiguous becomes a comment, never a misfiled decision."],
          ["Signed action links", "to approve, upload or pay. Single use, scoped to one contact, work from email or WhatsApp."],
          ["Intake by link.", "Clients complete onboarding in five minutes without an account."],
          ["Approver, payer and collaborator", "can be different people at the same client."],
          ["Branded client space", "for anyone who wants one. Your logo, colours, domain and email sender, on every plan."],
        ]}
        visual={<DigestEmail />}
        flip
      />
      <Pillar
        index="03"
        name="Approvals and scope"
        title="Every sign-off becomes a fact on the record."
        lede="Deliverables are versioned, not named final-final-v2. Each decision is stored with who, when, which version and which channel."
        extra={
          <>
            <div className="mt-8 rounded-[10px] border border-ash bg-surface p-4 shadow-card">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-meta text-charcoal">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Approved as of v3 · Karan Mehta · 14 Sep, 18:42 · via email
              </p>
            </div>
            <p className="mt-3 text-body text-steel">That one line ends most scope arguments.</p>
            <p className="mt-8 text-read text-steel">
              Every engagement carries an allowance in the unit you actually sell: requests,
              revisions, hours, days or deliverables. Each &ldquo;changes requested&rdquo; draws it
              down. At 80%, both sides get a heads-up. Overage lands on the invoice itemised, so
              nothing gets absorbed and nothing comes as a surprise.
            </p>
          </>
        }
        visual={<ScopeLedger />}
        tone="paper"
        wideVisual
      />
      <Pillar
        index="04"
        name="Reports and money"
        title="Show the value. Then send the invoice."
        lede="When a cycle closes, Taskfiber drafts the report from what actually happened: approvals, merged pull requests, published work, GA4 movement, allowance used. You edit it. It never sends itself. The invoice follows the report, so clients see what they got before they're asked to pay."
        points={[
          ["Receivables beside the work.", "Read from Zoho Books or QuickBooks and bucketed into due, 1 to 30, 31 to 60 and 60+ days."],
          ["Pay from the message.", "UPI, cards and netbanking via Razorpay. Stripe for overseas clients in their currency. No processing markup."],
          ["GST-ready invoicing", "with GSTIN and HSN/SAC for teams without an accounting tool."],
          ["Last-synced time", "on every number that comes from another system."],
        ]}
        visual={<Receivables />}
        flip
      />
    </div>
  );
}

function Pillar({
  index,
  name,
  title,
  lede,
  points,
  extra,
  visual,
  flip,
  tone,
  wideVisual,
}: {
  index: string;
  name: string;
  title: string;
  lede: string;
  points?: [string, string][];
  extra?: React.ReactNode;
  visual: React.ReactNode;
  flip?: boolean;
  tone?: "paper";
  wideVisual?: boolean;
}) {
  return (
    <Section tone={tone}>
      <div
        className={cn(
          "grid items-center gap-12 lg:gap-20",
          wideVisual ? "lg:grid-cols-[1fr_1.15fr]" : "lg:grid-cols-2",
        )}
      >
        <div className={cn(flip && "lg:order-2")}>
          <p className="flex items-center gap-3 font-mono text-meta text-steel">
            <span className="text-charcoal">{index}</span>
            <span className="h-px w-6 bg-smoke" aria-hidden />
            {name}
          </p>
          <H2 className="mt-5">{title}</H2>
          <p className="mt-5 text-[17px] leading-[1.65] text-steel">{lede}</p>
          {points ? (
            <ul className="mt-8 space-y-3.5">
              {points.map(([lead, rest]) => (
                <li key={lead} className="flex gap-3 text-read text-steel">
                  <Check className="mt-1 size-4 shrink-0 text-charcoal" strokeWidth={2} aria-hidden />
                  <span>
                    <span className="font-semibold text-charcoal">{lead}</span> {rest}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {extra}
        </div>
        <div className={cn(flip && "lg:order-1")}>{visual}</div>
      </div>
    </Section>
  );
}

/** The 04 visual: the report, then the invoice, with receivables buckets. */
function Receivables() {
  const buckets = [
    ["Due", "₹1,20,000", 46],
    ["1 to 30", "₹65,000", 25],
    ["31 to 60", "₹54,000", 21],
    ["60+", "₹21,000", 8],
  ] as const;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[12px] border border-ash bg-surface shadow-[0_1px_2px_rgb(23_23_23/0.04),0_12px_32px_-12px_rgb(23_23_23/0.12)]">
        <div className="flex items-center justify-between border-b border-ash px-5 py-3">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">
            Cycle report · draft
          </span>
          <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] text-steel">
            Not sent
          </span>
        </div>
        <ul className="divide-y divide-ash font-mono text-meta">
          {[
            ["Approvals", "6"],
            ["Posts published", "4"],
            ["Organic sessions (GA4)", "+18.4%"],
            ["Allowance used", "31 / 40 hrs"],
          ].map(([k, v]) => (
            <li key={k} className="flex justify-between px-5 py-2.5">
              <span className="text-steel">{k}</span>
              <span className="text-charcoal">{v}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-ash bg-canvas/60 px-5 py-3">
          <span className="text-meta text-steel">Then: Invoice #1042 · ₹1,20,000</span>
          <span className="inline-flex h-7 items-center rounded-control bg-charcoal px-2.5 text-meta font-medium text-white">
            Pay with UPI
          </span>
        </div>
      </div>
      <div className="rounded-[12px] border border-ash bg-surface p-5 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">Receivables</span>
          <span className="font-mono text-[11px] text-fog">Zoho Books · synced 4m ago</span>
        </div>
        <div className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {buckets.map(([label, , pct], i) => (
            <span
              key={label}
              className={cn(
                "h-full",
                ["bg-charcoal", "bg-steel", "bg-warning", "bg-danger"][i],
              )}
              style={{ width: `${pct}%` }}
            />
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {buckets.map(([label, amount], i) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-meta text-steel">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    ["bg-charcoal", "bg-steel", "bg-warning", "bg-danger"][i],
                  )}
                  aria-hidden
                />
                {label}
              </dt>
              <dd className="mt-0.5 font-mono text-meta text-charcoal">{amount}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* --- Teams ----------------------------------------------------------------- */

function Teams() {
  const roles = [
    ["Founder", "Nothing to change", "One row per client: work, scope, money and last client action"],
    ["Account manager", "Their PM tool", "Digests and report drafts instead of status emails; a board of everything waiting on the client"],
    ["Sales", "HubSpot, Pipedrive or Zoho CRM", "Won deals become live engagements without re-keying"],
    ["Accounts", "Zoho Books or QuickBooks", "Overdue and paid status next to the work, with no double entry"],
    ["Delivery", "Figma, GitHub, Linear, Drive", "New versions and merged work reach the client timeline automatically"],
    ["Client", "Their inbox and WhatsApp", "One tap to approve, upload or pay"],
  ];
  return (
    <Section tone="paper">
      <SectionIntro
        eyebrow="Made for cross-functional teams"
        title="One client record. Every role. No migrations."
        sub="Client work crosses sales, delivery, account management and accounts. Each team keeps its tool. Taskfiber connects them into one picture of the client."
      />
      <div className="mt-14 overflow-hidden rounded-[14px] border border-ash bg-surface">
        <div className="hidden grid-cols-[180px_1fr_1.6fr] gap-6 border-b border-ash bg-canvas/70 px-6 py-3 text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase md:grid">
          <span>Role</span>
          <span>Keeps</span>
          <span>Gets</span>
        </div>
        <ul className="divide-y divide-ash">
          {roles.map(([role, keeps, gets]) => (
            <li key={role} className="grid gap-1.5 px-6 py-5 md:grid-cols-[180px_1fr_1.6fr] md:gap-6">
              <span className="font-heading text-[15px] font-bold text-charcoal">{role}</span>
              <span className="text-body text-steel">
                <span className="mr-1.5 text-fog md:hidden">Keeps</span>
                {keeps}
              </span>
              <span className="text-body text-charcoal">
                <span className="mr-1.5 text-fog md:hidden">Gets</span>
                {gets}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-5 text-center text-body text-steel">
        Roles for owner, member and limited seats, with per-client access for larger teams.
      </p>
    </Section>
  );
}

/* --- Engagement types ------------------------------------------------------ */

function EngagementTypes() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <Eyebrow>Engagement types</Eyebrow>
          <H2 className="mt-4">Projects, retainers and subscriptions. Same client, same record.</H2>
          <p className="mt-5 text-[17px] leading-[1.65] text-steel">
            Most tools make you pick one shape per client. Taskfiber runs them side by side, each
            with its own cycle, allowance and billing.
          </p>
        </div>
        <EngagementTree />
      </div>
    </Section>
  );
}

/* --- Workflow -------------------------------------------------------------- */

function Workflow() {
  const steps = [
    ["Day 0", "The deal closes in HubSpot. You pick the SEO retainer pattern. The engagement is created and the intake link goes out."],
    ["Day 1", "The client fills intake from the link: analytics access, goals, approvers, billing contact."],
    ["Every Monday", "A digest reaches the client by email or WhatsApp. They approve two posts by replying."],
    ["Day 24", "Hours hit 80% of allowance. Your account manager and the client both see it before any extra work starts."],
    ["Day 30", "The cycle closes. The report drafts itself from activity and GA4. You add two lines of judgment and send."],
    ["Day 30, after the report", "The invoice goes out with a UPI link. Payment reconciles to the engagement. Cycle 2 opens."],
  ];
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-night text-white">
      <div className="mx-auto max-w-300 px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow dark>How it works</Eyebrow>
            <H2 className="mt-4 text-white">One cycle, end to end.</H2>
            <p className="mt-5 max-w-110 text-[17px] leading-[1.65] text-white/60">
              An SEO retainer, from the won deal to the first payment — and straight into the next
              cycle.
            </p>
          </div>
          <ol className="relative">
            <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-night-line" />
            {steps.map(([when, what], i) => (
              <li key={when} className="relative pb-10 pl-10 last:pb-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[7px] left-0 size-[11px] rounded-full border-2",
                    i === steps.length - 1
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-white/40 bg-night",
                  )}
                />
                <p className="font-mono text-meta text-white/50">{when}</p>
                <p className="mt-2 text-[17px] leading-[1.6] text-white/85">{what}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* --- Integrations ---------------------------------------------------------- */

type IntegrationState = "live" | "rolling" | "coming";

/** At launch the live set is Zoho Books, HubSpot, Razorpay and Stripe. */
const LIVE = new Set(["Zoho Books", "HubSpot", "Razorpay", "Stripe"]);

const INTEGRATIONS: [string, string[]][] = [
  ["CRM", ["HubSpot", "Pipedrive", "Zoho CRM"]],
  ["Accounting", ["Zoho Books", "QuickBooks", "Xero", "Tally"]],
  ["Payments", ["Razorpay", "UPI", "Stripe"]],
  ["Delivery", ["Figma", "GitHub", "Linear", "Google Drive", "Notion", "ClickUp"]],
  ["Performance data", ["GA4", "Search Console", "Meta Ads", "Google Ads"]],
  ["Communication", ["Gmail", "Outlook", "Slack", "WhatsApp Business"]],
];

function stateOf(name: string): IntegrationState {
  if (LIVE.has(name)) return "live";
  if (name === "Tally") return "coming";
  return "rolling";
}

function Integrations() {
  return (
    <Section id="integrations">
      <SectionIntro
        eyebrow="Integrations"
        title="Sits on top of the stack you already run."
        sub="Your tools stay the source of truth. Taskfiber reads from them, and writes only where you allow it."
      />
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-meta text-steel">
        <Legend state="live">Live</Legend>
        <Legend state="rolling">Rolling out</Legend>
        <Legend state="coming">Coming</Legend>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-[14px] border border-ash bg-ash sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map(([group, tools]) => (
          <div key={group} className="bg-surface p-6">
            <p className="text-[10.5px] font-semibold tracking-[0.1em] text-fog uppercase">{group}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {tools.map((t) => {
                const s = stateOf(t);
                return (
                  <li
                    key={t}
                    className={cn(
                      "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-body",
                      s === "live" && "border-smoke bg-surface font-medium text-charcoal",
                      s === "rolling" && "border-ash bg-canvas/60 text-steel",
                      s === "coming" && "border-dashed border-fog/60 text-fog",
                    )}
                  >
                    <StateDot state={s} />
                    {t}
                    <span className="sr-only">
                      {s === "live" ? "(live)" : s === "rolling" ? "(rolling out)" : "(coming)"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function StateDot({ state }: { state: IntegrationState }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        state === "live" && "bg-success",
        state === "rolling" && "bg-fog",
        state === "coming" && "border border-fog",
      )}
    />
  );
}

function Legend({ state, children }: { state: IntegrationState; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StateDot state={state} />
      {children}
    </span>
  );
}

/* --- Comparison ------------------------------------------------------------ */

type Mark = "yes" | "no" | string;

const COMPARISON: [string, Mark, Mark, Mark, Mark][] = [
  ["Clients act without logging in", "yes", "no", "Partial", "no"],
  ["Project, retainer and subscription on one client", "yes", "no", "no", "no"],
  ["Scope tracked against allowance", "yes", "no", "no", "no"],
  ["Connects your CRM and accounting instead of replacing them", "yes", "Partial", "no", "Partial"],
  ["UPI, Razorpay and GST", "yes", "no", "no", "no"],
  ["White-label on the entry plan", "yes", "Varies", "no", "no"],
];

function Comparison() {
  const heads = ["Taskfiber", "Client portals", "Freelancer suites", "PM tools with guest access"];
  return (
    <Section tone="paper">
      <SectionIntro
        eyebrow="Comparison"
        title="Why not a client portal, a freelancer suite or a PM tool?"
      />
      <div className="mt-14 overflow-hidden rounded-[14px] border border-ash bg-surface">
        <div className="scrollbar-none relative overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ash">
                <th scope="col" className="w-[34%] px-6 py-4">
                  <span className="sr-only">Capability</span>
                </th>
                {heads.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={cn(
                      "px-4 py-4 text-center text-body font-semibold",
                      i === 0 ? "bg-night font-heading text-white" : "text-steel",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([row, ...cells], r) => (
                <tr key={row} className={cn(r > 0 && "border-t border-ash")}>
                  <th scope="row" className="px-6 py-4 text-body font-medium text-charcoal">
                    {row}
                  </th>
                  {cells.map((c, i) => (
                    <td
                      key={i}
                      className={cn("px-4 py-4 text-center", i === 0 && "bg-night")}
                    >
                      <MarkCell value={c} featured={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function MarkCell({ value, featured }: { value: Mark; featured?: boolean }) {
  if (value === "yes")
    return (
      <span className="inline-flex items-center justify-center">
        <Check className={cn("size-[18px]", featured ? "text-emerald-400" : "text-success")} strokeWidth={2.25} />
        <span className="sr-only">Yes</span>
      </span>
    );
  if (value === "no")
    return (
      <span className="inline-flex items-center justify-center">
        <X className="size-4 text-smoke" strokeWidth={2} />
        <span className="sr-only">No</span>
      </span>
    );
  return <span className="text-meta text-steel">{value}</span>;
}

/* --- Principles ------------------------------------------------------------ */

function Principles() {
  const items = [
    ["Your data leaves whenever you want.", "Full export of clients, engagements, deliverables and invoices."],
    ["Your books stay yours.", "We read from your accounting tool and never write the same invoice twice."],
    ["Nothing pressures your client by default.", "Auto-approve and allowance pauses are off until you turn them on."],
    ["AI drafts, you send.", "Reports and replies are never sent unattended."],
  ];
  return (
    <Section>
      <SectionIntro eyebrow="Principles" title="Built to sit beside your stack, not trap you." />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-ash bg-ash sm:grid-cols-2">
        {items.map(([title, body], i) => (
          <li key={title} className="bg-surface p-7 sm:p-9">
            <span className="font-mono text-meta text-fog">0{i + 1}</span>
            <h3 className="mt-5 font-heading text-[20px] leading-snug font-bold tracking-[-0.01em] text-charcoal">
              {title}
            </h3>
            <p className="mt-2 text-read text-steel">{body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* --- Early access ---------------------------------------------------------- */

function EarlyAccess() {
  return (
    <section id="early-access" className="scroll-mt-16 bg-night text-white">
      <div className="mx-auto grid max-w-300 gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-32">
        <div>
          <Eyebrow dark>Private early access</Eyebrow>
          <H2 className="mt-4 text-white">Build it with us.</H2>
          <p className="mt-5 max-w-110 text-[17px] leading-[1.65] text-white/60">
            We&rsquo;re onboarding a small group of studios and agencies. Early members shape the
            starter patterns, run Taskfiber with three real clients alongside us, and have a direct
            line to the founder.
          </p>
          <ul className="mt-10 space-y-3 text-read text-white/75">
            {["Shape the starter patterns", "Run three real clients with us", "A direct line to the founder"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/8">
                    <Check className="size-3 text-emerald-400" strokeWidth={2.5} aria-hidden />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>
        <EarlyAccessForm />
      </div>
    </section>
  );
}

/* --- FAQ ------------------------------------------------------------------- */

const FAQ = [
  ["Do clients need an account?", "No. Every action works from email, WhatsApp or a signed link. A branded space is there for clients who want one."],
  ["Do we have to move off HubSpot or Zoho Books?", "No. Taskfiber reads from them and writes only where you allow it. Your sales and accounts teams don't change tools."],
  ["We use Tally. Does that work?", "Tally support is on the roadmap. Until then, invoices can be issued from Taskfiber or mirrored from Zoho Books."],
  ["Is this a project management tool?", "No. Keep Linear, ClickUp or Asana for internal tasks. Taskfiber runs the client side: scope, approvals, updates, reports and billing."],
  ["How does WhatsApp work?", "Digests, approvals and payment links go out through WhatsApp Business under your brand once your business is verified."],
  ["What does it cost?", "Pricing is shared with early access members first."],
];

function Faq() {
  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <H2 className="mt-4">Questions, answered.</H2>
        </div>
        <div className="divide-y divide-ash border-y border-ash">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-[17px] font-bold text-charcoal">{q}</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-ash text-steel group-open:bg-charcoal group-open:text-white">
                  <Plus className="size-3.5 group-open:hidden" strokeWidth={2} aria-hidden />
                  <Minus className="hidden size-3.5 group-open:block" strokeWidth={2} aria-hidden />
                </span>
              </summary>
              <p className="max-w-150 pb-6 text-read text-steel">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* --- Footer ---------------------------------------------------------------- */

function SiteFooter() {
  const links = [
    ["Product", "#product"],
    ["Integrations", "#integrations"],
    ["Early access", "#early-access"],
    ["Privacy", "#"],
    ["Terms", "#"],
  ];
  return (
    <footer className="border-t border-night-line bg-night text-white">
      <div className="mx-auto flex max-w-300 flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <Wordmark dark />
          <p className="mt-3 text-body text-white/50">Client delivery, run like a product.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-body text-white/60 md:ml-auto">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/* --- Shared ---------------------------------------------------------------- */

function Section({
  id,
  tone,
  children,
}: {
  id?: string;
  tone?: "paper";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-16 border-b border-ash", tone === "paper" ? "bg-paper" : "bg-surface")}
    >
      <div className="mx-auto max-w-300 px-4 py-24 sm:px-6 lg:py-32">{children}</div>
    </section>
  );
}

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.08em] uppercase",
        dark ? "text-white/55" : "text-steel",
      )}
    >
      <span className={cn("h-px w-5", dark ? "bg-white/30" : "bg-smoke")} aria-hidden />
      {children}
    </p>
  );
}

function H2({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2
      className={cn(
        "font-heading text-[34px] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-charcoal sm:text-[44px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function SectionIntro({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-180 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <H2 className="mt-4">{title}</H2>
      {sub ? <p className="mx-auto mt-5 max-w-150 text-[17px] leading-[1.65] text-steel">{sub}</p> : null}
    </div>
  );
}
