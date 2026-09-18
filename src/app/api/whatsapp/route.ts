import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { decisionReceipt } from "@/server/channels";
import { recordDecision } from "@/server/approvals";

/**
 * The WhatsApp inbound webhook.
 *
 * A quick reply is a decision. It writes the same immutable record the portal
 * writes, with `channel = WHATSAPP`, and the receipt echoed back uses the same
 * sentence — which is the whole point: a client who approves from their phone
 * gets exactly what they would have got from the portal.
 *
 * Requesting changes over WhatsApp needs the words, so a bare "2" asks for them
 * rather than filing an empty change request.
 */
export async function POST(req: NextRequest) {
  const { from, text } = (await req.json()) as { from?: string; text?: string };
  if (!from || !text) {
    return NextResponse.json({ error: "from and text are required" }, { status: 400 });
  }

  const contact = await db.contact.findFirst({
    where: { phone: from },
    include: { client: { select: { agency: { select: { name: true } } } } },
  });
  if (!contact) return NextResponse.json({ error: "Unknown sender" }, { status: 404 });

  const waiting = await db.approvalRequest.findFirst({
    where: { approverId: contact.id, state: "WAITING" },
    orderBy: { dueAt: "asc" },
    include: { version: { select: { id: true, label: true } } },
  });
  if (!waiting) return NextResponse.json({ reply: "Nothing is waiting on you right now." });

  const normalised = text.trim().toLowerCase();
  const approves = normalised === "1" || normalised.startsWith("✓") || normalised.startsWith("approve");
  const changes = normalised === "2" || normalised.startsWith("request changes");

  if (!approves && !changes) {
    return NextResponse.json({
      reply: `Reply 1 to approve ${waiting.version.label}, or 2 to request changes.`,
    });
  }

  // A change request with no words is not a change request.
  const comment = changes ? text.replace(/^(2|request changes)[\s:,-]*/i, "").trim() : undefined;
  if (changes && !comment) {
    return NextResponse.json({
      reply: `What should change in ${waiting.version.label}? Reply with the details and ${contact.client.agency.name} will see it on the deliverable.`,
    });
  }

  const { line } = await recordDecision({
    versionId: waiting.version.id,
    approverId: contact.id,
    decision: approves ? "APPROVED" : "CHANGES_REQUESTED",
    channel: "WHATSAPP",
    comment,
  });

  return NextResponse.json({ reply: decisionReceipt(line, contact.client.agency.name) });
}
