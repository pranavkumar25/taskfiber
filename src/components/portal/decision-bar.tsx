"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { decideAction } from "@/server/actions";

/**
 * 6.23 · Approve, or request changes.
 *
 * Approve is one tap: no modal, no second confirm, no undo. It writes the
 * record and shows exactly one confirmation.
 *
 * Request changes opens an inline card, not a dialog, and Send stays disabled
 * until the comment has words — a change request with no words is not a change
 * request. Send is neutral dark rather than accent, because approve owns the
 * accent on this screen and the two should never be confusable.
 */
export function DecisionBar({
  versionId,
  versionLabel,
  approverId,
  approverName,
  agencyName,
  portalSlug,
  canApprove,
  alreadyDecided,
}: {
  versionId: string;
  versionLabel: string;
  approverId: string | null;
  approverName: string | null;
  agencyName: string;
  portalSlug: string;
  canApprove: boolean;
  alreadyDecided: string | null;
}) {
  const router = useRouter();
  const [changesOpen, setChangesOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [confirmed, setConfirmed] = React.useState<string | null>(alreadyDecided);
  const [pending, startTransition] = React.useTransition();

  const ready = text.trim().length > 0;

  function decide(decision: "APPROVED" | "CHANGES_REQUESTED") {
    if (!approverId) return;
    startTransition(async () => {
      const r = await decideAction({
        versionId,
        approverId,
        decision,
        comment: decision === "CHANGES_REQUESTED" ? text : undefined,
        portalSlug,
      });
      setConfirmed(r.line);
      setChangesOpen(false);
      setText("");
      router.refresh();
    });
  }

  if (confirmed) {
    return (
      <div className="animate-enter flex items-start gap-2.5 rounded-lg border border-success/25 bg-success-tint px-3.5 py-3">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success">
          <Check className="size-3 text-white" strokeWidth={3} aria-hidden />
        </span>
        <span className="min-w-0 text-item">
          <span className="font-medium text-charcoal">
            {confirmed.startsWith("Approved") ? "Approved." : "Sent."}
          </span>{" "}
          <span className="font-mono text-body text-steel">{confirmed}</span>
        </span>
      </div>
    );
  }

  if (!canApprove) {
    return (
      <p className="rounded-lg bg-canvas px-3.5 py-3 text-body text-steel">
        You can view this deliverable.{" "}
        <span className="font-medium text-charcoal">
          Approval is with {approverName ?? "your approver"}.
        </span>
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          size="lg"
          disabled={pending}
          onClick={() => setChangesOpen((o) => !o)}
        >
          Request changes
        </Button>
        <Button variant="accent" size="lg" disabled={pending} onClick={() => decide("APPROVED")}>
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          Approve {versionLabel}
        </Button>
      </div>

      {!changesOpen ? (
        <p className="mt-2 text-right text-body text-steel">
          Approving marks {versionLabel} as signed off for {agencyName} and records your name and
          the time.
        </p>
      ) : null}

      {changesOpen ? (
        <div className="animate-enter mt-3 rounded-card border border-ash bg-surface p-4 shadow-card">
          <p className="text-item font-medium text-charcoal">
            What should change in {versionLabel}?
          </p>
          <Textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Be specific. ${agencyName} will see this on the deliverable.`}
            className="mt-2.5 min-h-22"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="mr-auto text-body text-fog">A comment is required.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChangesOpen(false);
                setText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="neutral"
              size="sm"
              disabled={!ready || pending}
              onClick={() => decide("CHANGES_REQUESTED")}
            >
              Send request
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
