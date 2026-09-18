import { cache } from "react";
import { ClientStage } from "@/generated/prisma/enums";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   The all-clients list.

   The first screen an agency sees, and the one the whole book is judged on. It
   ships at 48px two-line rows: the second line names the actual projects, and
   for an at-risk client it carries the reason inline rather than behind a
   hover, which a touch or keyboard user would never find.
--------------------------------------------------------------------------- */

export type ClientRow = Awaited<ReturnType<typeof listClients>>[number];

export const listClients = cache(async (agencyId: string, stage?: ClientStage) => {
  const clients = await db.client.findMany({
    where: { agencyId, ...(stage ? { stage } : {}) },
    orderBy: [{ stage: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      brandColor: true,
      vertical: true,
      stage: true,
      healthFlags: true,
      lastPortalActivity: true,
      portalSentAt: true,
      projects: {
        where: { status: { not: "DONE" } },
        orderBy: { startDate: "asc" },
        select: {
          name: true,
          milestones: {
            where: { state: { not: "DONE" } },
            orderBy: { date: "asc" },
            take: 1,
            select: { name: true, date: true, state: true },
          },
        },
      },
      contacts: {
        select: { name: true, role: true, lastActiveAt: true },
      },
    },
  });

  // Open approvals per client, and the soonest due date among them.
  const approvals = await db.approvalRequest.findMany({
    where: {
      state: "WAITING",
      version: { deliverable: { client: { agencyId } } },
    },
    select: {
      dueAt: true,
      version: { select: { deliverable: { select: { clientId: true } } } },
    },
  });

  const byClient = new Map<string, { count: number; soonest: Date | null }>();
  for (const a of approvals) {
    const id = a.version.deliverable.clientId;
    const entry = byClient.get(id) ?? { count: 0, soonest: null };
    entry.count += 1;
    if (a.dueAt && (!entry.soonest || a.dueAt < entry.soonest)) entry.soonest = a.dueAt;
    byClient.set(id, entry);
  }

  const rows = clients.map((c) => {
    const nextMilestone = c.projects
      .flatMap((p) => p.milestones)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    // The person whose visit the portal column reports.
    const lastVisitor = c.contacts
      .filter((ct) => ct.lastActiveAt)
      .sort((a, b) => (b.lastActiveAt!.getTime() - a.lastActiveAt!.getTime()))[0];

    return {
      ...c,
      projectNames: c.projects.map((p) => p.name),
      nextMilestone: nextMilestone ?? null,
      approvals: byClient.get(c.id) ?? { count: 0, soonest: null },
      lastVisitor: lastVisitor?.name ?? null,
    };
  });

  // "Sort: next milestone ↑" — clients with no dated work sink to the bottom.
  return rows.sort((a, b) => {
    const at = a.nextMilestone?.date.getTime() ?? Infinity;
    const bt = b.nextMilestone?.date.getTime() ?? Infinity;
    return at === bt ? a.name.localeCompare(b.name) : at - bt;
  });
});

export const clientStageCounts = cache(async (agencyId: string) => {
  const rows = await db.client.groupBy({
    by: ["stage"],
    where: { agencyId },
    _count: { _all: true },
  });
  const total = rows.reduce((n, r) => n + r._count._all, 0);
  const counts = Object.fromEntries(rows.map((r) => [r.stage, r._count._all]));
  return { total, counts: counts as Partial<Record<ClientStage, number>> };
});
