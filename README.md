# TaskFiber

A client management portal for agencies and service providers.

An agency signs up, connects its Drive, picks a template for its kind of work,
and gets a workspace from which it runs every client it has. For each client it
builds a branded portal that shows that client the work: the timeline, the
documents and decks, the deliverables awaiting their approval, the live
performance dashboard, the contract, the invoices and the updates.

Two interfaces, one data model — the **delivery side**, where the agency works,
and the **client side**, one portal per client, reached by a link rather than a
password.

## The one rule

**Nothing reaches the client automatically.** Every project, milestone,
deliverable, note and comment carries a visibility state, and publishing is
always an explicit action.

This is not a UI convention here. `visibility` is a required, internal-defaulting
column on every publishable model; every portal read goes through the single
chokepoint in `src/server/visibility.ts`; and `npm test` fails if either of those
stops being true. Agencies will not adopt a tool that might leak internal churn
to a client, so the rule is the product.

## Running it

```bash
npm install
npm run db:up        # Postgres in Docker, on port 5433
cp .env.example .env # then set BETTER_AUTH_SECRET and PORTAL_LINK_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

The delivery side is at `/`. A client portal needs a magic link — print one per
contact with:

```bash
npx dotenv-cli -e .env -- npx tsx scripts/inspect.ts
```

`npm test` runs the invariants: visibility defaults, that no portal read returns
an internal row, the three role predicates, and the approval record's single
grammar across channels.

## Layout

```
prisma/schema.prisma        40 models; `visibility` is required on six of them
prisma/seed.ts              the design's casting: 3 agencies, 14 clients
src/app/(delivery)/…        the agency workspace — screens 6.1–6.18
src/app/(portal)/…          the client portal — screens 6.19–6.28
src/app/api/…               magic-link redemption, preview, the WhatsApp webhook
src/components/ui/…         the design system, built from Foundations.dc.html
src/server/visibility.ts    the chokepoint every portal read goes through
src/server/approvals.ts     the append-only record and its one sentence
src/server/publish.ts       the only paths by which anything crosses to a client
src/server/channels.ts      the WhatsApp copy, shared by preview and send
tests/invariants.test.ts    the promises, as tests
```

## Where the design lives

Everything derives from `~/Downloads/taskfiber design` — the v2.0 brief, the
116-row feature list, and ten rendered design files. `CONTEXT.md` is the running
record of what was built, what was decided and why, and what is deliberately not
finished yet.

## Deploying

The build itself needs nothing — no database, no env vars. At runtime it needs
two things:

| Variable | Why |
| --- | --- |
| `DATABASE_URL` | A Postgres connection string. Use the **pooled** one on a serverless host, since each function opens its own connection. |
| `TASKFIBER_DEMO_MODE=1` | Runs the agency side unauthenticated, signed in as the seeded owner. Required until better-auth is wired. Never set it on a deployment holding real client data. |

Then point the schema and the dummy content at that database, once:

```bash
DATABASE_URL='<your pooled connection string>' npm run db:deploy:remote
DATABASE_URL='<your pooled connection string>' npm run db:seed:remote
```

The seed is idempotent — it wipes and rebuilds the three agencies, so you can
re-run it whenever you want the demo back to its starting state.

## Not finished, on purpose

- **better-auth is not wired.** `currentWorkspace()` resolves the seeded owner
  and throws in production unless `ALLOW_DEV_SESSION` is set. The client side is
  fully real.
- **Integrations are mock providers.** Every screen models connect state, sync
  age and failure honestly, but nothing calls an external API yet. A real
  provider is a second implementation of the same interface.
