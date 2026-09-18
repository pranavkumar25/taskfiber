import { cache } from "react";
import { db } from "./db";

export type CalEvent = {
  id: string;
  date: Date;
  client: string;
  label: string;
  kind: "milestone" | "approval" | "contract";
  state: "done" | "due" | "at-risk" | "missed" | "upcoming";
  internal: boolean;
};

/**
 * Everything dated, across every client. The legend on the screen states the
 * encoding: filled is client-visible, dashed is internal.
 */
export const getCalendar = cache(async (agencyId: string) => {
  const [milestones, approvals, contracts] = await Promise.all([
    db.milestone.findMany({
      where: { project: { client: { agencyId } } },
      include: { project: { select: { client: { select: { name: true } } } } },
      orderBy: { date: "asc" },
    }),
    db.approvalRequest.findMany({
      where: { state: "WAITING", version: { deliverable: { client: { agencyId } } } },
      include: {
        version: {
          select: {
            label: true,
            deliverable: { select: { name: true, client: { select: { name: true } } } },
          },
        },
      },
    }),
    db.contract.findMany({
      where: { client: { agencyId }, termEnd: { not: null } },
      include: { client: { select: { name: true } } },
    }),
  ]);

  const events: CalEvent[] = [
    ...milestones.map((m) => ({
      id: `m-${m.id}`,
      date: m.date,
      client: m.project.client.name,
      label: m.name,
      kind: "milestone" as const,
      state: m.state.toLowerCase().replace("_", "-") as CalEvent["state"],
      internal: m.visibility === "INTERNAL",
    })),
    ...approvals
      .filter((a) => a.dueAt)
      .map((a) => ({
        id: `a-${a.id}`,
        date: a.dueAt!,
        client: a.version.deliverable.client.name,
        label: `${a.version.deliverable.name} ${a.version.label} approval due`,
        kind: "approval" as const,
        state: (a.dueAt!.getTime() < Date.now() ? "missed" : "due") as CalEvent["state"],
        internal: false,
      })),
    ...contracts.map((c) => ({
      id: `c-${c.id}`,
      date: c.termEnd!,
      client: c.client.name,
      label: `${c.title} ends`,
      kind: "contract" as const,
      state: "due" as const,
      internal: false,
    })),
  ];

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
});

/** The delivery board: what ships per week, per client and per owner. */
export const getBoard = cache(async (agencyId: string) => {
  const [milestones, deliverables, members] = await Promise.all([
    db.milestone.findMany({
      where: { project: { client: { agencyId } }, state: { not: "DONE" } },
      include: {
        project: {
          select: { name: true, ownerId: true, client: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { date: "asc" },
    }),
    db.deliverable.findMany({
      where: { client: { agencyId } },
      include: {
        owner: { select: { id: true, name: true } },
        client: { select: { name: true, slug: true } },
      },
    }),
    db.member.findMany({
      where: { agencyId },
      include: {
        ownedTasks: {
          where: { completed: false },
          select: { estimateHours: true, project: { select: { clientId: true } } },
        },
      },
    }),
  ]);

  return { milestones, deliverables, members };
});

export const getPipeline = cache(async (agencyId: string) => {
  const deals = await db.deal.findMany({
    where: { agencyId, stage: { not: "LOST" } },
    orderBy: { closeDate: "asc" },
  });
  const crm = await db.integration.findFirst({
    where: { agencyId, category: "CRM", status: "CONNECTED" },
  });
  return { deals, crm };
});
