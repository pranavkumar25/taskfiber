"use server";

import { revalidatePath } from "next/cache";
import { ApprovalDecision, Channel, Visibility } from "@/generated/prisma/enums";
import { db } from "./db";
import { currentWorkspace } from "./session";
import { publishVersion, setVisibility, unpublishDeliverable } from "./publish";
import { recordDecision, requestApproval } from "./approvals";

/* ---------------------------------------------------------------------------
   Server actions.

   Anything that crosses to a client goes through `publish.ts` or `approvals.ts`
   — these are thin wrappers that resolve the actor and revalidate. None of them
   writes `visibility` directly.
--------------------------------------------------------------------------- */

async function actor() {
  const { member } = await currentWorkspace();
  return { memberId: member.id, name: member.name, canPublish: member.canPublish };
}

function assertCanPublish(a: { canPublish: boolean; name: string }) {
  if (!a.canPublish) {
    throw new Error(`${a.name} does not have permission to publish to clients.`);
  }
}

export async function publishDeliverableAction(input: {
  versionId: string;
  clientSlug: string;
  requestApprovalFrom?: string | null;
  dueAt?: string;
}) {
  const a = await actor();
  assertCanPublish(a);
  const result = await publishVersion({
    versionId: input.versionId,
    actor: a,
    requestApprovalFrom: input.requestApprovalFrom,
    dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
  });
  revalidatePath(`/clients/${input.clientSlug}`, "layout");
  return { toast: result.toast };
}

export async function unpublishDeliverableAction(input: {
  deliverableId: string;
  clientSlug: string;
}) {
  const a = await actor();
  assertCanPublish(a);
  const result = await unpublishDeliverable({ deliverableId: input.deliverableId, actor: a });
  revalidatePath(`/clients/${input.clientSlug}`, "layout");
  return { toast: result.toast };
}

export async function requestApprovalAction(input: {
  versionId: string;
  approverId: string;
  clientSlug: string;
}) {
  const result = await requestApproval({
    versionId: input.versionId,
    approverId: input.approverId,
  });
  revalidatePath(`/clients/${input.clientSlug}`, "layout");
  return { toast: `Approval requested · due ${result.dueLabel}` };
}

export async function setVisibilityAction(input: {
  entity: "project" | "milestone" | "task" | "update" | "comment";
  id: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
  clientSlug: string;
}) {
  const a = await actor();
  if (input.visibility === "CLIENT_VISIBLE") assertCanPublish(a);
  await setVisibility({
    entity: input.entity,
    id: input.id,
    visibility: input.visibility as Visibility,
    actor: a,
  });
  revalidatePath(`/clients/${input.clientSlug}`, "layout");
}

export async function postCommentAction(input: {
  projectId: string;
  body: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
  clientSlug: string;
}) {
  const a = await actor();
  if (!input.body.trim()) throw new Error("A comment needs words.");
  if (input.visibility === "CLIENT_VISIBLE") assertCanPublish(a);

  await db.comment.create({
    data: {
      projectId: input.projectId,
      body: input.body.trim(),
      authorMemberId: a.memberId,
      visibility: input.visibility as Visibility,
    },
  });
  revalidatePath(`/clients/${input.clientSlug}`, "layout");
}

export async function toggleModuleAction(input: {
  moduleId: string;
  enabled: boolean;
  clientSlug: string;
}) {
  await db.portalModule.update({
    where: { id: input.moduleId },
    data: { enabled: input.enabled },
  });
  revalidatePath(`/clients/${input.clientSlug}/portal`);
}

export async function renameModuleAction(input: {
  moduleId: string;
  label: string;
  clientSlug: string;
}) {
  await db.portalModule.update({
    where: { id: input.moduleId },
    data: { label: input.label },
  });
  revalidatePath(`/clients/${input.clientSlug}/portal`);
}

/* --- Client-side decisions, taken from the portal ------------------------ */

export async function decideAction(input: {
  versionId: string;
  approverId: string;
  decision: "APPROVED" | "CHANGES_REQUESTED";
  comment?: string;
  portalSlug: string;
}) {
  const result = await recordDecision({
    versionId: input.versionId,
    approverId: input.approverId,
    decision: input.decision as ApprovalDecision,
    channel: Channel.PORTAL,
    comment: input.comment,
  });
  revalidatePath(`/p/${input.portalSlug}`, "layout");
  return { line: result.line };
}

export async function submitRequestAction(input: {
  clientId: string;
  contactId: string;
  kind: string;
  details: string;
  neededBy?: string;
  portalSlug: string;
}) {
  if (!input.details.trim()) throw new Error("A request needs details.");
  await db.clientRequest.create({
    data: {
      clientId: input.clientId,
      raisedById: input.contactId,
      kind: input.kind,
      details: input.details.trim(),
      neededBy: input.neededBy ? new Date(input.neededBy) : null,
    },
  });
  revalidatePath(`/p/${input.portalSlug}`, "layout");
}
