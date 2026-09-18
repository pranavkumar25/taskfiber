/**
 * Seed — the design's own casting, verbatim.
 *
 * The three agencies exist so the portal can be seen in three accents, three
 * verticals and three money rails. Fieldnote Media carries the full 14-client
 * book; Kiro Foods is the one client built out to the bottom, so the record →
 * project → deliverable → portal-builder flow is one continuous path.
 *
 * Every publishable row is created INTERNAL unless the design shows it
 * published — the seed obeys the same rule the product does.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ApprovalDecision,
  ApprovalState,
  Channel,
  ClientStage,
  ContactRole,
  ContractKind,
  ContractStatus,
  DealStage,
  DeliverableStatus,
  DocumentCategory,
  IntegrationCategory,
  IntegrationStatus,
  InvoiceStatus,
  MilestoneState,
  ModuleKey,
  PaymentRail,
  PreviewKind,
  ProjectStatus,
  ProjectType,
  RequestStatus,
  RosterStatus,
  StepState,
  SyncMode,
  TaskStatus,
  TeamRole,
  Vertical,
  Visibility,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set — see .env.example");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Dates are absolute because the design specifies them. "Today" is 18 Sep 2026. */
const d = (month: number, day: number, hh = 9, mm = 0) =>
  new Date(2026, month - 1, day, hh, mm);
const d2027 = (month: number, day: number) => new Date(2027, month - 1, day);

const V = Visibility;

/* ══════════════════════════════════════════════════════════════════════════
   Portal templates — six shipped, one per vertical.
   ══════════════════════════════════════════════════════════════════════════ */

type ModuleSpec = [ModuleKey, string, boolean, ContactRole[]?];

const BILLING_ONLY: ContactRole[] = [ContactRole.APPROVER, ContactRole.BILLING];
const NOT_BILLING: ContactRole[] = [ContactRole.APPROVER, ContactRole.COLLABORATOR];

/** The module map per vertical, straight from the feature list. */
const TEMPLATES: {
  name: string;
  vertical: Vertical;
  workUnit: string;
  timelineLabel: string;
  expects: string[];
  modules: ModuleSpec[];
}[] = [
  {
    name: "Marketing agency",
    vertical: Vertical.MARKETING,
    workUnit: "Campaign",
    timelineLabel: "Campaign calendar",
    expects: ["GA4", "Search Console", "Google Ads", "Meta Ads", "Looker Studio"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Campaign calendar", true],
      [ModuleKey.DELIVERABLES, "Deliverables", true],
      [ModuleKey.DASHBOARDS, "Dashboards", true],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", false, BILLING_ONLY],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.REQUESTS, "Requests", true, NOT_BILLING],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.MEETINGS, "Meetings", true],
      [ModuleKey.ASSETS, "Assets", false],
      [ModuleKey.ROSTER, "Creators", false],
    ],
  },
  {
    name: "Design studio",
    vertical: Vertical.DESIGN,
    workUnit: "Project",
    timelineLabel: "Project phases",
    expects: ["Figma", "Drive", "DocuSign"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Project phases", true],
      [ModuleKey.DELIVERABLES, "Deliverables", true],
      [ModuleKey.DASHBOARDS, "Dashboards", false],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", false, BILLING_ONLY],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.REQUESTS, "Requests", true, NOT_BILLING],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.MEETINGS, "Meetings", false],
      [ModuleKey.ASSETS, "Assets", true],
      [ModuleKey.ROSTER, "Creators", false],
    ],
  },
  {
    name: "Influencer management",
    vertical: Vertical.INFLUENCER,
    workUnit: "Campaign and creator",
    timelineLabel: "Campaign flights",
    expects: ["Instagram", "YouTube", "TikTok", "Zoho Sign"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Campaign flights", true],
      [ModuleKey.ROSTER, "Creators", true],
      [ModuleKey.DELIVERABLES, "Deliverables", true],
      [ModuleKey.DASHBOARDS, "Dashboards", true],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", true],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.ASSETS, "Assets", true],
      [ModuleKey.REQUESTS, "Requests", false, NOT_BILLING],
      [ModuleKey.MEETINGS, "Meetings", false],
    ],
  },
  {
    name: "Product agency",
    vertical: Vertical.PRODUCT,
    workUnit: "Roadmap and release",
    timelineLabel: "Roadmap",
    expects: ["Linear", "Jira", "Figma", "GitHub"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Roadmap", true],
      [ModuleKey.DELIVERABLES, "Releases", true],
      [ModuleKey.DASHBOARDS, "Product metrics", true],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", false, BILLING_ONLY],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.REQUESTS, "Requests", true, NOT_BILLING],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.MEETINGS, "Meetings", true],
      [ModuleKey.ASSETS, "Assets", false],
      [ModuleKey.ROSTER, "Creators", false],
    ],
  },
  {
    name: "Tech agency",
    vertical: Vertical.TECH,
    workUnit: "Sprint",
    timelineLabel: "Sprints",
    expects: ["GitHub", "GitLab", "Linear", "Status pages"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Sprints", true],
      [ModuleKey.DELIVERABLES, "Builds and releases", true],
      [ModuleKey.DASHBOARDS, "Engineering metrics", true],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", false, BILLING_ONLY],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.REQUESTS, "Requests", true, NOT_BILLING],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.MEETINGS, "Meetings", true],
      [ModuleKey.ASSETS, "Assets", false],
      [ModuleKey.ROSTER, "Creators", false],
    ],
  },
  {
    name: "Talent management",
    vertical: Vertical.TALENT,
    workUnit: "Booking",
    timelineLabel: "Booking calendar",
    expects: ["E-sign", "Accounting", "Calendar"],
    modules: [
      [ModuleKey.OVERVIEW, "Overview", true],
      [ModuleKey.TIMELINE, "Booking calendar", true],
      [ModuleKey.ROSTER, "Talent", true],
      [ModuleKey.DELIVERABLES, "Deliverables", false],
      [ModuleKey.DASHBOARDS, "Dashboards", false],
      [ModuleKey.DOCUMENTS, "Documents", true],
      [ModuleKey.CONTRACTS, "Contracts", true],
      [ModuleKey.INVOICES, "Invoices", true, BILLING_ONLY],
      [ModuleKey.UPDATES, "Updates", true],
      [ModuleKey.TEAM, "Your team", true],
      [ModuleKey.MEETINGS, "Meetings", true],
      [ModuleKey.REQUESTS, "Requests", false, NOT_BILLING],
      [ModuleKey.ASSETS, "Assets", false],
    ],
  },
];

async function seedTemplates() {
  const made: Record<string, string> = {};
  for (const t of TEMPLATES) {
    const template = await db.portalTemplate.create({
      data: {
        name: t.name,
        vertical: t.vertical,
        isShipped: true,
        workUnit: t.workUnit,
        timelineLabel: t.timelineLabel,
        expectedTools: t.expects,
        modules: {
          create: t.modules.map(([key, label, enabled, roles], i) => ({
            key,
            label,
            enabled,
            order: i,
            roles: roles ?? [],
          })),
        },
      },
    });
    made[t.name] = template.id;
  }
  return made;
}


/* ══════════════════════════════════════════════════════════════════════════
   Fieldnote Media — the marketing agency the delivery side is drawn in.
   ══════════════════════════════════════════════════════════════════════════ */

async function seedFieldnote(templates: Record<string, string>) {
  const agency = await db.agency.create({
    data: {
      name: "Fieldnote Media",
      slug: "fieldnote",
      vertical: Vertical.MARKETING,
      city: "Pune",
      teamSize: "11–25",
      accentHex: "#1F5B3F",
      logoAsset: "fieldnote-mark.svg",
      portalDomain: "portal.fieldnote.media",
      customDomain: "clients.fieldnote.media",
      dnsVerified: true,
      emailSender: "Fieldnote Media <portal@fieldnote.media>",
      poweredBy: false,
      plan: "Studio",
      seats: 18,
      driveRootPath: "/Fieldnote Media",
      clientsRootPath: "/Fieldnote Media/Clients",
      syncMode: SyncMode.TWO_WAY,
      defaultApprovalDays: 3,
      reminderTone: "plain",
      lastExportAt: d(8, 1),
      lastExportBytes: BigInt(224395264),
    },
  });

  /* --- The team. `canPublish` is independent of role on purpose. --------- */
  const team = {
    arjun: await member(agency.id, {
      name: "Arjun Rao",
      email: "arjun@fieldnote.media",
      role: TeamRole.OWNER,
      discipline: "Operations",
      lastActiveAt: new Date(),
    }),
    meera: await member(agency.id, {
      name: "Meera Joshi",
      email: "meera@fieldnote.media",
      role: TeamRole.ADMIN,
      discipline: "Accounts",
      lastActiveAt: minutesAgo(12),
    }),
    dev: await member(agency.id, {
      name: "Dev Patel",
      email: "dev@fieldnote.media",
      role: TeamRole.MEMBER,
      discipline: "Performance",
      lastActiveAt: minutesAgo(60),
    }),
    rohan: await member(agency.id, {
      name: "Rohan Iyer",
      email: "rohan@fieldnote.media",
      role: TeamRole.MEMBER,
      discipline: "Web",
      canPublish: false, // a Member who cannot publish — the design casts one
      lastActiveAt: minutesAgo(180),
    }),
    sana: await member(agency.id, {
      name: "Sana Mirza",
      email: "sana.mirza@gmail.com",
      role: TeamRole.LIMITED,
      discipline: "Design",
      isFreelance: true,
      canPublish: false,
      canSeeFinance: false,
      lastActiveAt: minutesAgo(2880),
    }),
  };

  /* --- Integrations. Zoho Books is failing, and that state propagates. --- */
  await db.integration.createMany({
    data: [
      int(agency.id, "Google Drive", IntegrationCategory.STORAGE, IntegrationStatus.CONNECTED, {
        account: "arjun@fieldnote.media",
        purpose: "The storage backbone. Every client and project maps to a folder.",
        syncedAt: minutesAgo(3),
      }),
      int(agency.id, "Dropbox", IntegrationCategory.STORAGE, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Same folder mapping and sync model as Drive.",
      }),
      int(agency.id, "DocuSign", IntegrationCategory.ESIGN, IntegrationStatus.CONNECTED, {
        purpose: "Send envelopes, track status, file the signed copy to Drive.",
        syncedAt: minutesAgo(22),
      }),
      int(agency.id, "Zoho Sign", IntegrationCategory.ESIGN, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Send, track, file.",
      }),
      int(agency.id, "Zoho Books", IntegrationCategory.ACCOUNTING, IntegrationStatus.FAILING, {
        purpose: "Reads invoices, payments and aging. Never a second ledger.",
        syncedAt: minutesAgo(120),
        errorReason: "Token expired 2 h ago.",
        blastRadius: "Invoice amounts on 14 client records may be stale until you reconnect.",
      }),
      int(agency.id, "Razorpay", IntegrationCategory.PAYMENTS, IntegrationStatus.CONNECTED, {
        purpose: "UPI and card payment links, and the webhook that stops reminders.",
        syncedAt: d(8, 14, 12, 31),
      }),
      int(agency.id, "Stripe", IntegrationCategory.PAYMENTS, IntegrationStatus.NOT_CONNECTED, {
        purpose: "International and multi-currency payments.",
      }),
      int(agency.id, "HubSpot", IntegrationCategory.CRM, IntegrationStatus.CONNECTED, {
        purpose: "Reads deals, contacts and stages. Writes renewal date and health back.",
        syncedAt: minutesAgo(4),
      }),
      int(agency.id, "Pipedrive", IntegrationCategory.CRM, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Reads deals and stages.",
      }),
      int(agency.id, "GA4", IntegrationCategory.ANALYTICS, IntegrationStatus.CONNECTED, {
        purpose: "Sessions and conversions. 11 properties mapped to clients.",
        syncedAt: minutesAgo(3),
      }),
      int(agency.id, "Meta Ads", IntegrationCategory.ANALYTICS, IntegrationStatus.CONNECTED, {
        purpose: "Spend and results per ad account.",
        syncedAt: minutesAgo(12),
      }),
      int(agency.id, "Search Console", IntegrationCategory.ANALYTICS, IntegrationStatus.CONNECTED, {
        purpose: "Rankings and clicks.",
        syncedAt: minutesAgo(60),
      }),
      int(agency.id, "Google Ads", IntegrationCategory.ANALYTICS, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Spend and conversions.",
      }),
      int(agency.id, "Looker Studio", IntegrationCategory.REPORTING, IntegrationStatus.EMBED, {
        purpose: "Embeds reports the agency already built. 4 in use.",
      }),
      int(agency.id, "Figma", IntegrationCategory.DESIGN, IntegrationStatus.CONNECTED, {
        purpose: "Live frames, and version events that create deliverable versions.",
        syncedAt: minutesAgo(4),
      }),
      int(agency.id, "WhatsApp Business", IntegrationCategory.MESSAGING, IntegrationStatus.CONNECTED, {
        account: "Fieldnote Media (verified)",
        purpose: "Three approved templates. Quick replies are read back as decisions.",
        syncedAt: minutesAgo(30),
      }),
      int(agency.id, "Slack", IntegrationCategory.MESSAGING, IntegrationStatus.CONNECTED, {
        account: "#clients",
        purpose: "Internal alerts only — approvals received, requests raised, overdue items.",
        syncedAt: minutesAgo(8),
      }),
      int(agency.id, "Linear", IntegrationCategory.DEV, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Releases and issue state as client-visible progress.",
      }),
      int(agency.id, "Instagram", IntegrationCategory.SOCIAL, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Post performance per creator.",
      }),
      int(agency.id, "Google Meet", IntegrationCategory.MEETINGS, IntegrationStatus.NOT_CONNECTED, {
        purpose: "Call summaries into the Meetings module.",
      }),
    ],
  });

  /* --- The pipeline, read from HubSpot. ---------------------------------- */
  await db.deal.createMany({
    data: [
      deal(agency.id, "Saffron Stays · Winter campaign", "Saffron Stays", DealStage.PROPOSAL, 1200000, d(10, 15), "Arjun Rao"),
      deal(agency.id, "Nimbus Wear · Always-on", "Nimbus Wear", DealStage.PROPOSAL, 2400000, d(10, 30), "Arjun Rao", "/ yr"),
      deal(agency.id, "Teak & Tonic · Launch", "Teak & Tonic", DealStage.NEGOTIATION, 840000, d(9, 26), "Meera Joshi", undefined, "Pre-provision portal available"),
      deal(agency.id, "Harbour Dental · Retainer", "Harbour Dental", DealStage.VERBAL_YES, 1800000, d(9, 22), "Arjun Rao", "/ yr", "Delivery: prep Meera for 1 Oct start"),
      {
        agencyId: agency.id,
        name: "Aravalli · Q4 launch",
        company: "Aravalli Homes",
        stage: DealStage.WON,
        value: 2880000,
        cadence: "/ yr",
        closeDate: d(9, 15),
        wonAt: d(9, 15),
        ownerName: "Arjun Rao",
        contacts: [
          { name: "Nikhil Bhandari", proposedRole: "APPROVER" },
          { name: "Ritu Shah", proposedRole: "BILLING" },
        ],
        syncedAt: minutesAgo(4),
      },
    ],
  });

  return { agency, team, templates };
}

/* --- Small builders ------------------------------------------------------ */

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60000);
}

async function member(
  agencyId: string,
  data: {
    name: string;
    email: string;
    role: TeamRole;
    discipline?: string;
    canPublish?: boolean;
    canSeeFinance?: boolean;
    isFreelance?: boolean;
    lastActiveAt?: Date;
  },
) {
  return db.member.create({ data: { agencyId, ...data } });
}

function int(
  agencyId: string,
  provider: string,
  category: IntegrationCategory,
  status: IntegrationStatus,
  rest: {
    account?: string;
    purpose?: string;
    syncedAt?: Date;
    errorReason?: string;
    blastRadius?: string;
  } = {},
) {
  return { agencyId, provider, category, status, ...rest };
}

function deal(
  agencyId: string,
  name: string,
  company: string,
  stage: DealStage,
  value: number,
  closeDate: Date,
  ownerName: string,
  cadence?: string,
  note?: string,
) {
  return {
    agencyId,
    name,
    company,
    stage,
    value,
    cadence,
    closeDate,
    ownerName,
    note,
    syncedAt: minutesAgo(4),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   Fieldnote's book — fourteen clients.

   Ten must fit at 1440×900, which is why the list ships at 48px two-line rows.
   Only Kiro Foods is built to the bottom; the rest carry enough to make the
   list, the calendar, the board and the approvals inbox real.

   Note one reconciliation with the design: the prototype's client list included
   Tidewater Hotels and Lumen Skincare, but the portal casting puts those with
   Northlight and Cast & Co. They live with their own agencies here, and two
   clients in the same register take their places so the count stays at 14.
   ══════════════════════════════════════════════════════════════════════════ */

type ClientSpec = {
  name: string;
  slug: string;
  color: string;
  vertical: Vertical;
  stage: ClientStage;
  projects: { name: string; type: ProjectType; status: ProjectStatus }[];
  nextMilestone: { name: string; date: Date; state: MilestoneState };
  approval?: { deliverable: string; version: string; contact: string; dueAt: Date; remind: number };
  lastPortalActivity: Date | null;
  healthFlags?: string[];
  contactName: string;
  templateName: string;
};

const BOOK: ClientSpec[] = [
  {
    name: "Halden Labs", slug: "halden-labs", color: "#0F2A3F", vertical: Vertical.TECH,
    stage: ClientStage.AT_RISK, templateName: "Tech agency", contactName: "Anita Bose",
    projects: [{ name: "Platform rebuild", type: ProjectType.SPRINT, status: ProjectStatus.AT_RISK }],
    nextMilestone: { name: "Sprint 14 review", date: d(9, 26), state: MilestoneState.AT_RISK },
    approval: { deliverable: "Sprint 14 build", version: "v1", contact: "Anita Bose", dueAt: d(9, 14), remind: 2 },
    lastPortalActivity: minutesAgo(60 * 24 * 9),
    healthFlags: ["No portal activity for 9 days", "2 approvals past SLA"],
  },
  {
    name: "Sutra Living", slug: "sutra-living", color: "#4B5563", vertical: Vertical.DESIGN,
    stage: ClientStage.ACTIVE, templateName: "Design studio", contactName: "Vikram Sethi",
    projects: [{ name: "Store identity", type: ProjectType.PROJECT, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Concept directions", date: d(9, 22), state: MilestoneState.DUE },
    approval: { deliverable: "Concept directions", version: "v2", contact: "Vikram Sethi", dueAt: d(9, 16), remind: 1 },
    lastPortalActivity: minutesAgo(60 * 24),
    healthFlags: ["Approval 2 days past SLA"],
  },
  {
    name: "Monsoon Coffee Co.", slug: "monsoon-coffee", color: "#78350F", vertical: Vertical.MARKETING,
    stage: ClientStage.RENEWAL, templateName: "Marketing agency", contactName: "Leah Fernandes",
    projects: [{ name: "Always-on retainer", type: ProjectType.RETAINER, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Contract ends", date: d(9, 30), state: MilestoneState.DUE },
    approval: { deliverable: "Menu photography", version: "v1", contact: "Leah Fernandes", dueAt: d(9, 20), remind: 0 },
    lastPortalActivity: minutesAgo(60 * 24 * 3),
    healthFlags: ["Contract ends in 12 days"],
  },
  {
    name: "Peak Physio", slug: "peak-physio", color: "#3F3F46", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Nisha Warrier",
    projects: [{ name: "Local search retainer", type: ProjectType.RETAINER, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "September report", date: d(9, 19), state: MilestoneState.DUE },
    lastPortalActivity: minutesAgo(300),
  },
  {
    name: "Orbit Fintech", slug: "orbit-fintech", color: "#1E3A5F", vertical: Vertical.PRODUCT,
    stage: ClientStage.ACTIVE, templateName: "Product agency", contactName: "Sameer Qureshi",
    projects: [
      { name: "Onboarding revamp", type: ProjectType.ROADMAP, status: ProjectStatus.ON_TRACK },
      { name: "Q4 release train", type: ProjectType.SPRINT, status: ProjectStatus.ON_TRACK },
    ],
    nextMilestone: { name: "Week 38 update", date: d(9, 22), state: MilestoneState.UPCOMING },
    lastPortalActivity: minutesAgo(60 * 24),
  },
  {
    name: "Verve Athleisure", slug: "verve-athleisure", color: "#365314", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Tara Menon",
    projects: [{ name: "Autumn drop", type: ProjectType.CAMPAIGN, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Autumn drop live", date: d(9, 24), state: MilestoneState.UPCOMING },
    approval: { deliverable: "Drop launch films", version: "v2", contact: "Tara Menon", dueAt: d(9, 20), remind: 0 },
    lastPortalActivity: minutesAgo(240),
  },
  {
    name: "Anchor & Oak", slug: "anchor-oak", color: "#1C1917", vertical: Vertical.DESIGN,
    stage: ClientStage.ACTIVE, templateName: "Design studio", contactName: "Elena Marsh",
    projects: [{ name: "Brand system", type: ProjectType.PROJECT, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Identity sign-off", date: d(9, 26), state: MilestoneState.UPCOMING },
    approval: { deliverable: "Logo suite", version: "v3", contact: "Elena Marsh", dueAt: d(9, 22), remind: 0 },
    lastPortalActivity: minutesAgo(60 * 48),
  },
  {
    name: "Aravalli Homes", slug: "aravalli-homes", color: "#2E6F8E", vertical: Vertical.MARKETING,
    stage: ClientStage.ONBOARDING, templateName: "Marketing agency", contactName: "Nikhil Bhandari",
    projects: [],
    nextMilestone: { name: "Kickoff", date: d(9, 20), state: MilestoneState.UPCOMING },
    lastPortalActivity: null,
    healthFlags: ["Portal not yet sent"],
  },
  {
    name: "Bluefin Sports", slug: "bluefin-sports", color: "#27272A", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Marco Vella",
    projects: [{ name: "Season launch", type: ProjectType.CAMPAIGN, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Season launch", date: d(10, 1), state: MilestoneState.UPCOMING },
    lastPortalActivity: minutesAgo(60 * 24 * 6),
  },
  {
    name: "Cedar & Sage", slug: "cedar-sage", color: "#3F6212", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Ira Dsouza",
    projects: [{ name: "Lifecycle email", type: ProjectType.RETAINER, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Newsletter Q4", date: d(10, 3), state: MilestoneState.UPCOMING },
    lastPortalActivity: minutesAgo(60 * 24),
  },
  {
    name: "Dhruv Motors", slug: "dhruv-motors", color: "#57534E", vertical: Vertical.MARKETING,
    stage: ClientStage.AT_RISK, templateName: "Marketing agency", contactName: "Rajat Khanna",
    projects: [{ name: "Showroom demand", type: ProjectType.CAMPAIGN, status: ProjectStatus.BLOCKED }],
    nextMilestone: { name: "Landing page", date: d(9, 15), state: MilestoneState.MISSED },
    approval: { deliverable: "Showroom landing page", version: "v1", contact: "Rajat Khanna", dueAt: d(9, 12), remind: 2 },
    lastPortalActivity: minutesAgo(60 * 24 * 14),
    healthFlags: ["Missed milestone", "Invoice FN-2026-0138 overdue 11 days"],
  },
  {
    name: "Everly Books", slug: "everly-books", color: "#44403C", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Priyanka Shah",
    projects: [{ name: "Festive catalogue", type: ProjectType.CAMPAIGN, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Festive catalogue", date: d(10, 8), state: MilestoneState.UPCOMING },
    lastPortalActivity: minutesAgo(60 * 24 * 3),
  },
  {
    name: "Farro Kitchen", slug: "farro-kitchen", color: "#7F1D1D", vertical: Vertical.MARKETING,
    stage: ClientStage.ACTIVE, templateName: "Marketing agency", contactName: "Deepa Nayar",
    projects: [{ name: "Menu launch", type: ProjectType.CAMPAIGN, status: ProjectStatus.ON_TRACK }],
    nextMilestone: { name: "Menu launch", date: d(10, 10), state: MilestoneState.UPCOMING },
    lastPortalActivity: minutesAgo(60 * 24 * 2),
  },
];

async function seedBook(
  agencyId: string,
  templates: Record<string, string>,
  leadId: string,
) {
  for (const spec of BOOK) {
    const client = await db.client.create({
      data: {
        agencyId,
        name: spec.name,
        slug: spec.slug,
        brandColor: spec.color,
        vertical: spec.vertical,
        stage: spec.stage,
        accountLeadId: leadId,
        driveFolderPath: `/Fieldnote Media/Clients/${spec.name}`,
        currency: "INR",
        healthFlags: spec.healthFlags ?? [],
        lastPortalActivity: spec.lastPortalActivity,
        portalSentAt: spec.lastPortalActivity ? d(4, 1) : null,
        contacts: {
          create: {
            name: spec.contactName,
            email: `${spec.contactName.split(" ")[0].toLowerCase()}@${spec.slug}.example`,
            role: ContactRole.APPROVER,
            jobTitle: "Marketing head",
            lastActiveAt: spec.lastPortalActivity,
          },
        },
      },
      include: { contacts: true },
    });

    await attachPortal(client.id, spec.slug, templates[spec.templateName]);

    // One project carries the next milestone the client list shows.
    let firstProjectId: string | null = null;
    for (const [i, p] of spec.projects.entries()) {
      const project = await db.project.create({
        data: {
          clientId: client.id,
          name: p.name,
          type: p.type,
          status: p.status,
          ownerId: leadId,
          startDate: d(7, 1),
          endDate: d(12, 31),
          visibility: V.CLIENT_VISIBLE,
        },
      });
      if (i === 0) firstProjectId = project.id;
    }

    if (firstProjectId) {
      await db.milestone.create({
        data: {
          projectId: firstProjectId,
          name: spec.nextMilestone.name,
          date: spec.nextMilestone.date,
          state: spec.nextMilestone.state,
          visibility: V.CLIENT_VISIBLE,
        },
      });
    }

    // Clients with an open approval need something to approve.
    if (spec.approval && firstProjectId) {
      const deliverable = await db.deliverable.create({
        data: {
          clientId: client.id,
          projectId: firstProjectId,
          name: spec.approval.deliverable,
          type: "Creative",
          previewKind: PreviewKind.DOCUMENT,
          status: DeliverableStatus.IN_REVIEW,
          ownerId: leadId,
          visibility: V.CLIENT_VISIBLE,
          publishedAt: spec.approval.dueAt,
          publishedByName: "Meera Joshi",
          publishedVersion: spec.approval.version,
          versions: {
            create: {
              label: spec.approval.version,
              note: "Sent for approval",
              authorId: leadId,
              isCurrent: true,
              publishedAt: spec.approval.dueAt,
            },
          },
        },
        include: { versions: true },
      });

      await db.approvalRequest.create({
        data: {
          versionId: deliverable.versions[0].id,
          approverId: client.contacts[0].id,
          state: ApprovalState.WAITING,
          requestedAt: new Date(spec.approval.dueAt.getTime() - 5 * 86400000),
          dueAt: spec.approval.dueAt,
          reminderCount: spec.approval.remind,
          lastRemindedAt: spec.approval.remind ? minutesAgo(60 * 24) : null,
          escalatedAt: spec.approval.remind >= 2 ? d(9, 16) : null,
          escalatedToName: spec.approval.remind >= 2 ? "Arjun Rao" : null,
        },
      });
    }

    // Aravalli is mid-onboarding: three of six steps done, and the portal link
    // is the last one — nothing is visible until it is sent.
    if (spec.slug === "aravalli-homes") {
      await seedOnboarding(client.id);
    }
  }
}

/** Copies a template's module map onto a client's portal. */
async function attachPortal(clientId: string, slug: string, templateId?: string) {
  const template = templateId
    ? await db.portalTemplate.findUnique({
        where: { id: templateId },
        include: { modules: { orderBy: { order: "asc" } } },
      })
    : null;

  return db.portalConfig.create({
    data: {
      clientId,
      templateId: template?.id,
      slug,
      modules: {
        create:
          template?.modules.map((m) => ({
            key: m.key,
            label: m.label,
            enabled: m.enabled,
            order: m.order,
            roles: m.roles,
          })) ?? [],
      },
    },
  });
}

async function seedOnboarding(clientId: string) {
  await db.onboardingChecklist.create({
    data: {
      clientId,
      templateName: "Fieldnote · D2C retainer",
      sourceDealId: "Aravalli · Q4 launch",
      steps: {
        create: [
          { order: 1, name: "Contract signed", detail: "Retainer 2026–27 · ₹28,80,000 / year", ownerName: "Arjun Rao", state: StepState.DONE, completedAt: d(9, 15, 18, 20), actionLabel: "DocuSign · filed to Drive" },
          { order: 2, name: "Drive folder mapped", detail: "/Clients/Aravalli Homes · 4 subfolders created", ownerName: "Arjun Rao", state: StepState.DONE, completedAt: d(9, 15, 18, 22), automatic: true, actionLabel: "Automatic" },
          { order: 3, name: "Intake questionnaire sent", detail: "Sent to Nikhil Bhandari as a link · answered 17 Sep", ownerName: "Meera Joshi", state: StepState.DONE, completedAt: d(9, 16, 9, 15), actionLabel: "Review 9 answers" },
          { order: 4, name: "Build the portal", detail: "From template · rename modules, confirm roles", ownerName: "Meera Joshi", state: StepState.IN_PROGRESS, actionLabel: "Open portal builder" },
          { order: 5, name: "Kickoff call", detail: "Agenda from template · 45 min", ownerName: "Meera Joshi", state: StepState.NOT_STARTED, scheduledAt: d(9, 20, 11, 0), actionLabel: "Google Meet · invite sent" },
          { order: 6, name: "Send portal access", detail: "Magic links to 2 contacts · no passwords", ownerName: "Meera Joshi", state: StepState.NOT_STARTED, actionLabel: "After step 4" },
        ],
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   Kiro Foods — the one client built to the bottom.

   Every row in the all-clients list opens this record, so the record → project
   → deliverable → portal-builder flow is one continuous path.
   ══════════════════════════════════════════════════════════════════════════ */

async function seedKiroFoods(
  agencyId: string,
  team: Record<string, { id: string; name: string }>,
  templates: Record<string, string>,
) {
  const client = await db.client.create({
    data: {
      agencyId,
      name: "Kiro Foods",
      slug: "kiro-foods",
      brandColor: "#7C2D12",
      vertical: Vertical.MARKETING,
      stage: ClientStage.ACTIVE,
      accountLeadId: team.meera.id,
      driveFolderPath: "/Fieldnote Media/Clients/Kiro Foods",
      currency: "INR",
      gstin: "27ABCDE1234F1Z5",
      taxRatePercent: 18,
      paymentRemindersEnabled: false,
      lastPortalActivity: minutesAgo(120),
      portalSentAt: d(4, 2),
      crmDealId: "kiro-2026",
      contacts: {
        create: [
          {
            name: "Karan Mehta", jobTitle: "Marketing head", email: "karan@kirofoods.com",
            role: ContactRole.APPROVER, notifyChannel: "email", notifyCadence: "weekly",
            lastActiveAt: minutesAgo(120),
          },
          {
            name: "Priya Iyer", jobTitle: "Brand manager", email: "priya@kirofoods.com",
            role: ContactRole.COLLABORATOR, notifyChannel: "whatsapp", notifyCadence: "immediate",
            lastActiveAt: minutesAgo(60 * 26),
          },
          {
            name: "Sandeep Rao", jobTitle: "Finance", email: "sandeep@kirofoods.com",
            role: ContactRole.BILLING, notifyChannel: "email", notifyCadence: "invoices",
            lastActiveAt: minutesAgo(60 * 48),
          },
        ],
      },
    },
    include: { contacts: true },
  });

  const karan = client.contacts.find((c) => c.role === ContactRole.APPROVER)!;
  const priya = client.contacts.find((c) => c.role === ContactRole.COLLABORATOR)!;
  const sandeep = client.contacts.find((c) => c.role === ContactRole.BILLING)!;

  const portal = await attachPortal(client.id, "kiro-foods", templates["Marketing agency"]);

  /* --- The campaign the client follows ---------------------------------- */
  const campaign = await db.project.create({
    data: {
      clientId: client.id,
      name: "Q4 performance campaign",
      type: ProjectType.CAMPAIGN,
      status: ProjectStatus.ON_TRACK,
      ownerId: team.meera.id,
      startDate: d(9, 1),
      endDate: d(11, 7),
      visibility: V.CLIENT_VISIBLE,
      revisionRoundsAllowed: 2,
      revisionRoundsUsed: 1,
      driveFolderPath: "/Fieldnote Media/Clients/Kiro Foods/Q4 performance campaign",
      phases: {
        create: [
          { name: "Flight 1 · Awareness", weight: 30, order: 0, status: MilestoneState.DONE, startDate: d(9, 1), endDate: d(9, 14) },
          { name: "Flight 2 · Consideration", weight: 30, order: 1, status: MilestoneState.DUE, startDate: d(9, 15), endDate: d(10, 2) },
          { name: "Flight 3 · Diwali conversion", weight: 40, order: 2, status: MilestoneState.UPCOMING, startDate: d(10, 3), endDate: d(10, 31) },
          { name: "Wrap", weight: 10, order: 3, status: MilestoneState.UPCOMING, startDate: d(11, 1), endDate: d(11, 7) },
        ],
      },
      milestones: {
        create: [
          { name: "Kickoff", date: d(9, 1), state: MilestoneState.DONE, visibility: V.CLIENT_VISIBLE },
          { name: "Creative set v3 approved", date: d(9, 19), state: MilestoneState.DUE, visibility: V.CLIENT_VISIBLE },
          // Never shown in the portal — this is what the dashed square means.
          { name: "Internal QA", date: d(9, 30), state: MilestoneState.UPCOMING, visibility: V.INTERNAL },
          { name: "Diwali flight goes live", date: d(10, 3), state: MilestoneState.UPCOMING, visibility: V.CLIENT_VISIBLE },
          { name: "October report", date: d(11, 7), state: MilestoneState.UPCOMING, visibility: V.CLIENT_VISIBLE },
        ],
      },
    },
    include: { milestones: true },
  });

  const ms = (name: string) => campaign.milestones.find((m) => m.name === name)!.id;

  /* --- Tasks. Internal by default; two have been published. -------------- */
  await db.task.createMany({
    data: [
      // Under the current phase rather than a milestone.
      { projectId: campaign.id, name: "Move 20% budget to lookalike set", ownerId: team.dev.id, status: TaskStatus.DONE, completed: true, estimateHours: 4, visibility: V.INTERNAL },
      { projectId: campaign.id, name: "Re-cut hero video for Meta 4:5", ownerId: team.dev.id, status: TaskStatus.IN_PROGRESS, estimateHours: 8, visibility: V.INTERNAL },
      { projectId: campaign.id, name: "Weekly performance read-out", ownerId: team.meera.id, status: TaskStatus.WAITING, dueDate: d(9, 19), estimateHours: 3, visibility: V.INTERNAL },
      { projectId: campaign.id, milestoneId: ms("Creative set v3 approved"), name: "Ship Diwali creative set v3", ownerId: team.dev.id, status: TaskStatus.IN_REVIEW, estimateHours: 12, visibility: V.CLIENT_VISIBLE },
      { projectId: campaign.id, milestoneId: ms("Creative set v3 approved"), name: "Collect approval from Karan", ownerId: team.meera.id, status: TaskStatus.WAITING, dueDate: d(9, 19), estimateHours: 1, visibility: V.INTERNAL },
      { projectId: campaign.id, milestoneId: ms("Diwali flight goes live"), name: "Landing pages to staging", ownerId: team.rohan.id, status: TaskStatus.AT_RISK, dueDate: d(9, 24), estimateHours: 16, visibility: V.INTERNAL },
      { projectId: campaign.id, milestoneId: ms("Diwali flight goes live"), name: "Pixel QA and UTM audit", ownerId: team.rohan.id, status: TaskStatus.NOT_STARTED, estimateHours: 6, visibility: V.INTERNAL },
    ],
  });

  /* --- The internal project the client cannot see ------------------------ */
  const landing = await db.project.create({
    data: {
      clientId: client.id,
      name: "Festive landing pages",
      type: ProjectType.PROJECT,
      status: ProjectStatus.AT_RISK,
      ownerId: team.rohan.id,
      startDate: d(9, 8),
      endDate: d(9, 30),
      visibility: V.INTERNAL,
      milestones: {
        create: [
          { name: "Staging handoff", date: d(9, 24), state: MilestoneState.AT_RISK, visibility: V.INTERNAL },
        ],
      },
    },
  });

  /* --- Deliverables ------------------------------------------------------ */

  // The one the whole publish/approve flow runs through.
  const diwali = await db.deliverable.create({
    data: {
      clientId: client.id,
      projectId: campaign.id,
      name: "Diwali creative set",
      type: "Creative",
      previewKind: PreviewKind.CREATIVE,
      status: DeliverableStatus.IN_REVIEW,
      assetSummary: "Creative · 6 assets · Meta and Google",
      ownerId: team.dev.id,
      visibility: V.CLIENT_VISIBLE,
      publishedAt: d(9, 18, 14, 6),
      publishedByName: "Arjun Rao",
      publishedVersion: "v3",
      driveFolderPath: "/Fieldnote Media/Clients/Kiro Foods/Q4 performance campaign/Creative",
      preview: {
        tiles: [
          { bg: "#1C1917", fg: "#FDE68A", eyebrow: "Kiro Foods · Diwali", headline: "Light up the table.", offer: "Festive boxes from ₹499 · Free delivery till 31 Oct" },
          { bg: "#7C2D12", fg: "#FFEDD5", eyebrow: "Kiro Foods · Diwali", headline: "Gift a box, not a bar.", offer: "Handmade mithai · Ships pan-India" },
          { bg: "#FEF3C7", fg: "#7C2D12", eyebrow: "Kiro Foods · Diwali", headline: "₹499 festive box.", offer: "Order by 28 Oct for Diwali delivery" },
        ],
        source: "Drive · 6 files",
      },
      versions: {
        create: [
          { label: "v1", note: "First concepts", authorId: team.meera.id, createdAt: d(9, 4, 9, 30), publishedAt: d(9, 4, 10, 0) },
          { label: "v2", note: "Copy pass, three formats", authorId: team.dev.id, createdAt: d(9, 10, 12, 40), publishedAt: d(9, 10, 13, 0) },
          { label: "v3", note: "Offer moved above the fold; new gold variant", authorId: team.dev.id, createdAt: d(9, 15, 17, 12), publishedAt: d(9, 18, 14, 6), isCurrent: true },
        ],
      },
    },
    include: { versions: true },
  });

  const v2 = diwali.versions.find((v) => v.label === "v2")!;
  const v3 = diwali.versions.find((v) => v.label === "v3")!;

  // The record that already exists: changes requested on v2, from email — and
  // the request it closed, so approval turnaround is measurable.
  await db.approvalRequest.create({
    data: {
      versionId: v2.id, approverId: karan.id, state: ApprovalState.CHANGES_REQUESTED,
      requestedAt: d(9, 10, 13, 0), dueAt: d(9, 13), decidedAt: d(9, 11, 10, 24),
    },
  });
  await db.approvalRecord.create({
    data: {
      versionId: v2.id,
      approverId: karan.id,
      decision: ApprovalDecision.CHANGES_REQUESTED,
      channel: Channel.EMAIL,
      comment: "Move the offer above the fold and lose the confetti.",
      decidedAt: d(9, 11, 10, 24),
    },
  });

  // The one waiting on Karan — this is the portal's "Needs you".
  await db.approvalRequest.create({
    data: {
      versionId: v3.id,
      approverId: karan.id,
      state: ApprovalState.WAITING,
      requestedAt: d(9, 18, 14, 6),
      dueAt: d(9, 19),
    },
  });

  await db.driveFile.createMany({
    data: [
      driveFile(client.id, v3.id, "Diwali_hero_1x1.png", 2_400_000, d(9, 15, 17, 10)),
      driveFile(client.id, v3.id, "Diwali_gift_4x5.png", 2_100_000, d(9, 15, 17, 10)),
      driveFile(client.id, v3.id, "Diwali_offer_9x16.png", 2_800_000, d(9, 15, 17, 11)),
      driveFile(client.id, v3.id, "Diwali_static_set.zip", 18_400_000, d(9, 15, 17, 12)),
      driveFile(client.id, null, "Hero_video_4x5_recut.mp4", 64_200_000, d(9, 17, 11, 4)),
      driveFile(client.id, null, "Copy_deck_diwali.gslides", null, d(9, 16, 15, 22)),
    ],
  });

  const sepReport = await db.deliverable.create({
    data: {
      clientId: client.id, projectId: campaign.id,
      name: "September performance report", type: "Report", previewKind: PreviewKind.DOCUMENT,
      status: DeliverableStatus.DELIVERED, ownerId: team.meera.id,
      visibility: V.CLIENT_VISIBLE, publishedAt: d(9, 12, 10, 0),
      publishedByName: "Meera Joshi", publishedVersion: "v1",
      versions: { create: [{ label: "v1", note: "September read-out", authorId: team.meera.id, isCurrent: true, createdAt: d(9, 12, 9, 40), publishedAt: d(9, 12, 10, 0) }] },
    },
  });

  const batch2 = await db.deliverable.create({
    data: {
      clientId: client.id, projectId: campaign.id,
      name: "Meta Ads creative set · batch 2", type: "Creative", previewKind: PreviewKind.CREATIVE,
      status: DeliverableStatus.APPROVED, assetSummary: "Creative · 4 assets · Meta",
      ownerId: team.dev.id, visibility: V.CLIENT_VISIBLE, publishedAt: d(9, 9, 12, 35),
      publishedByName: "Dev Patel", publishedVersion: "v2",
      versions: { create: [{ label: "v2", note: "Approved cut", authorId: team.dev.id, isCurrent: true, createdAt: d(9, 8, 16, 0), publishedAt: d(9, 9, 12, 35) }] },
    },
    include: { versions: true },
  });
  await db.approvalRequest.create({
    data: {
      versionId: batch2.versions[0].id, approverId: karan.id, state: ApprovalState.APPROVED,
      requestedAt: d(9, 9, 12, 35), dueAt: d(9, 12), decidedAt: d(9, 9, 14, 2),
    },
  });
  await db.approvalRecord.create({
    data: { versionId: batch2.versions[0].id, approverId: karan.id, decision: ApprovalDecision.APPROVED, channel: Channel.PORTAL, decidedAt: d(9, 9, 14, 2) },
  });

  await db.deliverable.create({
    data: {
      clientId: client.id, projectId: landing.id,
      name: "Landing page v1", type: "Web", previewKind: PreviewKind.WEB,
      status: DeliverableStatus.DRAFT, ownerId: team.rohan.id,
      visibility: V.INTERNAL,
      versions: { create: [{ label: "v1", note: "First build", authorId: team.rohan.id, isCurrent: true, createdAt: d(9, 16, 18, 0) }] },
    },
  });

  const mediaPlan = await db.deliverable.create({
    data: {
      clientId: client.id, projectId: campaign.id,
      name: "Q4 media plan", type: "Document", previewKind: PreviewKind.DOCUMENT,
      status: DeliverableStatus.APPROVED, ownerId: team.meera.id,
      visibility: V.CLIENT_VISIBLE, publishedAt: d(8, 26, 10, 0),
      publishedByName: "Meera Joshi", publishedVersion: "v2",
      versions: { create: [{ label: "v2", note: "Budget split agreed", authorId: team.meera.id, isCurrent: true, createdAt: d(8, 25, 17, 0), publishedAt: d(8, 26, 10, 0) }] },
    },
    include: { versions: true },
  });
  await db.approvalRequest.create({
    data: {
      versionId: mediaPlan.versions[0].id, approverId: karan.id, state: ApprovalState.APPROVED,
      requestedAt: d(8, 26, 10, 0), dueAt: d(8, 29), decidedAt: d(8, 28, 16, 42),
    },
  });
  await db.approvalRecord.create({
    data: { versionId: mediaPlan.versions[0].id, approverId: karan.id, decision: ApprovalDecision.APPROVED, channel: Channel.EMAIL, decidedAt: d(8, 28, 16, 42) },
  });

  /* --- What the agency has told them ------------------------------------ */
  const week37 = await db.update.create({
    data: {
      projectId: campaign.id,
      title: "Week 37: CPA down 12%",
      body: "Cost per purchase is ₹163 after moving budget to lookalikes. Landing pages are 2 days behind; a second developer is on it.",
      authorId: team.meera.id,
      visibility: V.CLIENT_VISIBLE,
      publishedAt: d(9, 16, 9, 30),
      createdAt: d(9, 16, 9, 30),
    },
  });

  await db.comment.createMany({
    data: [
      { projectId: campaign.id, body: "@Meera the 4:5 recut needs the offer lockup moved up 40px before we ship.", authorMemberId: team.dev.id, visibility: V.INTERNAL, mentions: ["Meera Joshi"], createdAt: d(9, 17, 14, 12) },
      { projectId: campaign.id, updateId: week37.id, body: "Good news on CPA. Can we hold the landing pages until the offer is final?", authorContactId: karan.id, visibility: V.CLIENT_VISIBLE, createdAt: d(9, 16, 17, 40) },
    ],
  });

  /* --- The contract and the accounts ------------------------------------- */
  await db.contract.createMany({
    data: [
      {
        clientId: client.id, title: "Retainer agreement 2026–27", kind: ContractKind.RETAINER,
        status: ContractStatus.ACTIVE,
        parties: ["Fieldnote Media Pvt Ltd", "Kiro Foods Pvt Ltd"],
        annualValue: 5040000, monthlyValue: 420000, currency: "INR",
        termStart: d(4, 1), termEnd: d2027(3, 31), renewalDate: d2027(3, 31),
        signedAt: new Date(2026, 2, 28, 11, 4),
        esignProvider: "DocuSign", esignEnvelopeId: "4F2A-91C7-55D0-B3E8",
        driveFilePath: "/Fieldnote Media/Clients/Kiro Foods/Contract",
        visibility: V.CLIENT_VISIBLE,
      },
      {
        clientId: client.id, title: "Q4 performance campaign · SOW", kind: ContractKind.SOW,
        status: ContractStatus.SIGNED, annualValue: 1800000, currency: "INR",
        signedAt: d(8, 20), esignProvider: "DocuSign",
        governsProjectId: campaign.id, visibility: V.CLIENT_VISIBLE,
      },
      {
        clientId: client.id, title: "Festive landing pages · SOW", kind: ContractKind.SOW,
        status: ContractStatus.DRAFT, annualValue: 320000, currency: "INR",
        governsProjectId: landing.id, visibility: V.INTERNAL,
      },
    ],
  });

  await db.invoice.createMany({
    data: [
      inv(client.id, "FN-2026-0142", 420000, d(9, 1), d(9, 15), InvoiceStatus.OVERDUE, PaymentRail.RAZORPAY_UPI, null, d(9, 16)),
      inv(client.id, "FN-2026-0131", 420000, d(8, 1), d(8, 14), InvoiceStatus.PAID, PaymentRail.RAZORPAY_UPI, d(8, 14, 12, 31)),
      inv(client.id, "FN-2026-0119", 420000, d(7, 1), d(7, 14), InvoiceStatus.PAID, PaymentRail.BANK_TRANSFER, d(7, 12)),
      inv(client.id, "FN-2026-0104", 420000, d(6, 1), d(6, 14), InvoiceStatus.PAID, PaymentRail.RAZORPAY_CARD, d(6, 13)),
    ],
  });

  await db.document.createMany({
    data: [
      doc(client.id, "Retainer agreement 2026–27.pdf", DocumentCategory.CONTRACT, d(3, 28), V.CLIENT_VISIBLE),
      doc(client.id, "Q4 performance campaign · SOW.pdf", DocumentCategory.CONTRACT, d(8, 20), V.CLIENT_VISIBLE, campaign.id),
      doc(client.id, "Diwali brief v2.pdf", DocumentCategory.BRIEF, d(9, 16, 11, 2), V.CLIENT_VISIBLE, campaign.id),
      doc(client.id, "August performance report.pdf", DocumentCategory.REPORT, d(9, 3), V.CLIENT_VISIBLE),
      doc(client.id, "September performance report.pdf", DocumentCategory.REPORT, d(9, 12), V.CLIENT_VISIBLE),
      doc(client.id, "Diwali creative set v3.zip", DocumentCategory.CREATIVE, d(9, 15), V.CLIENT_VISIBLE),
      doc(client.id, "FN-2026-0142.pdf", DocumentCategory.INVOICE, d(9, 1), V.CLIENT_VISIBLE),
    ],
  });

  await db.clientRequest.create({
    data: {
      clientId: client.id, kind: "Report question",
      details: "Can you confirm the October budget split before the Diwali flight goes live?",
      neededBy: d(9, 22), status: RequestStatus.NEW, raisedById: priya.id,
      createdAt: d(9, 16, 12, 5),
    },
  });

  await db.meeting.create({
    data: {
      clientId: client.id, title: "Week 37 review", heldAt: d(9, 15, 16, 0),
      notes: "Agreed to move 20% of Flight 2 budget to lookalikes. Landing pages slipping by two days; Rohan adding a second developer.",
      actionItems: ["Meera to send revised flight plan", "Dev to recut hero for 4:5"],
      visibility: V.CLIENT_VISIBLE,
    },
  });

  return { client, karan, priya, sandeep, portal, campaign, landing, diwali, sepReport };
}

/* --- Row builders -------------------------------------------------------- */

function driveFile(clientId: string, versionId: string | null, name: string, size: number | null, modifiedAt: Date) {
  return {
    clientId, versionId,
    path: `/Fieldnote Media/Clients/Kiro Foods/Q4 performance campaign/Creative/${name}`,
    name,
    sizeBytes: size ? BigInt(size) : null,
    modifiedAt,
    syncedAt: minutesAgo(3),
  };
}

function inv(
  clientId: string, number: string, amount: number, issuedAt: Date, dueAt: Date,
  status: InvoiceStatus, rail: PaymentRail, paidAt: Date | null = null, viewedAt: Date | null = null,
) {
  return {
    clientId, number, amount, currency: "INR", status, issuedAt, dueAt, paidAt,
    paymentRail: rail,
    paymentLink: status === InvoiceStatus.PAID ? null : `https://rzp.io/i/${number.toLowerCase()}`,
    viewedAt,
    externalId: number, externalSource: "Zoho Books",
    syncedAt: minutesAgo(120),
  };
}

function doc(
  clientId: string, name: string, category: DocumentCategory, modifiedAt: Date,
  visibility: Visibility, projectId?: string,
) {
  return { clientId, name, category, modifiedAt, visibility, projectId };
}

/* ══════════════════════════════════════════════════════════════════════════
   Kiro Foods' dashboard and report.
   ══════════════════════════════════════════════════════════════════════════ */

async function seedKiroDashboard(portalId: string, clientId: string) {
  await db.dashboardWidget.createMany({
    data: [
      {
        portalId, title: "Sessions", kind: "line", source: "GA4", span: 2, order: 0,
        syncedAt: minutesAgo(3),
        config: { value: 184220, delta: "+8.4%", series: [120, 132, 128, 145, 151, 149, 168, 172, 166, 181, 184] },
      },
      {
        portalId, title: "Rankings", kind: "table", source: "Search Console", span: 1, order: 1,
        syncedAt: minutesAgo(60),
        config: { rows: [["festive gift boxes", "#4", "↑3"], ["mithai online", "#7", "↑1"], ["diwali hampers", "#11", "↓2"], ["kiro foods", "#1", "—"]] },
      },
      {
        portalId, title: "Ad spend and results", kind: "bars", source: "Meta Ads", span: 1, order: 2,
        syncedAt: minutesAgo(12),
        config: { stats: [["Spend", "₹6,40,000"], ["Purchases", "3,918"], ["CPA", "₹163"], ["ROAS", "4.2×"]], bars: [40, 52, 48, 61, 58, 72, 80] },
      },
      {
        portalId, title: "Retail footfall", kind: "manual", source: "manual", span: 1, order: 3,
        config: { value: 12480, target: 15000, percent: 83 },
      },
      {
        portalId, title: "Revenue overview", kind: "embed", source: "Looker Studio", span: 2, order: 4,
        config: { caption: "Embedded report · opens in Looker Studio", stats: [["Revenue", "₹27,12,000"], ["Orders", "3,918"], ["AOV", "₹692"], ["Repeat", "31%"]] },
      },
    ],
  });

  await db.report.create({
    data: {
      clientId, title: "September performance report", period: "2026-09",
      state: "DRAFT", sourceActivityCount: 46,
      sourceNames: ["GA4", "Meta Ads", "Search Console"],
      permanentSlug: "kiro-foods-2026-09",
      scheduleEnabled: true, scheduleCadence: "Monthly · 5th · 09:00 IST", scheduleDraftFirst: true,
      sections: {
        create: [
          { order: 0, heading: "Summary", provenance: "Drafted from 3 updates and 2 approvals", body: "Flight 2 is on track. Cost per purchase fell 12% to ₹163 after budget moved to lookalike audiences, and purchases are up 14.1% on August. The Diwali creative set is with you for approval; landing pages are two days behind and a second developer is on them." },
          { order: 1, heading: "Work delivered", provenance: "From 3 published deliverables", body: "Meta Ads creative set, batch 2 (v2) — approved 9 Sep\nQ4 media plan (v2) — approved 28 Aug, live 1 Sep\nDiwali creative set (v3) — in review, due 19 Sep" },
          { order: 2, heading: "Metrics", provenance: "GA4 · Meta Ads · Search Console · 1–17 Sep", metrics: [{ label: "Sessions", value: "184,220", delta: "+8.4%" }, { label: "Purchases", value: "3,918", delta: "+14.1%" }, { label: "Cost per purchase", value: "₹163", delta: "−12.0%" }, { label: "ROAS", value: "4.2×", delta: "target 4.0×" }] },
          { order: 3, heading: "Next period", provenance: "From campaign calendar", body: "Landing pages reach staging on 24 September. The Diwali flight goes live on 3 October, carrying the approved creative set. The October report follows on 7 November." },
        ],
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   Northlight Studio — the design agency, in ink blue, billing in USD.
   ══════════════════════════════════════════════════════════════════════════ */

async function seedNorthlight(templates: Record<string, string>) {
  const agency = await db.agency.create({
    data: {
      name: "Northlight Studio", slug: "northlight", vertical: Vertical.DESIGN, city: "Bengaluru",
      teamSize: "2–10", accentHex: "#233B8F", portalDomain: "clients.northlight.studio",
      emailSender: "Northlight Studio <hello@northlight.studio>",
      driveRootPath: "/Northlight", clientsRootPath: "/Northlight/Clients",
      defaultApprovalDays: 3,
    },
  });

  const riya = await member(agency.id, { name: "Riya Sharma", email: "riya@northlight.studio", role: TeamRole.OWNER, discipline: "Design", lastActiveAt: minutesAgo(45) });
  const tanvi = await member(agency.id, { name: "Tanvi Desai", email: "tanvi@northlight.studio", role: TeamRole.MEMBER, discipline: "Design", lastActiveAt: minutesAgo(90) });

  const client = await db.client.create({
    data: {
      agencyId: agency.id, name: "Tidewater Hotels", slug: "tidewater", brandColor: "#0F2A3F",
      vertical: Vertical.DESIGN, stage: ClientStage.ACTIVE, accountLeadId: riya.id,
      currency: "USD", driveFolderPath: "/Northlight/Clients/Tidewater Hotels",
      lastPortalActivity: minutesAgo(60 * 48), portalSentAt: d(6, 1),
      contacts: {
        create: [
          { name: "Maya Ellison", jobTitle: "Brand director", email: "maya@tidewaterhotels.com", role: ContactRole.APPROVER, lastActiveAt: minutesAgo(60 * 48) },
          { name: "Tom Reyes", jobTitle: "Marketing manager", email: "tom@tidewaterhotels.com", role: ContactRole.COLLABORATOR, lastActiveAt: minutesAgo(60 * 20) },
          { name: "Grace Whitfield", jobTitle: "Accounts payable", email: "grace@tidewaterhotels.com", role: ContactRole.BILLING, notifyCadence: "invoices", lastActiveAt: minutesAgo(60 * 72) },
        ],
      },
    },
    include: { contacts: true },
  });
  const maya = client.contacts.find((c) => c.role === ContactRole.APPROVER)!;

  await attachPortal(client.id, "tidewater", templates["Design studio"]);

  const project = await db.project.create({
    data: {
      clientId: client.id, name: "Brand identity refresh", type: ProjectType.PROJECT,
      status: ProjectStatus.AT_RISK, ownerId: riya.id,
      startDate: d(7, 15), endDate: d(10, 31), visibility: V.CLIENT_VISIBLE,
      phases: {
        create: [
          { name: "Discovery", weight: 20, order: 0, status: MilestoneState.DONE },
          { name: "Identity system", weight: 45, order: 1, status: MilestoneState.DUE },
          { name: "Rollout", weight: 35, order: 2, status: MilestoneState.UPCOMING },
        ],
      },
      milestones: {
        create: [
          { name: "Discovery readout", date: d(8, 5), state: MilestoneState.DONE, visibility: V.CLIENT_VISIBLE },
          { name: "Identity sign-off", date: d(9, 26), state: MilestoneState.DUE, visibility: V.CLIENT_VISIBLE },
          { name: "Brand guidelines delivered", date: d(10, 24), state: MilestoneState.UPCOMING, visibility: V.CLIENT_VISIBLE },
        ],
      },
    },
  });

  const logo = await db.deliverable.create({
    data: {
      clientId: client.id, projectId: project.id,
      name: "Identity system · logo suite", type: "Design", previewKind: PreviewKind.FIGMA,
      status: DeliverableStatus.IN_REVIEW, assetSummary: "Figma frame · live",
      ownerId: tanvi.id, figmaFileKey: "tidewater-identity",
      preview: {
        brandColor: "#0F2A3F", paperColor: "#F6F1E7", accentColor: "#C9A96A",
        word: "TIDEWATER", sub: "HOTELS",
        palette: ["#0F2A3F", "#2E6F8E", "#C9A96A", "#F6F1E7"],
        source: "Figma · live frame · Drive",
      },
      visibility: V.CLIENT_VISIBLE, publishedAt: d(9, 15, 18, 0),
      publishedByName: "Riya Sharma", publishedVersion: "v4",
      versions: {
        create: [
          { label: "v2", note: "Wordmark exploration", authorId: tanvi.id, createdAt: d(8, 28, 11, 0), publishedAt: d(8, 28, 12, 0) },
          { label: "v3", note: "Wave mark introduced", authorId: tanvi.id, createdAt: d(9, 8, 10, 0), publishedAt: d(9, 8, 11, 0) },
          { label: "v4", note: "Mark lowered 8px; wordmark tracking tightened", authorId: tanvi.id, createdAt: d(9, 15, 17, 30), publishedAt: d(9, 15, 18, 0), isCurrent: true },
        ],
      },
    },
    include: { versions: true },
  });

  const v3 = logo.versions.find((v) => v.label === "v3")!;
  const v4 = logo.versions.find((v) => v.label === "v4")!;

  await db.approvalRequest.create({
    data: {
      versionId: v3.id, approverId: maya.id, state: ApprovalState.CHANGES_REQUESTED,
      requestedAt: d(9, 8, 11, 0), dueAt: d(9, 11), decidedAt: d(9, 12, 9, 48),
    },
  });
  await db.approvalRecord.create({
    data: {
      versionId: v3.id, approverId: maya.id, decision: ApprovalDecision.CHANGES_REQUESTED,
      channel: Channel.PORTAL,
      comment: "Can the wave mark sit lower relative to the wordmark? It floats.",
      decidedAt: d(9, 12, 9, 48),
    },
  });
  await db.approvalRequest.create({
    data: { versionId: v4.id, approverId: maya.id, state: ApprovalState.WAITING, requestedAt: d(9, 15, 18, 0), dueAt: d(9, 22) },
  });

  // The pinned annotation on the live Figma frame, and the agency's reply.
  const pin = await db.comment.create({
    data: {
      deliverableId: logo.id, versionId: v4.id,
      body: "The mark floats above the wordmark — can it sit lower?",
      authorContactId: maya.id, visibility: V.CLIENT_VISIBLE,
      pinX: 61, pinY: 42, createdAt: d(9, 12, 9, 48),
    },
  });
  await db.comment.create({
    data: {
      deliverableId: logo.id, versionId: v4.id, parentId: pin.id,
      body: "Lowered 8px in v4 — Tanvi",
      authorMemberId: tanvi.id, visibility: V.CLIENT_VISIBLE, createdAt: d(9, 15, 17, 35),
    },
  });

  await db.contract.create({
    data: {
      clientId: client.id, title: "Master services agreement", kind: ContractKind.MSA,
      status: ContractStatus.ACTIVE, parties: ["Northlight Studio", "Tidewater Hotels Inc"],
      annualValue: 48000, currency: "USD", termStart: d(7, 1), termEnd: d(10, 31),
      renewalDate: d(10, 31), signedAt: d(6, 28), esignProvider: "DocuSign",
      visibility: V.CLIENT_VISIBLE,
    },
  });

  await db.invoice.createMany({
    data: [
      { clientId: client.id, number: "NL-2026-0027", amount: 12500, currency: "USD", status: InvoiceStatus.OPEN, issuedAt: d(9, 1), dueAt: d(9, 30), paymentRail: PaymentRail.STRIPE_CARD, paymentLink: "https://buy.stripe.com/nl-2026-0027", externalId: "NL-2026-0027", externalSource: "Xero", syncedAt: minutesAgo(45) },
      { clientId: client.id, number: "NL-2026-0018", amount: 12500, currency: "USD", status: InvoiceStatus.PAID, issuedAt: d(8, 1), dueAt: d(8, 30), paidAt: d(8, 22), paymentRail: PaymentRail.BANK_TRANSFER, externalId: "NL-2026-0018", externalSource: "Xero", syncedAt: minutesAgo(45) },
    ],
  });

  await db.asset.createMany({
    data: [
      { clientId: client.id, name: "Primary lockup", caption: "SVG, PNG, PDF · approved v3", category: "Logo", preview: { kind: "lockup", bg: "#0F2A3F", fg: "#F6F1E7", word: "TIDEWATER", sub: "HOTELS" } },
      { clientId: client.id, name: "Wave mark", caption: "SVG, PNG · approved v3", category: "Logo", preview: { kind: "mark", bg: "#F6F1E7", fg: "#0F2A3F" } },
      { clientId: client.id, name: "Colour palette", caption: "4 colours · hex and Pantone", category: "Colour", preview: { kind: "swatches", colors: ["#0F2A3F", "#2E6F8E", "#C9A96A", "#F6F1E7"] } },
      { clientId: client.id, name: "Typography", caption: "Pretendard · 400 500", category: "Type", preview: { kind: "type", sample: "Aa", name: "PRETENDARD", weights: "400 500" } },
    ],
  });

  await db.integration.createMany({
    data: [
      int(agency.id, "Google Drive", IntegrationCategory.STORAGE, IntegrationStatus.CONNECTED, { account: "riya@northlight.studio", syncedAt: minutesAgo(4) }),
      int(agency.id, "Figma", IntegrationCategory.DESIGN, IntegrationStatus.CONNECTED, { purpose: "Live frames and version events.", syncedAt: minutesAgo(4) }),
      int(agency.id, "DocuSign", IntegrationCategory.ESIGN, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(600) }),
      int(agency.id, "Stripe", IntegrationCategory.PAYMENTS, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(45) }),
      int(agency.id, "Xero", IntegrationCategory.ACCOUNTING, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(45) }),
    ],
  });

  return { agency, client, contacts: client.contacts };
}

/* ══════════════════════════════════════════════════════════════════════════
   Cast & Co. — the influencer agency, in oxblood. The vertical that is least
   served by existing tools, and the one the Roster module exists for.
   ══════════════════════════════════════════════════════════════════════════ */

const CREATORS: [string, string, number, RosterStatus, string, Date | null, string, number][] = [
  ["@aarushi.eats", "Aarushi Menon", 184000, RosterStatus.CONTENT_IN_REVIEW, "2 reels, 1 story set", d(9, 24), "#7C2D12", 220000],
  ["@glowwithsana", "Sana Kapadia", 311000, RosterStatus.POSTED, "1 reel, 2 posts", d(9, 13), "#1C1917", 320000],
  ["@ritvik.runs", "Ritvik Sharma", 126000, RosterStatus.CONTENT_IN_REVIEW, "2 reels", d(9, 26), "#365314", 150000],
  ["@thekabirway", "Kabir Anand", 92000, RosterStatus.CONTRACTED, "1 reel, 1 story set", d(10, 2), "#1E3A5F", 110000],
  ["@naina.notes", "Naina Rao", 73000, RosterStatus.BRIEFED, "1 reel", d(10, 6), "#7A1F2B", 95000],
  ["@meher.minimal", "Meher Jain", 58000, RosterStatus.BRIEFED, "2 posts", d(10, 9), "#44403C", 85000],
];

async function seedCastAndCo(templates: Record<string, string>) {
  const agency = await db.agency.create({
    data: {
      name: "Cast & Co.", slug: "cast-and-co", vertical: Vertical.INFLUENCER, city: "Mumbai",
      teamSize: "11–25", accentHex: "#7A1F2B", portalDomain: "portal.castandco.in",
      emailSender: "Cast & Co. <hello@castandco.in>",
      driveRootPath: "/Cast and Co", clientsRootPath: "/Cast and Co/Clients",
      defaultApprovalDays: 2,
    },
  });

  const neha = await member(agency.id, { name: "Neha Kulkarni", email: "neha@castandco.in", role: TeamRole.OWNER, discipline: "Accounts", lastActiveAt: minutesAgo(20) });
  await member(agency.id, { name: "Rohan Shetty", email: "rohan@castandco.in", role: TeamRole.MEMBER, discipline: "Talent", lastActiveAt: minutesAgo(70) });

  const client = await db.client.create({
    data: {
      agencyId: agency.id, name: "Lumen Skincare", slug: "lumen", brandColor: "#7A1F2B",
      vertical: Vertical.INFLUENCER, stage: ClientStage.ACTIVE, accountLeadId: neha.id,
      currency: "INR", gstin: "27FGHIJ5678K1Z9",
      driveFolderPath: "/Cast and Co/Clients/Lumen Skincare",
      lastPortalActivity: minutesAgo(240), portalSentAt: d(8, 10),
      contacts: {
        create: [
          { name: "Devika Nair", jobTitle: "Brand lead", email: "devika@lumenskincare.in", role: ContactRole.APPROVER, notifyChannel: "whatsapp", notifyCadence: "immediate", lastActiveAt: minutesAgo(240) },
          { name: "Ishaan Verma", jobTitle: "Social manager", email: "ishaan@lumenskincare.in", role: ContactRole.COLLABORATOR, lastActiveAt: minutesAgo(60 * 12) },
          { name: "Farah Khan", jobTitle: "Finance controller", email: "farah@lumenskincare.in", role: ContactRole.BILLING, notifyCadence: "invoices", lastActiveAt: minutesAgo(60 * 30) },
        ],
      },
    },
    include: { contacts: true },
  });
  const devika = client.contacts.find((c) => c.role === ContactRole.APPROVER)!;

  await attachPortal(client.id, "lumen", templates["Influencer management"]);

  const project = await db.project.create({
    data: {
      clientId: client.id, name: "Festive creator push", type: ProjectType.CAMPAIGN,
      status: ProjectStatus.ON_TRACK, ownerId: neha.id,
      startDate: d(9, 1), endDate: d(11, 15), visibility: V.CLIENT_VISIBLE,
      phases: {
        create: [
          { name: "Flight 1 · Briefing", weight: 25, order: 0, status: MilestoneState.DONE },
          { name: "Flight 2 · Content", weight: 40, order: 1, status: MilestoneState.DUE },
          { name: "Flight 3 · Amplify", weight: 35, order: 2, status: MilestoneState.UPCOMING },
        ],
      },
      milestones: {
        create: [
          { name: "Creators contracted", date: d(9, 8), state: MilestoneState.DONE, visibility: V.CLIENT_VISIBLE },
          { name: "Reel set live", date: d(9, 24), state: MilestoneState.DUE, visibility: V.CLIENT_VISIBLE },
          { name: "Campaign wrap", date: d(11, 15), state: MilestoneState.UPCOMING, visibility: V.CLIENT_VISIBLE },
        ],
      },
    },
  });

  for (const [handle, realName, followers, status, summary, postingDate, color, fee] of CREATORS) {
    const rm = await db.rosterMember.create({
      data: {
        clientId: client.id, handle, realName, followers, status,
        deliverableSummary: summary, postingDate, avatarColor: color,
        channels: ["Instagram", "YouTube"], feeAmount: fee,
      },
    });
    if (status === RosterStatus.POSTED) {
      await db.rosterPost.create({
        data: {
          memberId: rm.id, kind: "Reel", postedAt: d(9, 14),
          reach: 412300, engagement: 6.2, likes: 24100, saves: 3940,
          source: "Instagram", syncedAt: minutesAgo(18),
        },
      });
    }
  }

  const reel = await db.deliverable.create({
    data: {
      clientId: client.id, projectId: project.id,
      name: "Reel · @aarushi.eats", type: "Post", previewKind: PreviewKind.REEL,
      status: DeliverableStatus.IN_REVIEW, assetSummary: "Post · Instagram reel · 34 s",
      ownerId: neha.id, visibility: V.CLIENT_VISIBLE,
      publishedAt: d(9, 17, 11, 30), publishedByName: "Neha Kulkarni", publishedVersion: "v2",
      preview: {
        gradient: ["#3B2A1E", "#8B5E3C", "#F1D7B8"],
        handle: "@aarushi.eats",
        caption: "@aarushi.eats the festive glow set from @lumen.skincare ✨ #ad #lumenfestive",
        progress: 38, duration: "34 s",
        postingPlan: [
          "Instagram reel · 24 Sep 2026 · 19:00 IST",
          "Caption and disclosure as shown. Usage rights: 12 months paid social.",
        ],
        source: "Drive · MP4 · 34 s",
      },
      versions: {
        create: [
          { label: "v1", note: "First cut", authorId: neha.id, createdAt: d(9, 12, 15, 0), publishedAt: d(9, 12, 16, 0) },
          { label: "v2", note: "Product shot held longer; #ad added to caption", authorId: neha.id, createdAt: d(9, 17, 10, 40), publishedAt: d(9, 17, 11, 30), isCurrent: true },
        ],
      },
    },
    include: { versions: true },
  });

  const rv1 = reel.versions.find((v) => v.label === "v1")!;
  const rv2 = reel.versions.find((v) => v.label === "v2")!;

  await db.approvalRequest.create({
    data: {
      versionId: rv1.id, approverId: devika.id, state: ApprovalState.CHANGES_REQUESTED,
      requestedAt: d(9, 12, 16, 0), dueAt: d(9, 14), decidedAt: d(9, 14, 19, 12),
    },
  });
  await db.approvalRecord.create({
    data: {
      versionId: rv1.id, approverId: devika.id, decision: ApprovalDecision.CHANGES_REQUESTED,
      channel: Channel.WHATSAPP, comment: "Hold the product shot longer and add #ad.",
      decidedAt: d(9, 14, 19, 12),
    },
  });
  await db.approvalRequest.create({
    data: { versionId: rv2.id, approverId: devika.id, state: ApprovalState.WAITING, requestedAt: d(9, 17, 11, 30), dueAt: d(9, 20) },
  });

  await db.contract.create({
    data: {
      clientId: client.id, title: "Campaign agreement", kind: ContractKind.PROJECT,
      status: ContractStatus.ACTIVE, parties: ["Cast & Co. Media LLP", "Lumen Skincare Pvt Ltd"],
      annualValue: 1480000, currency: "INR", termStart: d(9, 1), termEnd: d(11, 15),
      renewalDate: d(11, 15), signedAt: d(8, 29), esignProvider: "Zoho Sign",
      visibility: V.CLIENT_VISIBLE,
    },
  });

  await db.invoice.createMany({
    data: [
      { clientId: client.id, number: "CC-2026-0088", amount: 740000, currency: "INR", status: InvoiceStatus.OPEN, issuedAt: d(9, 4), dueAt: d(9, 18), paymentRail: PaymentRail.RAZORPAY_UPI, paymentLink: "https://rzp.io/i/cc-2026-0088", externalId: "CC-2026-0088", externalSource: "Zoho Books", syncedAt: minutesAgo(25) },
      { clientId: client.id, number: "CC-2026-0071", amount: 740000, currency: "INR", status: InvoiceStatus.PAID, issuedAt: d(8, 4), dueAt: d(8, 18), paidAt: d(8, 17), paymentRail: PaymentRail.RAZORPAY_UPI, externalId: "CC-2026-0071", externalSource: "Zoho Books", syncedAt: minutesAgo(25) },
    ],
  });

  await db.integration.createMany({
    data: [
      int(agency.id, "Google Drive", IntegrationCategory.STORAGE, IntegrationStatus.CONNECTED, { account: "neha@castandco.in", syncedAt: minutesAgo(11) }),
      int(agency.id, "Instagram", IntegrationCategory.SOCIAL, IntegrationStatus.CONNECTED, { purpose: "Post performance per creator.", syncedAt: minutesAgo(18) }),
      int(agency.id, "YouTube", IntegrationCategory.SOCIAL, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(40) }),
      int(agency.id, "Zoho Sign", IntegrationCategory.ESIGN, IntegrationStatus.CONNECTED, { purpose: "Creator contracts.", syncedAt: minutesAgo(200) }),
      int(agency.id, "Zoho Books", IntegrationCategory.ACCOUNTING, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(25) }),
      int(agency.id, "Razorpay", IntegrationCategory.PAYMENTS, IntegrationStatus.CONNECTED, { syncedAt: minutesAgo(25) }),
      int(agency.id, "WhatsApp Business", IntegrationCategory.MESSAGING, IntegrationStatus.CONNECTED, { account: "Cast & Co. (verified)", syncedAt: minutesAgo(60) }),
    ],
  });

  return { agency, client, contacts: client.contacts };
}

/* ══════════════════════════════════════════════════════════════════════════
   Wiring it together.
   ══════════════════════════════════════════════════════════════════════════ */

/** Every contact gets a personal, expiring link. There is no password path. */
async function seedMagicLinks() {
  const contacts = await db.contact.findMany({ select: { id: true, clientId: true, name: true } });
  const expiresAt = new Date(Date.now() + 14 * 86400000);
  for (const c of contacts) {
    await db.magicLink.create({
      data: {
        contactId: c.id,
        token: `ml_${c.id.slice(-8)}${Math.random().toString(36).slice(2, 10)}`,
        expiresAt,
      },
    });
  }
  return contacts.length;
}

/** The client record's Activity tab — a filterable audit trail. */
async function seedKiroActivity(agencyId: string, clientId: string, team: Record<string, { id: string; name: string }>) {
  await db.activityLog.createMany({
    data: [
      {
        agencyId, clientId, actorName: "Karan Mehta", actorIsClient: true,
        verb: "requested changes on", objectType: "DeliverableVersion",
        objectName: "Diwali creative set v2",
        detail: "Move the offer above the fold and lose the confetti.",
        source: "EMAIL", visibility: V.CLIENT_VISIBLE, createdAt: d(9, 11, 10, 24),
      },
      {
        agencyId, clientId, actorMemberId: team.meera.id, actorName: "Meera Joshi",
        verb: "published", objectType: "Deliverable", objectName: "September performance report v1",
        source: "SYSTEM", visibility: V.CLIENT_VISIBLE, createdAt: d(9, 12, 10, 0),
      },
      {
        agencyId, clientId, actorMemberId: team.dev.id, actorName: "Dev Patel",
        verb: "added", objectType: "DeliverableVersion", objectName: "Diwali creative set v3",
        detail: "3 files promoted from Drive",
        source: "DRIVE", visibility: V.INTERNAL, createdAt: d(9, 15, 17, 12),
      },
      {
        agencyId, clientId, actorMemberId: team.meera.id, actorName: "Meera Joshi",
        verb: "published", objectType: "Update", objectName: "Week 37: CPA down 12%",
        source: "SYSTEM", visibility: V.CLIENT_VISIBLE, createdAt: d(9, 16, 9, 30),
      },
      {
        agencyId, clientId, actorName: "Priya Iyer", actorIsClient: true,
        verb: "uploaded", objectType: "DriveFile", objectName: "Diwali brief v2.pdf",
        detail: "via the portal · no login required · filed to Kiro Foods / From client",
        source: "DRIVE", createdAt: d(9, 16, 11, 2),
      },
      {
        agencyId, clientId, actorName: "Priya Iyer", actorIsClient: true,
        verb: "raised a request", objectType: "ClientRequest",
        objectName: "Confirm the October budget split",
        source: "PORTAL", createdAt: d(9, 16, 12, 5),
      },
      {
        agencyId, clientId, actorMemberId: team.arjun.id, actorName: "Arjun Rao",
        verb: "published", objectType: "DeliverableVersion", objectName: "Diwali creative set v3",
        detail: "3 contacts notified",
        source: "SYSTEM", visibility: V.CLIENT_VISIBLE, createdAt: d(9, 18, 14, 6),
      },
      {
        agencyId, clientId, actorName: "Karan Mehta", actorIsClient: true,
        verb: "opened the portal", objectType: "Portal", objectName: "Kiro Foods",
        detail: "4 min · from email",
        source: "PORTAL", createdAt: minutesAgo(120),
      },
    ],
  });
}

async function wipe() {
  // Agencies cascade to almost everything; the rest are roots.
  await db.agency.deleteMany();
  await db.portalTemplate.deleteMany();
  await db.intakeForm.deleteMany();
  await db.user.deleteMany();
}

async function main() {
  console.log("Seeding TaskFiber…");
  await wipe();

  const templates = await seedTemplates();
  console.log(`  ${Object.keys(templates).length} shipped portal templates`);

  const { agency, team } = await seedFieldnote(templates);
  console.log(`  ${agency.name} · ${Object.keys(team).length} team members`);

  const kiro = await seedKiroFoods(agency.id, team, templates);
  await seedKiroDashboard(kiro.portal.id, kiro.client.id);
  await seedKiroActivity(agency.id, kiro.client.id, team);
  console.log("  Kiro Foods built to the bottom");

  await seedBook(agency.id, templates, team.meera.id);
  const clientCount = await db.client.count({ where: { agencyId: agency.id } });
  console.log(`  ${clientCount} clients in Fieldnote's book`);

  const northlight = await seedNorthlight(templates);
  console.log(`  ${northlight.agency.name} · ${northlight.client.name}`);

  const cast = await seedCastAndCo(templates);
  console.log(`  ${cast.agency.name} · ${cast.client.name}`);

  const links = await seedMagicLinks();
  console.log(`  ${links} magic links issued`);

  // A last check on the invariant the whole product rests on.
  const leaked = await db.task.count({ where: { visibility: V.CLIENT_VISIBLE } });
  const totalTasks = await db.task.count();
  console.log(`  ${leaked} of ${totalTasks} tasks are client-visible — the rest stay internal`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
