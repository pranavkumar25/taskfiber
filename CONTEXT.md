# TaskFiber — living context

> This file is the project's memory. Everything done, in flight, and still to do lives here.
> Update it at the end of every work session and whenever a decision is made.
> Last updated: 2026-09-18 — everything designed is built; deployed on Vercel against Neon,
> running as a seeded demo. Backend wiring is the next phase; section 8 is its handover.

---

## 1. What this is

**TaskFiber** is a client management portal for agencies and service providers.

An agency signs up, connects its Drive, picks a template for its kind of work, and gets a workspace
from which it runs every client it has. For each client it builds a branded portal that shows that
client the work: the timeline, the documents and decks, the deliverables awaiting their approval, the
live performance dashboard, the contract, the invoices and the updates.

**Two interfaces, one data model.**

- **Delivery side** — where the agency works. Every client in one list. Per client: projects,
  timelines, deliverables and versions, documents and contract, invoices, contacts, portal
  configuration and activity. Above that: a cross-client calendar, a delivery board, team capacity and
  the sales pipeline read from the CRM.
- **Client side** — one portal per client, on the agency's domain and brand. Reached by a link, not a
  password. Shows only the modules the agency switched on for that client, named in that agency's
  language.

### The one rule

**Nothing reaches the client automatically.** Every project, milestone, deliverable, note and comment
has a visibility state, and publishing is always an explicit action. Agencies will not adopt a tool
that might leak internal churn to a client. This rule is the reason they can trust it — and here it is
a schema-level invariant, not a UI convention.

---

## 2. Sources of truth

Everything derives from `/Users/pranavkumar/Downloads/taskfiber design/`:

| File | What it holds |
| --- | --- |
| `uploads/Product Building Plan v2.0.docx` | The brief. Object model, six verticals, Drive-as-backbone, metrics, non-goals, open questions. |
| `uploads/Feature List v2.0 (rebuilt) - Untitled.csv` | 116 features, RICE-ranked, plus the module map per vertical, the integration map and the 3-phase release plan. |
| `C-Portal Index.dc.html` | The design index: deliverables, casting decisions, assumptions, open questions. |
| `Foundations.dc.html` | Tokens, two type scales, spacing, radii, elevation, icons, visibility semantics, agency theming. |
| `Components.dc.html` | Every component family with variants and states. |
| `Delivery Side.dc.html` + `Delivery Screens A/B/C.dc.html` | Screens 6.1–6.18, the app shell, the deliverable slide-over. |
| `Client Portal.dc.html` + `Portal Screens.dc.html` | Screens 6.19–6.28, three agencies, three roles, desktop 1280 and phone 390. |
| `Channels.dc.html` | 6.29 weekly digest email, 6.30 WhatsApp templates. |
| `Key States.dc.html` | Empty workspace, first client, loading, Drive sync failed, approval overdue, contract expiring, contact without module access. |
| `Explorations.dc.html` | Option variants 1a–1g. |
| `uploads/Pretendard-*.otf` | The UI typeface, to be self-hosted. |

The approved build plan lives at
`/Users/pranavkumar/.claude/plans/i-am-starting-a-wondrous-lamport.md`.

The C-Portal project in claude.ai chat is **not readable from Claude Code**. `C-Portal Index.dc.html`
is that project's own index, so the folder is self-sufficient.

---

## 3. Decisions log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-09-18 | **Scope** = everything designed: delivery 6.1–6.18, portal 6.19–6.28, channels 6.29–6.30. | That is Phase 1 in full plus the designed Phase 2 surfaces. Building to the design rather than to the phase boundary. |
| 2026-09-18 | **Integrations stubbed** behind per-category adapter interfaces with mock providers. | Every screen works with zero external credentials. Real providers are a second implementation of the same interface. |
| 2026-09-18 | **Stack** = Next.js **16.3.5** App Router, React **19.2.8**, TypeScript, Prisma **7.10.0** + Postgres, Tailwind **v4**, Radix, lucide-react, zod. | Matches `~/inboxrow-public` so conventions carry over. The majors matter — see the version notes below the table. |
| 2026-09-18 | **Repo** at `/Users/pranavkumar/taskfiber`, remote `github.com/pranavkumar25/taskfiber`, deployed from `main` by Vercel. | — |
| 2026-09-18 | **Visibility control**: 1b in tables (gutter rule + eye button), 1a on detail headers (segmented switch). | The design file's own "try next". Dense where it needs to be, explicit where there is room. |
| 2026-09-18 | **All-clients row density**: 1g, 48px two-line rows. | Names the actual projects and puts the at-risk reason inline; 1f hides it behind a `title` hover, which fails touch and keyboard users. |
| 2026-09-18 | **Portal home**: 1e (letter layout) when the lead has written an update, 1d (stacked blocks) as the automatic fallback. | Makes the portal and the weekly digest read as one voice, without ever depending on the agency writing something. |
| 2026-09-18 | **Influencer creator fees**: agency-configurable, default visible. | Pass-through billing is a real commercial arrangement some agencies disclose and others do not. One `showCreatorFees` flag drives the home tile, Contracts and the invoice footnote together. |
| 2026-09-18 | **Charts are hand-rolled SVG**, not recharts (which is installed but unused). | The dashboards need four small, exact shapes with the accent as the only colour. A charting library costs more than it gives at that size, and the provenance caption matters more than the chart. |
| 2026-09-18 | **The agency-side auth bypass is opt-in and named `TASKFIBER_DEMO_MODE`.** | It is an auth bypass, so it does not get to be implicit. In production it runs only when someone types that variable into a dashboard on purpose, and the name says what the deployment is. |
| 2026-09-18 | **The database client is constructed lazily, never on import.** | Next collects page data at build time by importing route modules. A client built at module scope made a missing `DATABASE_URL` a *build* failure instead of a request-time one. |
| 2026-09-18 | **The seed anchors its dates to the day it runs** (override with `SEED_TODAY`). | The design's intervals — 6 days overdue, due in 2 — are the point. Absolute dates would rot into a wall of overdue rows a fortnight after seeding. |
| 2026-09-18 | **Neon, ap-southeast-1, pooled connection** for the deployed demo. | Serverless-friendly, and both `migrate deploy` and the seed run fine through the pooler, so no second direct URL is needed. |

### Version notes — read these before writing code

Three of the majors here differ from what a model is likely to have been trained
on. `AGENTS.md` says the same thing about Next; these are the specifics that
actually bit during the build.

- **Next.js 16.** Turbopack is the default. `params`, `searchParams` and
  `cookies()` are **async** — await them. `PageProps<>`, `LayoutProps<>` and
  `RouteContext<>` are generated globals, so do not hand-write those prop types.
  `middleware` is now `proxy`. Read `node_modules/next/dist/docs/` before
  guessing.
- **Prisma 7.** Driver adapters are the norm: this repo uses `@prisma/adapter-pg`
  over node-postgres. The datasource block does **not** take a `url` from the
  schema any more — connection config lives in `prisma.config.ts`, and the
  generator is `prisma-client` emitting to `src/generated/prisma`.
- **Tailwind v4.** CSS-first. There is no `tailwind.config.ts`; the tokens are an
  `@theme` block in `src/app/globals.css`. Not every v3 utility survived —
  `border-l-dashed` does not exist, hence `[border-left-style:dashed]`.
- **React 19 + the React Compiler ESLint rules.** `react-hooks/purity` flags
  impure calls during render, which is why request time comes from
  `requestNow()` rather than `Date.now()`.

A trap worth remembering: the Prisma client singleton survives HMR, so after a
schema change the **dev server must be restarted**, not just reloaded.

---

## 4. Plane

Workspace `d58b1647-d722-4497-8b47-7cc5c0f9b21e` · me `f2ac3553-2240-43aa-8ede-8db39477f14e`

**Project TaskFiber (`TASK`)** — `4f0ab4b6-6a08-47ef-af91-43a203497864`
Features enabled: modules, cycles, views, pages.

Modules = the feature-list areas. Cycles = the build milestones.

| Module | Area | Id |
| --- | --- | --- |
| Agency workspace | W | `875e0612-d1f6-46bf-a9f9-4822c822df1d` |
| Portal builder | P | `4c110c95-a023-4cad-81fc-c48045aba78d` |
| Delivery | D | `b5ddb8df-015e-4c2e-9209-20a9d512b0d2` |
| Files | F | `640c1882-ab22-471f-8279-c965fa5e633a` |
| Approvals | R | `908fec6a-b182-49dd-9015-57eaab42589c` |
| Client portal | T | `2e2bab88-f976-4eff-9d9e-4d033ac27b48` |
| Dashboards and reports | B | `f5a53f9d-7995-40da-872c-2942a2275055` |
| Contracts | C | `73550227-69db-4db2-a138-c4e000d4afa7` |
| Money | M | `24527bc4-2d9a-4504-9617-096f1a5afe51` |
| CRM and pipeline | X | `b2bd16c6-b278-4da5-a3f2-8e9cc4cd0d3b` |
| Comms and channels | N | `3312694e-98f9-45fa-9e54-d186c5f427eb` |
| Platform | S | `63266ab6-346d-4f43-9d57-c5fd06ec8ec3` |

Cycles = the build milestones, each carrying its feature rows.

| Cycle | Id | Items |
| --- | --- | --- |
| M0 · Scaffold and design system | `dae9d176-41aa-44be-bb39-936b7dba53e5` | — |
| M1 · Schema, auth, tenancy, seed | `b5a24961-da2b-4278-b243-bc9299948f69` | 5 |
| M2 · Delivery shell, clients, client record | `175e9f50-9dff-4d6c-97a6-3d08f89c46ce` | 14 |
| M3 · Deliverables, slide-over, publish, approvals | `568f42b6-60ee-4efd-8f2f-9c940e86c711` | 11 |
| M4 · Portal builder, templates, onboarding | `8fe311e8-c6fa-45da-8bc5-a2a88ed4135b` | 12 |
| M5 · Cross-client views | `1242e4f6-9513-438c-bf9e-742b6a4c3b53` | 7 |
| M6 · Contracts, finance, reports, integrations, team | `b8b01044-3d98-48a5-a24e-21259fab1373` | 23 |
| M7 · Client portal | `0a58394f-02bb-40ff-af04-f5e755cda161` | 17 |
| M8 · Channels | `21e4677b-7605-4577-9dd4-febaad2c0c31` | 3 |
| M9 · Key states, a11y, verification | `d1eb7e8d-e802-48ec-95ce-ff0aad5af914` | — |

**92 work items**, one per in-scope feature, each carrying the CSV's user story
and acceptance criteria plus the design detail for the screen it lands on. Every
item sits in exactly one module and one cycle. M0 and M9 carry no feature rows —
they are infrastructure and proof.

Decisions page: `4fbc72e4-d079-4195-9a7b-20a00a01b238`.

**Board state**: 64 Done, 21 In Progress (screen and data model finished, running
against a mock adapter), 7 Backlog (W10 offboarding, D06 recurring workstreams,
X02 Pipedrive, N06 Slack, A01/A02 the AI drafts, S08 instrumentation).

---

## 5. Build milestones

| # | Milestone | Covers | Status |
| --- | --- | --- | --- |
| M0 | Scaffold + design system | Next.js app, Tailwind theme, Pretendard + Geist Mono, component families | **Done** |
| M1 | Schema, auth, tenancy, seed | Prisma schema, agency scoping, seed of three agencies | **Done** — except better-auth, see §8 |
| M2 | Delivery shell + clients + client record | 6.1–6.5, 6.7 | **Done** |
| M3 | Deliverables, slide-over, publish, approvals | 6.6, 6.8 | **Done** |
| M4 | Portal builder, templates, onboarding, intake | 6.9–6.11 | **Done** |
| M5 | Cross-client views | 6.12–6.13 | **Done** |
| M6 | Contracts, finance, reports, integrations, team | 6.14–6.18 | **Done** — on mock adapters, see §8 |
| M7 | Client portal | 6.19–6.28 | **Done** |
| M8 | Channels | 6.29–6.30 | **Done** — rendered and webhook-wired, not actually sending |
| M9 | Key states, a11y, end-to-end verification | Key States, mobile 390 | **Done** |

---

## 6. Progress log

### 2026-09-18 — everything designed is built

**Shipped**

All 30 designed screens run on real data: delivery 6.1–6.18, portal 6.19–6.28,
channels 6.29–6.30. 46 routes. Build clean, lint clean, 14/14 invariant tests
passing.

| Layer | What is there |
| --- | --- |
| Design system | Tokens straight from `Foundations.dc.html`. Pretendard self-hosted, Geist Mono for all data. Agency theming is the single `--accent` variable. Six-tone status pill, both visibility treatments, every form control, cards/tabs/tables with geometry-matched skeletons, overlays, charts, the three real preview renderers. |
| Data | 40 Prisma models. `visibility` required and internal-defaulting on six models. `src/server/visibility.ts` is the only path a portal read takes. `ApprovalRecord` is append-only — `recordDecision` is its one writer. |
| Delivery | Shell, signup, home, all-clients at 1g, the nine client-record tabs, project view, the 480px slide-over with its blast-radius confirmation, approvals inbox, portal builder, template library, onboarding, calendar, delivery board, capacity, pipeline with the handoff modal, contracts and renewals, finance, report builder, integrations, team, settings, channels. |
| Portal | Magic-link landing and redemption, chrome that reflows to a scrollable nav at 390, home in both 1e and 1d, timeline, deliverables, detail with one-tap approve and comment-gated changes, dashboards, documents, invoices with the padlock state, updates, requests, assets, creators, contracts, team, meetings. |
| Channels | The 600px digest as React Email, three WhatsApp templates, and the inbound webhook that turns a quick reply into an approval record with `channel = whatsapp`. |
| Proof | `npm test` — visibility defaults, no internal row in any portal read, the three role predicates, the record's single grammar across channels, verbal decisions labelled, empty change requests refused, and the seed's casting. |

**Bugs the build surfaced, and what fixed them**

- *An internal milestone reached the weekly digest.* The channels page queried
  Prisma directly instead of going through the chokepoint. Filtered, and it is
  the clearest argument yet for never letting a client-facing surface compose
  its own where-clause.
- *Hovering "Preview as client" minted a preview session.* Next prefetches
  `Link`s, and the target was a GET route handler with a side effect. Now
  `prefetch={false}`.
- *The dev server held a Prisma client from before a schema change.* The
  singleton survives HMR by design, so `preview` came back undefined until the
  server restarted. Restart dev after `prisma generate`.
- *Request-time `Date.now()` in render.* Replaced with `requestNow()` in
  `src/server/now.ts` — one clock per request, so a row cannot be "due today" in
  the header and "overdue" in the table.
- *The invoice refusal threw synchronously* while every sibling returned a
  promise. Made it async so callers never have to guard it differently.

**Not done, and deliberately so**

- **better-auth is not wired.** `currentWorkspace()` resolves the seeded owner
  and throws in production unless `TASKFIBER_DEMO_MODE=1` is set. The client side
  is fully real — magic link, session cookie, single contact. Full handover in §8.
- **Integrations are mock providers.** Every screen models connect, sync age and
  failure honestly, but nothing calls an external API yet.
- Drag-to-reorder in the portal builder is a handle without the drag.
- Annotation pins render and toggle; adding one by clicking the frame is copy,
  not behaviour.

### 2026-09-18 (later) — deployed

The code went to GitHub and Vercel, and the first deploy failed. Three things
came out of fixing it.

**The build failure.** `Failed to collect page data for /enter/[slug]/[token]`,
caused by `DATABASE_URL is not set` thrown from `src/server/db.ts`. Next imports
every route module at build time to collect page data, and the module built a
Prisma client at import scope — so a missing connection string failed the
*build*, not a request. `db` is now a `Proxy` that constructs the client on
first property access and memoises it on `globalThis`. The error message it
throws when the variable really is missing now names both fixes (`npm run db:up`
locally, set the variable on a host). Verified the way it actually failed:

```
env -u DATABASE_URL npx next build     # passes
```

**The auth bypass got a name.** The old `ALLOW_DEV_SESSION` read like a
developer convenience. It is an auth bypass, so it is now `TASKFIBER_DEMO_MODE`,
it only applies in production when explicitly set, and it logs a warning on boot
saying every visitor is signed in as the seeded owner.

**The seed stopped rotting.** It was written against a fixed 18 Sep 2026, so a
month later every approval would have read as overdue. It now shifts every date
by the difference between that design date and the day it runs, which preserves
the design's exact intervals. `SEED_TODAY=2026-09-18` reproduces the original.

**The database is live.** Neon (ap-southeast-1), pooled. Both migrations applied
and the seed ran through the pooler. `npx tsx scripts/inspect.ts` confirms the
design's spread — Dhruv Motors 6 days overdue, Halden Labs 4, Sutra Living 2,
Kiro Foods due tomorrow, three due in 2 days, two in 4 — and prints all 22 magic
links. The app was then run locally against Neon and every route returned 200.

---

## 7. Deployment and environments

### The three environments

| | Local | Vercel (today) | Launch |
| --- | --- | --- | --- |
| Database | Docker Postgres on **5433** | Neon, pooled | Neon, pooled |
| Agency auth | bypassed | bypassed via `TASKFIBER_DEMO_MODE=1` | better-auth; demo mode deleted |
| Client auth | real magic links | real magic links | real magic links |
| Integrations | mock adapters | mock adapters | real providers |
| Data | seeded | seeded | real |

### Environment variables

| Name | Where | What it does |
| --- | --- | --- |
| `DATABASE_URL` | everywhere | Postgres connection string. Locally `postgresql://taskfiber:taskfiber@localhost:5433/taskfiber`. On Vercel, Neon's **pooled** string. |
| `TASKFIBER_DEMO_MODE` | Vercel only, set to `1` | Runs the agency side unauthenticated as the seeded owner. Without it `currentWorkspace()` throws in production, on purpose. **Delete it the moment better-auth lands.** |
| `SEED_TODAY` | optional, seed only | `YYYY-MM-DD`. Pins the seed's idea of today; otherwise it uses the run date. |

Port 5432 is occupied by `accelbridge-postgres`, so TaskFiber's local Postgres
listens on **5433**. `npm run db:up` starts it.

### Pointing the app at a remote database

Both commands work through Neon's pooled connection — no direct URL needed.

```
DATABASE_URL='<pooled string>' npm run db:deploy:remote   # prisma migrate deploy
DATABASE_URL='<pooled string>' npm run db:seed:remote     # tsx prisma/seed.ts
```

The seed is destructive — it clears and rebuilds the workspace. It is safe to
re-run against the demo database and must never be run against a real one.

### Two things to deal with

- **Rotate the Neon password.** The connection string was pasted into a chat
  transcript on 2026-09-18. Roll it in the Neon dashboard and update the Vercel
  variable. Nothing in the repo holds it — `.env` and `.env.local` are
  gitignored and the string was only ever kept outside the working tree.
- **`sslmode=require` prints a forward-compatibility warning.** `pg` currently
  treats `require` as `verify-full`; in `pg` v9 it will relax to libpq
  semantics, which are weaker. Changing the connection string to
  `sslmode=verify-full` silences the warning *and* pins today's stricter
  behaviour. Neon presents a valid certificate, so this is a safe swap.

---

## 8. Handover — what "backend wiring" actually means

Everything below is a deliberate gap, not an oversight. The screens, the data
model and the server boundaries are real; these are the seams where something
external has to be plugged in.

### 8.1 Agency authentication

better-auth is installed and unwired. The work:

1. Wire better-auth with the Prisma adapter; `User` and `Member` already exist.
2. Replace the body of `currentWorkspace()` in `src/server/session.ts` with a
   real session read. Its signature is already what the app expects, so nothing
   else needs to change — every delivery-side page goes through it.
3. Delete `TASKFIBER_DEMO_MODE` from the code and from Vercel.
4. Enforce the four seeded roles (owner, admin, member, limited) — the team
   screen already models per-client and per-project scoping.

The **client** side needs none of this. Magic link → `PortalSession` cookie →
one contact is real today.

### 8.2 The seven integration adapters

Each category under `src/server/integrations/` is an interface with a working
mock. A real provider is a second implementation of the same interface; no UI
changes.

| Category | Mock does | Real needs |
| --- | --- | --- |
| `storage` | Reads the seeded Drive tree | Google Drive OAuth, folder map, file list, upload, sync age |
| `esign` | Fakes send and signed-copy states | A provider (Dropbox Sign / Zoho Sign), webhook for signature events |
| `accounting` | Seeded invoices and aging | Zoho Books read-only pull. **Never a second ledger** |
| `payments` | UPI deep links, fake settlement | Razorpay + Stripe, and the webhook that stops reminders |
| `crm` | Seeded deals | Pipedrive/HubSpot pull, won-deal webhook into the handoff modal |
| `analytics` | Seeded metrics | GA4, Meta Ads, Search Console, Instagram/YouTube/TikTok |
| `messaging` | Renders the digest and templates, never sends | Email sender, Meta-approved WhatsApp sender, and a scheduler for the weekly digest |

Sync failure is already a first-class propagating state across six surfaces —
when a real provider fails, that path already works.

### 8.3 Still in Plane's backlog

W10 offboarding · D06 recurring workstreams · X02 Pipedrive · N06 Slack ·
A01/A02 the AI drafts · S08 instrumentation.

### 8.4 Small UI gaps

- Drag-to-reorder in the portal builder is a handle without the drag.
- Annotation pins render and toggle; adding one by clicking the frame is copy,
  not behaviour.

### 8.5 Before the launch version

- [ ] better-auth wired, `TASKFIBER_DEMO_MODE` deleted from code and Vercel
- [ ] Neon password rotated, `sslmode=verify-full`
- [ ] Real signup replaces the seeded workspace (the 4-step flow exists)
- [ ] At least `storage` and `accounting` on real providers — they carry the most screens
- [ ] A migration path off the seed: the demo database must not become production
- [ ] Rate-limit magic-link redemption and re-check link expiry
- [ ] `npm test` still green — those 14 tests are the visibility invariant's proof

---

## 9. Open questions

**Answered** — see the decisions log above for the four design questions.

**Still open, from the brief (§14).** These do not block the build, but they shape what comes after:

1. Does Drive two-way sync need to be near real-time, or is publish-on-demand enough? Changes the
   architecture materially. *(Currently building publish-on-demand behind the storage adapter, so
   either answer stays cheap.)*
2. Which three verticals get deep templates first? Marketing and design lead on volume; influencer
   leads on whitespace.
3. Do clients want a live dashboard, or a monthly report? These are different products.
4. Is file annotation a Phase 1 blocker for design agencies, or can approve-plus-comment carry the
   first release?
5. Contracts: send from here, or only store the signed copy? Send is materially more work.
6. WhatsApp sender: per-agency Meta verification or a shared sender?
7. How much of the delivery side do agencies actually want, given they run on ClickUp, Asana or
   Linear? The most important unknown in the brief.

**Resolved** — the old `DATABASE_URL` blocker is gone. Local runs on Docker Postgres at 5433, the
deployment on Neon. See §7.

---

## 10. Reference — the things that are easy to get wrong

### Design system

- Palette is Tailwind **neutral** plus Tailwind semantics — canvas `#f5f5f5`, surface `#fff`, border
  `#e5e5e5`, strong border `#d4d4d4`, text `#171717` / `#525252` / `#737373`.
- Radii **6** controls, **10** cards, **4** chips, **12** overlays. Card shadow
  `0 1px 2px rgba(23,23,23,.04)`; overlay `0 8px 24px rgba(23,23,23,.08)`.
- **Pretendard** for UI, **Geist Mono** for every date, ID, amount, version and count. The split is
  load-bearing: mono means "this is data".
- **Two type scales.** Delivery side is dense (13px base, 24px h1). Client portal is spacious (16px
  base, 28px h1).
- **Agency theming is one CSS variable**, `--accent`. Nothing else changes per brand. The product blues
  `#2563eb` / `#1e40af` never appear in a client portal.
- **Six status pill kinds**: done green, progress accent, needs orange, risk red, upcoming grey, info
  blue. Each is dot + tinted bg + darker (700) fg, h20 r10 12px/500.
- Motion is two values: **160ms** for anything appearing in place, **180ms** for the slide-over, plus
  120ms ease-out on hover/active. Loading uses geometry-matched skeletons with **no shimmer**. Nothing
  bounces, nothing loops.
- Icons are **Heroicons outline**, 16px at 1.5 stroke, heavier (2–2.5) inside buttons and chips.
- Known spec/render discrepancies, already resolved: card radius is **10px** (spec says 8), neutral
  fill is **`#171717`** (spec swatch says `#000000`), cards **do** carry the 0.04 shadow despite the
  "no shadow" wording.

### Visibility semantics

Two states, drawn identically everywhere:

- **Internal** (the default for tasks, notes, comments and new deliverables) — `#f5f5f5` fill, **dashed**
  1px `#737373` border, eye-off glyph, dashed left gutter rule, secondary text.
- **Client-visible** — white, **solid** 1px `#d4d4d4`, 6px green `#16a34a` dot, primary text, and it
  **always carries who published and when, in mono**.

"Published" is not a third state; it is the transition into client-visible, stamped
`Published · 15 Sep 17:40`. Unpublish is danger-outline and always confirmed with the consequences
spelled out.

Do not conflate visibility with either **portal sent / not sent** (a client-level state) or
**role-based module access** (orthogonal).

### The permission model

Three predicates, and they must live server-side:

```
canApprove     = role === 'approver'
canSeeInvoices = role === 'approver' || role === 'billing'
hasNeedsYou    = canApprove && needsYou.length > 0
```

The Invoices **nav item stays visible to a collaborator** and the gate fires at the screen, showing the
padlock "Invoices are not shared with your role" state naming the approver. The explanation is the
feature; hiding it is not.

### The approval record grammar

One sentence, reused verbatim across every channel:

```
Approved {ver} by {contact}, 17 Sep 2026, 14:06, via portal|email|WhatsApp.
```

Append-only. Approve is one tap with no modal and no undo. Request changes keeps Send disabled until
the comment has text, and Send is neutral dark `#171717`, never accent — approve owns the accent on
that screen. Reminders stop the moment a decision arrives from any channel.

### The casting (seed data)

| | Fieldnote Media | Northlight Studio | Cast & Co. |
| --- | --- | --- | --- |
| accent | `#1F5B3F` | `#233B8F` | `#7A1F2B` |
| vertical | marketing | design | influencer |
| client | Kiro Foods | Tidewater Hotels | Lumen Skincare |
| project | Q4 performance campaign | Brand identity refresh (at risk) | Festive creator push |
| money | INR · Razorpay/UPI | USD · Stripe | INR · Razorpay |
| approver | Karan Mehta | Maya Ellison | Devika Nair |
| collaborator | Priya Iyer | Tom Reyes | Ishaan Verma |
| billing | Sandeep Rao | Grace Whitfield | Farah Khan |
| preview kind | creative set | Figma frame + pin | reel |

Fieldnote's workspace carries the full 14-client list. Every row in the all-clients list opens Kiro
Foods, so the record → project → deliverable → portal builder flow is one continuous path.

### Non-goals (do not build these)

A full CRM · accounting and bookkeeping · a scope and allowance ledger as a core object · replacing the
PM tool · native mobile apps · our own file storage · hard-coded vertical modules.

The invoices module **states** that it reads the ledger. Contracts show the e-sign source. Nothing in
the portal implies task management.
