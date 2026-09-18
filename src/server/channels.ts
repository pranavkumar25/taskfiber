import { formatDate, formatMoney } from "./format";

/* ---------------------------------------------------------------------------
   6.30 · WhatsApp.

   Three Meta-approved templates. These builders are the single source of the
   copy — the preview screen renders exactly what the sender sends, so nobody
   ships a template that reads differently in production.

   Two rules the send path must honour:
   - A quick-reply decision writes an approval record with channel = WhatsApp,
     using the same record grammar as the portal.
   - Reminders stop the moment a payment webhook or a decision arrives.
--------------------------------------------------------------------------- */

export type WhatsAppTemplate = {
  key: "update" | "approval" | "payment" | "payment_reminder";
  title: string;
  body: string;
  /** Rendered as full-width reply buttons under the bubble. */
  quickReplies?: string[];
  cta?: { label: string; url: string };
  /** A mono detail block, for anything a person may need to quote back. */
  detail?: string[];
  trustLine?: string;
};

export function updateTemplate(p: {
  agency: string;
  client: string;
  contactFirstName: string;
  author: string;
  updateTitle: string;
  body: string;
  portalUrl: string;
}): WhatsAppTemplate {
  return {
    key: "update",
    title: `Update from ${p.agency} · ${p.client}`,
    body: `Hi ${p.contactFirstName}, ${p.author} posted *${p.updateTitle}*. ${p.body}`,
    cta: { label: "Read the update", url: p.portalUrl },
  };
}

export function approvalTemplate(p: {
  contactFirstName: string;
  deliverable: string;
  version: string;
  whatChanged: string;
  dueLabel: string;
}): WhatsAppTemplate {
  return {
    key: "approval",
    title: `Approval needed · due ${p.dueLabel}`,
    body:
      `*${p.deliverable} ${p.version}* is ready. ${p.whatChanged} ` +
      `*Reply 1 to approve or 2 to request changes; either is recorded in your portal.*`,
    quickReplies: [`✓ Approve ${p.version}`, "Request changes", "Preview the set"],
  };
}

export function paymentTemplate(p: {
  contactFirstName: string;
  client: string;
  number: string;
  amount: number;
  currency: string;
  dueAt: Date;
  gstin: string | null;
  upiHandle: string;
  invoiceUrl: string;
}): WhatsAppTemplate {
  const amount = formatMoney(p.amount, p.currency);
  return {
    key: "payment",
    title: `Invoice due today · ${p.client}`,
    body:
      `Hi ${p.contactFirstName}, invoice *${p.number}* for *${amount}* is due today. ` +
      `Pay by UPI or card from the link below; the receipt comes back here and by email.`,
    detail: [
      `${p.number} · ${amount}`,
      `Due ${formatDate(p.dueAt)}${p.gstin ? ` · GSTIN ${p.gstin}` : ""}`,
    ],
    cta: { label: `Pay ${amount} with UPI`, url: p.invoiceUrl },
    trustLine: `upi://pay?pa=${p.upiHandle}&am=${Math.round(p.amount)}&tn=${p.number} · Razorpay · secured`,
  };
}

export function paymentReminderTemplate(p: {
  number: string;
  amount: number;
  currency: string;
  dueAt: Date;
  daysOverdue: number;
  accountingTool: string;
}): WhatsAppTemplate {
  const amount = formatMoney(p.amount, p.currency);
  return {
    key: "payment_reminder",
    title: `Reminder · ${p.daysOverdue} days overdue`,
    body:
      `${p.number} (${amount}) was due ${formatDate(p.dueAt)}. ` +
      `If it has already been paid, ignore this; ${p.accountingTool} may take a few hours to reflect it.`,
    cta: { label: `Pay ${amount} with UPI`, url: "#" },
  };
}

/** The receipt echoed back after a quick-reply decision. */
export function decisionReceipt(recordLine: string, agency: string) {
  return `Recorded: ${recordLine} ${agency} has been told.`;
}
