"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { Input, Textarea } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/pill";
import { submitRequestAction } from "@/server/actions";
import { cn } from "@/lib/utils";

/**
 * 6.28 · The request form.
 *
 * Structured rather than free-form, so the thing that lands on the delivery
 * side is already a tracked item with a type and a date rather than a paragraph
 * someone has to triage.
 */
export function RequestForm({
  clientId,
  contactId,
  contactName,
  portalSlug,
  agencyName,
  types,
  existing,
}: {
  clientId: string;
  contactId: string;
  contactName: string;
  portalSlug: string;
  agencyName: string;
  types: string[];
  existing: { id: string; kind: string; details: string; status: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = React.useState(types[0]);
  const [details, setDetails] = React.useState("");
  const [neededBy, setNeededBy] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const ready = details.trim().length > 0;

  function submit() {
    if (!ready) return;
    startTransition(async () => {
      await submitRequestAction({
        clientId,
        contactId,
        kind,
        details,
        neededBy: neededBy || undefined,
        portalSlug,
      });
      setDetails("");
      setNeededBy("");
      setSent(true);
      router.refresh();
    });
  }

  return (
    <>
      {sent ? (
        <div className="animate-enter mt-5 rounded-lg border border-success/25 bg-success-tint px-4 py-3 text-item">
          <span className="font-medium text-charcoal">Sent.</span>{" "}
          <span className="text-steel">
            {agencyName} has it, and its status will show below.
          </span>
        </div>
      ) : null}

      <Card className="mt-5 p-5">
        <fieldset>
          <legend className="text-item font-medium text-charcoal">
            What kind of request?
          </legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={kind === t}
                onClick={() => setKind(t)}
                className={cn(
                  "h-8 rounded-full border px-3 text-body",
                  kind === t
                    ? "border-accent bg-surface text-charcoal shadow-[inset_0_0_0_1px_var(--accent)]"
                    : "border-smoke bg-surface text-steel hover:text-charcoal",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block">
          <span className="text-item font-medium text-charcoal">Details</span>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={`Tell ${agencyName} what you need.`}
            className="mt-2 min-h-24"
          />
        </label>

        <div
          className="mt-4 grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          <label className="block">
            <span className="text-item font-medium text-charcoal">Needed by</span>
            <Input
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              className="mt-2 font-mono"
            />
          </label>

          <div>
            <span className="text-item font-medium text-charcoal">Files</span>
            <div className="mt-2 flex h-8 items-center gap-2 rounded-control border border-dashed border-smoke px-3 text-body text-steel">
              <Paperclip className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              Add files · saved to your shared folder
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-canvas pt-4">
          <p className="text-body text-steel">
            Submitting as {contactName}.{" "}
            <span className="font-medium text-charcoal">No account needed.</span>
          </p>
          <Button variant="accent" size="lg" disabled={!ready || pending} onClick={submit}>
            Send request
          </Button>
        </div>
      </Card>

      {existing.length ? (
        <section className="mt-8">
          <h2 className="text-h2 font-semibold">Your requests</h2>
          <Card className="mt-2.5 divide-y divide-canvas">
            {existing.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-read text-charcoal">{r.details}</span>
                  <span className="block truncate text-meta text-steel">{r.kind}</span>
                </span>
                <StatusPill tone={r.status === "DONE" ? "success" : "info"}>
                  {r.status === "NEW"
                    ? "Received"
                    : r.status === "IN_PROGRESS"
                      ? "In progress"
                      : "Done"}
                </StatusPill>
              </div>
            ))}
          </Card>
        </section>
      ) : null}
    </>
  );
}
