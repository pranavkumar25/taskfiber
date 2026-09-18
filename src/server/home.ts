import { cache } from "react";
import { db } from "./db";

/** Screen 6.2's four numbers, and the three lists under them. */
export const getHome = cache(async (agencyId: string) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [clients, integrations, openApprovals, decided, publishing, requests] =
    await Promise.all([
      db.client.findMany({
        where: { agencyId },
        select: { id: true, name: true, slug: true, lastPortalActivity: true, healthFlags: true, stage: true },
      }),
      db.integration.findMany({ where: { agencyId }, select: { status: true, provider: true } }),
      db.approvalRequest.findMany({
        where: { state: "WAITING", version: { deliverable: { client: { agencyId } } } },
        orderBy: { dueAt: "asc" },
        include: {
          approver: { select: { name: true } },
          version: {
            include: {
              deliverable: {
                select: { id: true, name: true, client: { select: { name: true, slug: true } } },
              },
            },
          },
        },
      }),
      db.approvalRecord.findMany({
        where: { version: { deliverable: { client: { agencyId } } } },
        orderBy: { decidedAt: "desc" },
        take: 20,
        include: {
          approver: { select: { name: true } },
          version: { select: { label: true, deliverable: { select: { name: true } } } },
        },
      }),
      db.deliverable.findMany({
        where: {
          client: { agencyId },
          visibility: "INTERNAL",
          versions: { some: {} },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          updatedAt: true,
          client: { select: { name: true, slug: true } },
        },
      }),
      db.clientRequest.findMany({
        where: { client: { agencyId }, status: "NEW" },
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true, slug: true } } },
      }),
    ]);

  const opened = clients.filter(
    (c) => c.lastPortalActivity && c.lastPortalActivity >= monthStart,
  ).length;

  const byChannel = decided.reduce(
    (n, r) => n + (r.channel === "EMAIL" || r.channel === "WHATSAPP" ? 1 : 0),
    0,
  );

  // Turnaround, measured from request to decision on the decided ones.
  const settled = await db.approvalRequest.findMany({
    where: {
      state: { not: "WAITING" },
      decidedAt: { not: null },
      version: { deliverable: { client: { agencyId } } },
    },
    select: { requestedAt: true, decidedAt: true },
  });
  const turnaround =
    settled.length > 0
      ? settled.reduce(
          (n, r) => n + (r.decidedAt!.getTime() - r.requestedAt.getTime()) / 86400000,
          0,
        ) / settled.length
      : null;

  const connected = integrations.filter((i) => i.status === "CONNECTED").length;
  const failing = integrations.filter((i) => i.status === "FAILING");

  const pastSla = openApprovals.filter((a) => a.dueAt && a.dueAt.getTime() < Date.now());

  return {
    stats: {
      portalsOpened: { opened, total: clients.length },
      channelShare: decided.length ? Math.round((byChannel / decided.length) * 100) : 0,
      turnaround,
      integrations: { connected, failing: failing.map((f) => f.provider) },
    },
    openApprovals,
    pastSla,
    publishing,
    requests,
    atRisk: clients.filter((c) => c.healthFlags.length > 0),
  };
});
