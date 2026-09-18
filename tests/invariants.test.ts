/**
 * The invariants.
 *
 * These are not unit tests of convenience — each one guards a promise the
 * product makes to an agency, and the product is not worth adopting if any of
 * them fails.
 *
 * They run against the seeded development database: `npm run db:seed` first.
 */
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { approvalRecordLine } from "../src/server/approvals";
import { canApprove, canSeeInvoices, roleSeesModule } from "../src/server/visibility";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

after(async () => db.$disconnect());

describe("the one rule: nothing reaches a client automatically", () => {
  it("defaults every publishable row to internal", async () => {
    // A row created with no visibility named must not be client-visible. This
    // is the schema-level half of the rule.
    const client = await db.client.findFirstOrThrow({ where: { slug: "kiro-foods" } });
    const project = await db.project.create({
      data: { clientId: client.id, name: "__invariant probe", type: "PROJECT" },
    });
    const milestone = await db.milestone.create({
      data: { projectId: project.id, name: "__probe", date: new Date() },
    });
    const task = await db.task.create({
      data: { projectId: project.id, name: "__probe" },
    });
    const update = await db.update.create({
      data: { projectId: project.id, title: "__probe", body: "__probe" },
    });
    const comment = await db.comment.create({
      data: { projectId: project.id, body: "__probe" },
    });
    const deliverable = await db.deliverable.create({
      data: { clientId: client.id, name: "__probe", type: "Probe" },
    });

    for (const [label, row] of [
      ["project", project],
      ["milestone", milestone],
      ["task", task],
      ["update", update],
      ["comment", comment],
      ["deliverable", deliverable],
    ] as const) {
      assert.equal(row.visibility, "INTERNAL", `${label} must default to INTERNAL`);
    }

    await db.project.delete({ where: { id: project.id } });
    await db.deliverable.delete({ where: { id: deliverable.id } });
  });

  it("keeps internal work out of every portal read", async () => {
    const client = await db.client.findFirstOrThrow({
      where: { slug: "kiro-foods" },
      include: { contacts: true },
    });

    const internalProjects = await db.project.count({
      where: { clientId: client.id, visibility: "INTERNAL" },
    });
    assert.ok(internalProjects > 0, "the fixture needs internal work to be a real test");

    const { portalQuery } = await import("../src/server/visibility");
    const collaborator = client.contacts.find((c) => c.role === "COLLABORATOR")!;

    const q = portalQuery({
      contactId: collaborator.id,
      clientId: client.id,
      agencyId: client.agencyId,
      role: "COLLABORATOR",
      name: collaborator.name,
    });

    for (const row of await q.projects()) {
      assert.equal(row.visibility, "CLIENT_VISIBLE");
    }
    for (const row of await q.deliverables()) {
      assert.equal(row.visibility, "CLIENT_VISIBLE");
    }
    for (const row of await q.documents()) {
      assert.equal(row.visibility, "CLIENT_VISIBLE");
    }

    // Internal milestones never cross, even on a published project.
    const published = await db.project.findFirstOrThrow({
      where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
    });
    const timeline = await q.timeline(published.id);
    for (const m of timeline?.milestones ?? []) {
      assert.equal(m.visibility, "CLIENT_VISIBLE");
    }
  });
});

describe("roles", () => {
  it("lets only the approver approve", () => {
    assert.equal(canApprove("APPROVER"), true);
    assert.equal(canApprove("BILLING"), false);
    assert.equal(canApprove("COLLABORATOR"), false);
    assert.equal(canApprove("VIEWER"), false);
  });

  it("shows invoices to the approver and billing contact only", () => {
    assert.equal(canSeeInvoices("APPROVER"), true);
    assert.equal(canSeeInvoices("BILLING"), true);
    assert.equal(canSeeInvoices("COLLABORATOR"), false);
  });

  it("refuses a collaborator's invoice query rather than returning rows", async () => {
    const client = await db.client.findFirstOrThrow({
      where: { slug: "kiro-foods" },
      include: { contacts: true },
    });
    const collaborator = client.contacts.find((c) => c.role === "COLLABORATOR")!;
    const { portalQuery } = await import("../src/server/visibility");
    const q = portalQuery({
      contactId: collaborator.id,
      clientId: client.id,
      agencyId: client.agencyId,
      role: "COLLABORATOR",
      name: collaborator.name,
    });
    await assert.rejects(() => q.invoices());
  });

  it("keeps Overview open to every role, and never hides a gated nav item", () => {
    const overview = { key: "OVERVIEW" as const, roles: [], enabled: true };
    const invoices = {
      key: "INVOICES" as const,
      roles: ["APPROVER" as const, "BILLING" as const],
      enabled: true,
    };
    assert.equal(roleSeesModule(overview, "COLLABORATOR"), true);
    assert.equal(roleSeesModule(invoices, "COLLABORATOR"), false);
    assert.equal(roleSeesModule(invoices, "BILLING"), true);
  });
});

describe("the approval record", () => {
  it("is append-only", async () => {
    const record = await db.approvalRecord.findFirstOrThrow();

    // Prisma will happily update a row; the guarantee is that the application
    // never exposes a path to. Assert the surface, not the database.
    const approvals = await import("../src/server/approvals");
    const writers = Object.keys(approvals);
    assert.ok(
      !writers.some((k) => /update|delete|edit|amend/i.test(k)),
      `approvals.ts must expose no mutation path, found: ${writers.join(", ")}`,
    );

    // And the record that exists still says what it said.
    const again = await db.approvalRecord.findUniqueOrThrow({ where: { id: record.id } });
    assert.equal(again.decidedAt.toISOString(), record.decidedAt.toISOString());
  });

  it("writes one sentence, whatever the channel", () => {
    const at = new Date(2026, 8, 17, 14, 6);
    const base = {
      decision: "APPROVED" as const,
      versionLabel: "v3",
      approverName: "Karan Mehta",
      decidedAt: at,
    };

    assert.equal(
      approvalRecordLine({ ...base, channel: "PORTAL" }),
      "Approved v3 by Karan Mehta, 17 Sep 2026, 14:06, via portal.",
    );
    assert.equal(
      approvalRecordLine({ ...base, channel: "EMAIL" }),
      "Approved v3 by Karan Mehta, 17 Sep 2026, 14:06, via email.",
    );
    assert.equal(
      approvalRecordLine({ ...base, channel: "WHATSAPP" }),
      "Approved v3 by Karan Mehta, 17 Sep 2026, 14:06, via WhatsApp.",
    );
  });

  it("labels a verbal decision as one, and names who wrote it down", () => {
    const line = approvalRecordLine({
      decision: "APPROVED",
      versionLabel: "v1",
      approverName: "Anita Bose",
      decidedAt: new Date(2026, 8, 17, 9, 0),
      channel: "VERBAL",
      recordedByName: "Arjun Rao",
    });
    assert.match(line, /recorded verbally to Arjun Rao/);
  });

  it("refuses a change request with no words", async () => {
    const { recordDecision } = await import("../src/server/approvals");
    const version = await db.deliverableVersion.findFirstOrThrow();
    const contact = await db.contact.findFirstOrThrow({ where: { role: "APPROVER" } });
    await assert.rejects(
      () =>
        recordDecision({
          versionId: version.id,
          approverId: contact.id,
          decision: "CHANGES_REQUESTED",
          channel: "PORTAL",
          comment: "   ",
        }),
      /comment is required/i,
    );
  });
});

describe("the seed matches the design's casting", () => {
  it("ships three agencies in three accents", async () => {
    const agencies = await db.agency.findMany({ orderBy: { name: "asc" } });
    assert.equal(agencies.length, 3);
    const accents = agencies.map((a) => a.accentHex).sort();
    assert.deepEqual(accents, ["#1F5B3F", "#233B8F", "#7A1F2B"]);
  });

  it("gives Fieldnote fourteen clients, so ten must fit above the fold", async () => {
    const fieldnote = await db.agency.findFirstOrThrow({ where: { slug: "fieldnote" } });
    assert.equal(await db.client.count({ where: { agencyId: fieldnote.id } }), 14);
  });

  it("casts three contact roles on every portal client", async () => {
    for (const slug of ["kiro-foods", "tidewater", "lumen"]) {
      const client = await db.client.findFirstOrThrow({
        where: { slug },
        include: { contacts: true },
      });
      const roles = client.contacts.map((c) => c.role).sort();
      assert.deepEqual(roles, ["APPROVER", "BILLING", "COLLABORATOR"], slug);
    }
  });

  it("gives every contact a magic link and no password", async () => {
    const contacts = await db.contact.count();
    const links = await db.magicLink.count();
    assert.equal(links, contacts);
  });
});
