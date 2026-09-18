import Link from "next/link";
import { Check } from "lucide-react";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDateTime } from "@/server/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHead } from "@/components/ui/surface";
import { BrandMark } from "@/components/ui/avatar";
import { StagePill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "New client" };
export const dynamic = "force-dynamic";

/**
 * 6.11 · Client onboarding checklist and intake.
 *
 * A repeatable run, so client eleven takes as long as client one. The last step
 * is sending the portal link, and the screen is explicit that nothing is visible
 * to the client until it happens.
 */
export default async function OnboardingPage() {
  const { agency } = await currentWorkspace();

  const client = await db.client.findFirst({
    where: { agencyId: agency.id, stage: "ONBOARDING" },
    include: {
      onboarding: { include: { steps: { orderBy: { order: "asc" } } } },
      contacts: true,
    },
  });

  if (!client?.onboarding) {
    return (
      <div className="px-8 pt-8 pb-24">
        <h1 className="text-h1 font-semibold">New client</h1>
        <p className="mt-2 max-w-md text-body text-steel">
          No client is mid-onboarding. Start one from a won deal on the{" "}
          <Link href="/pipeline" className="text-electric hover:underline">
            pipeline
          </Link>
          , or add one by hand.
        </p>
      </div>
    );
  }

  const steps = client.onboarding.steps;
  const done = steps.filter((s) => s.state === "DONE").length;

  const intakeFields = [
    ["text", "Brand positioning in one line", null],
    ["choice", "Primary channel: Meta · Google · Both", null],
    ["text", "Monthly media budget (₹)", null],
    ["file", "Brand guidelines and logo files", "Drive"],
    ["contact", "Who approves creative?", "Approver"],
    ["contact", "Who receives invoices?", "Billing"],
  ] as const;

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="flex flex-wrap items-center gap-3">
        <BrandMark name={client.name} color={client.brandColor} size="xl" />
        <h1 className="text-h2 font-semibold">{client.name}</h1>
        <StagePill stage="onboarding" />
      </div>
      <p className="mt-1.5 text-meta text-steel">
        {client.onboarding.sourceDealId
          ? `From the CRM deal “${client.onboarding.sourceDealId}” · `
          : ""}
        {client.onboarding.templateName} template ·{" "}
        <span className="font-medium text-charcoal">
          {done} of {steps.length} steps done
        </span>
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          {steps.map((s) => {
            const current = s.state === "IN_PROGRESS";
            return (
              <div
                key={s.id}
                className={cn(
                  "grid grid-cols-[24px_minmax(0,2fr)_120px_110px_160px] items-center gap-3 border-b border-canvas px-4 py-3 last:border-b-0",
                  current && "bg-electric/5",
                )}
              >
                <span
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold",
                    s.state === "DONE" && "bg-charcoal text-white",
                    current && "border-[1.5px] border-electric text-electric",
                    s.state === "NOT_STARTED" && "border-[1.5px] border-smoke text-steel",
                  )}
                >
                  {s.state === "DONE" ? <Check className="size-2.5" strokeWidth={3} /> : s.order}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-charcoal">
                    {s.name}
                  </span>
                  <span className="block truncate text-meta text-steel">{s.detail}</span>
                </span>
                <span className="truncate text-meta text-steel">{s.ownerName}</span>
                <span className="font-mono text-meta text-fog">
                  {s.completedAt
                    ? formatDateTime(s.completedAt)
                    : s.scheduledAt
                      ? formatDateTime(s.scheduledAt)
                      : current
                        ? "In progress"
                        : "Not started"}
                </span>
                <span className="text-right">
                  {current ? (
                    <Link
                      href={`/clients/${client.slug}/portal`}
                      className={buttonVariants({ variant: "primary", size: "sm" })}
                    >
                      {s.actionLabel}
                    </Link>
                  ) : (
                    <span className="text-meta text-fog">{s.actionLabel}</span>
                  )}
                </span>
              </div>
            );
          })}
        </Card>

        <aside>
          <Card className="p-4">
            <CardHead title="Intake questionnaire" />
            <p className="mt-0.5 text-meta text-steel">
              {intakeFields.length} fields · {client.onboarding.templateName}
            </p>

            <ul className="mt-3 flex flex-col gap-2">
              {intakeFields.map(([type, label, mapsTo]) => (
                <li key={label} className="flex items-center gap-2 text-body">
                  <span className="shrink-0 rounded-chip bg-canvas px-1.5 font-mono text-meta text-steel">
                    {type}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-charcoal">{label}</span>
                  {mapsTo ? (
                    <span className="shrink-0 text-meta text-electric">→ {mapsTo}</span>
                  ) : null}
                </li>
              ))}
              <li className="rounded-control border border-dashed border-smoke px-2 py-1.5 text-center text-meta text-steel">
                + Add field · text, choice, file, contact
              </li>
            </ul>

            <div className="mt-4 border-t border-canvas pt-3">
              <p className="font-mono text-meta break-all text-steel">
                {agency.portalDomain}/i/{client.slug}-9f2c
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="primary" size="sm">
                  Send link
                </Button>
                <Button variant="secondary" size="sm">
                  Copy
                </Button>
              </div>
              <p className="mt-2 text-meta text-fog">
                Answers populate the client record. No client account needed.
              </p>
            </div>
          </Card>

          <p className="mt-3 rounded-control border border-warning/30 bg-warning/6 px-3 py-2.5 text-body text-warning-fg">
            Sending the portal link is the last step. Nothing is visible to{" "}
            {client.contacts[0]?.name ?? "the client"} until you do.
          </p>
        </aside>
      </div>
    </div>
  );
}
