import {
  ApprovalDecision,
  ApprovalState,
  Channel,
  DeliverableStatus,
  Visibility,
} from "@/generated/prisma/enums";
import { db } from "./db";
import { formatDate, formatDateTime } from "./format";

/* ---------------------------------------------------------------------------
   Approvals.

   Two things are load-bearing here.

   1. The record is APPEND-ONLY. `recordDecision` is the only writer, and there
      is no update or delete path anywhere in the codebase. A decision, once
      given, is what happened.

   2. The record line has ONE grammar, reused verbatim in the portal, the email
      and the WhatsApp receipt. Only the channel changes. That is why a client
      who approves from a WhatsApp quick reply sees the same sentence they would
      have seen in the portal.
--------------------------------------------------------------------------- */

const CHANNEL_WORDS: Record<Channel, string> = {
  PORTAL: "via portal",
  EMAIL: "via email",
  WHATSAPP: "via WhatsApp",
  VERBAL: "recorded verbally",
};

export type RecordLineInput = {
  decision: ApprovalDecision;
  versionLabel: string;
  approverName: string;
  decidedAt: Date;
  channel: Channel;
  recordedByName?: string | null;
};

/**
 * The immutable line.
 *
 *   Approved v3 by Karan Mehta, 17 Sep 2026, 14:06, via portal.
 *   Requested changes on v2 · Karan Mehta · 11 Sep 2026, 10:24 · via email
 *
 * A verbally-given decision says so, and names who wrote it down — it is never
 * dressed up as a client action.
 */
export function approvalRecordLine(r: RecordLineInput) {
  const when = formatDateTime(r.decidedAt);
  const channel = CHANNEL_WORDS[r.channel];

  if (r.decision === ApprovalDecision.APPROVED) {
    const line = `Approved ${r.versionLabel} by ${r.approverName}, ${when}, ${channel}.`;
    return r.channel === Channel.VERBAL && r.recordedByName
      ? `${line.slice(0, -1)} to ${r.recordedByName}.`
      : line;
  }

  const line = `Requested changes on ${r.versionLabel} · ${r.approverName} · ${when} · ${channel}`;
  return r.channel === Channel.VERBAL && r.recordedByName
    ? `${line} to ${r.recordedByName}`
    : line;
}

/** The receipt echoed back over a channel, same grammar, prefixed. */
export function approvalReceipt(r: RecordLineInput, agencyName: string) {
  return `Recorded: ${approvalRecordLine(r)} ${agencyName} has been told.`;
}

export type DecisionInput = {
  versionId: string;
  approverId: string;
  decision: ApprovalDecision;
  channel: Channel;
  /** Required when requesting changes — the UI keeps Send disabled until it exists. */
  comment?: string;
  recordedByName?: string;
};

/**
 * Writes a decision.
 *
 * Everything that follows from a decision happens in one transaction: the
 * record is appended, the open request is closed, reminders stop, the
 * deliverable's status moves, and a revision round is counted where the project
 * counts them.
 */
export async function recordDecision(input: DecisionInput) {
  if (
    input.decision === ApprovalDecision.CHANGES_REQUESTED &&
    !input.comment?.trim()
  ) {
    throw new Error("A comment is required when requesting changes.");
  }

  return db.$transaction(async (tx) => {
    const version = await tx.deliverableVersion.findUniqueOrThrow({
      where: { id: input.versionId },
      include: {
        deliverable: {
          select: {
            id: true,
            name: true,
            clientId: true,
            projectId: true,
            client: { select: { agencyId: true } },
          },
        },
      },
    });

    const approver = await tx.contact.findUniqueOrThrow({
      where: { id: input.approverId },
      select: { id: true, name: true, clientId: true, role: true },
    });

    if (approver.clientId !== version.deliverable.clientId) {
      throw new Error("That contact does not belong to this client.");
    }
    if (approver.role !== "APPROVER") {
      throw new Error("Only the named approver can decide.");
    }

    const decidedAt = new Date();

    const record = await tx.approvalRecord.create({
      data: {
        versionId: version.id,
        approverId: approver.id,
        decision: input.decision,
        channel: input.channel,
        comment: input.comment?.trim() || null,
        recordedByName: input.recordedByName ?? null,
        decidedAt,
      },
    });

    // Reminders stop the moment a decision arrives, from any channel.
    await tx.approvalRequest.updateMany({
      where: { versionId: version.id, state: ApprovalState.WAITING },
      data: {
        state:
          input.decision === ApprovalDecision.APPROVED
            ? ApprovalState.APPROVED
            : ApprovalState.CHANGES_REQUESTED,
        decidedAt,
      },
    });

    await tx.deliverable.update({
      where: { id: version.deliverable.id },
      data: {
        status:
          input.decision === ApprovalDecision.APPROVED
            ? DeliverableStatus.APPROVED
            : DeliverableStatus.IN_REVIEW,
      },
    });

    // Rounds are counted only where the contract said so.
    if (
      input.decision === ApprovalDecision.CHANGES_REQUESTED &&
      version.deliverable.projectId
    ) {
      const project = await tx.project.findUnique({
        where: { id: version.deliverable.projectId },
        select: { id: true, revisionRoundsAllowed: true },
      });
      if (project?.revisionRoundsAllowed != null) {
        await tx.project.update({
          where: { id: project.id },
          data: { revisionRoundsUsed: { increment: 1 } },
        });
      }
    }

    await tx.activityLog.create({
      data: {
        agencyId: version.deliverable.client.agencyId,
        clientId: version.deliverable.clientId,
        actorName: approver.name,
        actorIsClient: true,
        verb:
          input.decision === ApprovalDecision.APPROVED
            ? "approved"
            : "requested changes on",
        objectType: "DeliverableVersion",
        objectId: version.id,
        objectName: `${version.deliverable.name} ${version.label}`,
        detail: input.comment?.trim() || null,
        source:
          input.channel === Channel.WHATSAPP
            ? "WHATSAPP"
            : input.channel === Channel.EMAIL
              ? "EMAIL"
              : "PORTAL",
        visibility: Visibility.CLIENT_VISIBLE,
      },
    });

    return {
      record,
      line: approvalRecordLine({
        decision: input.decision,
        versionLabel: version.label,
        approverName: approver.name,
        decidedAt,
        channel: input.channel,
        recordedByName: input.recordedByName,
      }),
    };
  });
}

/** Raises an approval request against a published version. */
export async function requestApproval(args: {
  versionId: string;
  approverId: string;
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
          client: {
            select: { agencyId: true, agency: { select: { defaultApprovalDays: true } } },
          },
        },
      },
    },
  });

  const dueAt =
    args.dueAt ??
    new Date(
      Date.now() +
        version.deliverable.client.agency.defaultApprovalDays * 86400000,
    );

  const request = await db.approvalRequest.create({
    data: { versionId: version.id, approverId: args.approverId, dueAt },
  });

  await db.deliverable.update({
    where: { id: version.deliverable.id },
    data: { status: DeliverableStatus.IN_REVIEW },
  });

  return { request, dueLabel: formatDate(dueAt) };
}
