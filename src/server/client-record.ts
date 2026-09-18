import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "./db";

/** The client header and tab counts, shared by every tab on the record. */
export const getClientRecord = cache(async (agencyId: string, slug: string) => {
  const client = await db.client.findFirst({
    where: { agencyId, slug },
    include: {
      accountLead: { select: { id: true, name: true } },
      agency: {
        select: {
          name: true,
          accentHex: true,
          portalDomain: true,
          customDomain: true,
          dnsVerified: true,
          logoAsset: true,
          emailSender: true,
        },
      },
      portal: { include: { template: { select: { name: true } } } },
      contacts: { orderBy: { role: "asc" } },
    },
  });
  if (!client) notFound();

  const [projectCount, deliverableCount] = await Promise.all([
    db.project.count({ where: { clientId: client.id } }),
    db.deliverable.count({ where: { clientId: client.id } }),
  ]);

  return { client, counts: { projects: projectCount, deliverables: deliverableCount, contacts: client.contacts.length } };
});

export const getClientOverview = cache(async (clientId: string) => {
  const [projects, contract, finance, activity] = await Promise.all([
    db.project.findMany({
      where: { clientId, status: { not: "DONE" } },
      orderBy: { startDate: "asc" },
      include: {
        owner: { select: { name: true } },
        milestones: {
          orderBy: { date: "asc" },
          select: { id: true, name: true, date: true, state: true, visibility: true },
        },
      },
    }),
    db.contract.findFirst({
      where: { clientId, kind: { in: ["RETAINER", "MSA", "PROJECT"] } },
      orderBy: { termStart: "desc" },
    }),
    db.invoice.findMany({ where: { clientId }, orderBy: { dueAt: "desc" } }),
    db.activityLog.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const outstanding = finance
    .filter((i) => i.status !== "PAID")
    .reduce((n, i) => n + Number(i.amount), 0);
  const overdue = finance.filter((i) => i.status === "OVERDUE");
  const paidOnTime = finance.filter((i) => i.status === "PAID" && i.paidAt && i.paidAt <= i.dueAt).length;

  return {
    projects,
    contract,
    finance: {
      invoices: finance,
      outstanding,
      overdue,
      paidOnTime,
      total: finance.filter((i) => i.status === "PAID").length,
      syncedAt: finance[0]?.syncedAt ?? null,
    },
    activity,
  };
});

/** Whether the workspace's accounting connection is currently failing. */
export const accountingHealth = cache(async (agencyId: string) => {
  const row = await db.integration.findFirst({
    where: { agencyId, category: "ACCOUNTING" },
    orderBy: { status: "asc" },
  });
  return {
    provider: row?.provider ?? "the accounting tool",
    failing: row?.status === "FAILING",
    syncedAt: row?.syncedAt ?? null,
    errorReason: row?.errorReason ?? null,
    blastRadius: row?.blastRadius ?? null,
  };
});

/** The deliverable register, and the one open in the slide-over. */
export const listDeliverables = cache(async (clientId: string) => {
  return db.deliverable.findMany({
    where: { clientId },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      owner: { select: { name: true } },
      project: { select: { id: true, name: true } },
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
});

export const getDeliverable = cache(async (clientId: string, id: string) => {
  return db.deliverable.findFirst({
    where: { id, clientId },
    include: {
      owner: { select: { name: true } },
      project: { select: { id: true, name: true } },
      client: {
        select: {
          slug: true,
          name: true,
          contacts: { select: { id: true, name: true, role: true } },
        },
      },
      versions: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          records: {
            orderBy: { decidedAt: "desc" },
            include: { approver: { select: { name: true } } },
          },
          requests: {
            where: { state: "WAITING" },
            include: { approver: { select: { id: true, name: true } } },
          },
          files: { select: { id: true, name: true } },
        },
      },
    },
  });
});

/** The storage connection's health, which the Documents tab reports honestly. */
export const driveHealth = cache(async (agencyId: string) => {
  const row = await db.integration.findFirst({
    where: { agencyId, category: "STORAGE" },
    orderBy: { status: "asc" },
  });
  return {
    provider: row?.provider ?? "Drive",
    failing: row?.status === "FAILING",
    syncedAt: row?.syncedAt ?? null,
    errorReason: row?.errorReason ?? null,
  };
});
