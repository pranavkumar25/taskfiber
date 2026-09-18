import { ApprovalState, Visibility } from "@/generated/prisma/enums";
import { db } from "./db";
import { requestApproval } from "./approvals";

/* ---------------------------------------------------------------------------
   Publishing.

   The rule the product is built on: nothing crosses to a client except through
   one of these functions, and every one of them writes an ActivityLog row. A
   route that flips `visibility` with a bare `db.update` is a bug.

   The UI counterpart of this module is the confirmation popover, which names
   the blast radius BEFORE the action fires — every recipient by name and the
   channel they will be notified on. `publishRecipients` is what fills it.
--------------------------------------------------------------------------- */

export type Actor = { memberId?: string; name: string };

/** Who gains access when something is published to this client. */
export async function publishRecipients(clientId: string) {
  return db.contact.findMany({
    where: { clientId },
    select: { id: true, name: true, role: true, notifyChannel: true },
    orderBy: { role: "asc" },
  });
}

/**
 * Publish a deliverable version to the client.
 *
 * One action, optionally two effects: the version becomes visible, and — if the
 * confirmation's pre-checked box was left checked — an approval request is
 * raised against the named approver in the same breath.
 */
export async function publishVersion(args: {
  versionId: string;
  actor: Actor;
  requestApprovalFrom?: string | null;
  dueAt?: Date;
}) {
  const version = await db.deliverableVersion.findUniqueOrThrow({
    where: { id: args.versionId },
    include: {
      deliverable: {
        select: {
          id: true,
          name: true,
          clientId: true,
          client: { select: { agencyId: true, name: true } },
        },
      },
    },
  });

  const publishedAt = new Date();
  const recipients = await publishRecipients(version.deliverable.clientId);

  await db.$transaction([
    db.deliverableVersion.update({
      where: { id: version.id },
      data: { publishedAt, isCurrent: true },
    }),
    db.deliverableVersion.updateMany({
      where: { deliverableId: version.deliverable.id, id: { not: version.id } },
      data: { isCurrent: false },
    }),
    db.deliverable.update({
      where: { id: version.deliverable.id },
      data: {
        visibility: Visibility.CLIENT_VISIBLE,
        publishedAt,
        publishedByName: args.actor.name,
        publishedVersion: version.label,
      },
    }),
    db.activityLog.create({
      data: {
        agencyId: version.deliverable.client.agencyId,
        clientId: version.deliverable.clientId,
        actorMemberId: args.actor.memberId ?? null,
        actorName: args.actor.name,
        verb: "published",
        objectType: "DeliverableVersion",
        objectId: version.id,
        objectName: `${version.deliverable.name} ${version.label}`,
        detail: `${recipients.length} contacts notified`,
        source: "SYSTEM",
        visibility: Visibility.CLIENT_VISIBLE,
      },
    }),
  ]);

  if (args.requestApprovalFrom) {
    await requestApproval({
      versionId: version.id,
      approverId: args.requestApprovalFrom,
      dueAt: args.dueAt,
    });
  }

  return {
    publishedAt,
    recipients,
    toast: `Published ${version.deliverable.name} ${version.label} to ${version.deliverable.client.name} · ${recipients.length} contacts notified`,
  };
}

/**
 * Unpublish.
 *
 * Reversible, immediate, and loud: any open approval request is cancelled, the
 * change is logged, and the toast states the consequence in the client's terms.
 * The approval records already written survive — they are what happened.
 */
export async function unpublishDeliverable(args: {
  deliverableId: string;
  actor: Actor;
}) {
  const deliverable = await db.deliverable.findUniqueOrThrow({
    where: { id: args.deliverableId },
    select: {
      id: true,
      name: true,
      clientId: true,
      publishedVersion: true,
      client: { select: { agencyId: true, name: true } },
    },
  });

  await db.$transaction([
    db.deliverable.update({
      where: { id: deliverable.id },
      data: { visibility: Visibility.INTERNAL },
    }),
    db.approvalRequest.updateMany({
      where: {
        version: { deliverableId: deliverable.id },
        state: ApprovalState.WAITING,
      },
      data: { state: ApprovalState.CHANGES_REQUESTED, decidedAt: new Date() },
    }),
    db.activityLog.create({
      data: {
        agencyId: deliverable.client.agencyId,
        clientId: deliverable.clientId,
        actorMemberId: args.actor.memberId ?? null,
        actorName: args.actor.name,
        verb: "unpublished",
        objectType: "Deliverable",
        objectId: deliverable.id,
        objectName: deliverable.name,
        source: "SYSTEM",
        visibility: Visibility.INTERNAL,
      },
    }),
  ]);

  return {
    toast: `Unpublished ${deliverable.publishedVersion ?? ""}. ${deliverable.client.name} no longer sees this version.`.replace(
      "  ",
      " ",
    ),
  };
}

/* --- Row-level visibility, for everything that is not a deliverable ------- */

type Publishable = "project" | "milestone" | "task" | "update" | "comment";

const OWNER_PATH: Record<Publishable, string> = {
  project: "clientId",
  milestone: "project.clientId",
  task: "project.clientId",
  update: "project.clientId",
  comment: "project.clientId",
};

/**
 * Flip one row's visibility. Used by the task row toggle, the project header
 * switch and the comment composer.
 */
export async function setVisibility(args: {
  entity: Publishable;
  id: string;
  visibility: Visibility;
  actor: Actor;
}) {
  const { entity, id, visibility } = args;

  // Resolve the owning client so the change can be logged against it.
  const owner = await resolveOwner(entity, id);

  // An explicit switch rather than a dynamic delegate lookup: the set of
  // publishable things is closed, and spelling it out keeps Prisma's types.
  const data = { visibility };
  switch (entity) {
    case "project":
      await db.project.update({ where: { id }, data });
      break;
    case "milestone":
      await db.milestone.update({ where: { id }, data });
      break;
    case "task":
      await db.task.update({ where: { id }, data });
      break;
    case "update":
      await db.update.update({ where: { id }, data });
      break;
    case "comment":
      await db.comment.update({ where: { id }, data });
      break;
  }

  await db.activityLog.create({
    data: {
      agencyId: owner.agencyId,
      clientId: owner.clientId,
      actorMemberId: args.actor.memberId ?? null,
      actorName: args.actor.name,
      verb:
        visibility === Visibility.CLIENT_VISIBLE ? "published" : "unpublished",
      objectType: entity,
      objectId: id,
      objectName: owner.label,
      source: "SYSTEM",
      visibility,
    },
  });

  return { visibility, ownerPath: OWNER_PATH[entity] };
}

async function resolveOwner(entity: Publishable, id: string) {
  const clientSelect = {
    select: { id: true, agencyId: true, name: true },
  } as const;

  if (entity === "project") {
    const row = await db.project.findUniqueOrThrow({
      where: { id },
      select: { name: true, client: clientSelect },
    });
    return { clientId: row.client.id, agencyId: row.client.agencyId, label: row.name };
  }

  if (entity === "milestone") {
    const row = await db.milestone.findUniqueOrThrow({
      where: { id },
      select: { name: true, project: { select: { client: clientSelect } } },
    });
    return {
      clientId: row.project.client.id,
      agencyId: row.project.client.agencyId,
      label: row.name,
    };
  }

  if (entity === "task") {
    const row = await db.task.findUniqueOrThrow({
      where: { id },
      select: { name: true, project: { select: { client: clientSelect } } },
    });
    return {
      clientId: row.project.client.id,
      agencyId: row.project.client.agencyId,
      label: row.name,
    };
  }

  if (entity === "update") {
    const row = await db.update.findUniqueOrThrow({
      where: { id },
      select: { title: true, project: { select: { client: clientSelect } } },
    });
    return {
      clientId: row.project.client.id,
      agencyId: row.project.client.agencyId,
      label: row.title,
    };
  }

  const row = await db.comment.findUniqueOrThrow({
    where: { id },
    select: { body: true, project: { select: { client: clientSelect } } },
  });
  if (!row.project) throw new Error("Comment is not attached to a project.");
  return {
    clientId: row.project.client.id,
    agencyId: row.project.client.agencyId,
    label: row.body.slice(0, 60),
  };
}
