import Link from "next/link";
import { Check } from "lucide-react";
import { db } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { Input, Radio, Select } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { StatusDot } from "@/components/ui/pill";
import { contrastLabel } from "@/lib/color";
import { cn } from "@/lib/utils";

export const metadata = { title: "Create your workspace" };
export const dynamic = "force-dynamic";

const STEPS = ["Workspace", "Vertical", "Drive", "Template"];

const VERTICALS = [
  ["Marketing agency", "Campaign", "Dashboards, campaign calendar, content approvals"],
  ["Design studio", "Project", "Versioned deliverables, annotation, asset library"],
  ["Product agency", "Roadmap and release", "Roadmap timeline, release notes, product metrics"],
  ["Tech agency", "Sprint", "Sprint timeline, build and release deliverables"],
  ["Influencer management", "Campaign and creator", "Creator roster, post deliverables, reach"],
  ["Talent management", "Booking", "Talent roster, booking calendar, contracts"],
] as const;

/**
 * 6.1 · Signup.
 *
 * Four steps, no app shell — an agency has not got a workspace yet, so there is
 * nothing to put a sidebar around. Step 3 is the one that matters: Drive is
 * mapped, not replaced, and the screen promises it in as many words.
 */
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const step = Math.min(4, Math.max(1, Number(sp.step ?? 1) || 1));

  const templates = await db.portalTemplate.findMany({
    where: { isShipped: true },
    include: { modules: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" },
  });
  const marketing = templates.find((t) => t.name === "Marketing agency");
  const accent = "#1F5B3F";
  const contrast = contrastLabel(accent);

  return (
    <div className="mx-auto min-h-screen max-w-180 px-6 py-12">
      <p className="text-body font-semibold text-charcoal">TaskFiber</p>

      <Stepper steps={STEPS} current={step - 1} className="mt-8" />

      <div className="mt-8">
        {step === 1 ? (
          <Section
            title="Create your workspace"
            sub="Your team and brand. Clients never see this screen."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Agency name">
                <Input defaultValue="Fieldnote Media" />
              </Field>
              <Field label="Team size">
                <Select defaultValue="11-25">
                  <option value="2-10">2–10</option>
                  <option value="11-25">11–25</option>
                  <option value="26-50">26–50</option>
                </Select>
              </Field>
              <Field label="Portal domain" full>
                <div className="flex items-center gap-3">
                  <Input defaultValue="portal.fieldnote.media" className="font-mono" />
                  <span className="shrink-0 text-meta text-steel">
                    Custom domain · verify DNS
                  </span>
                </div>
              </Field>
              <Field label="Brand" full>
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-control text-body font-semibold text-white"
                    style={{ background: accent }}
                  >
                    F
                  </span>
                  <Input defaultValue={accent} className="max-w-32 font-mono" />
                  <span
                    className={cn(
                      "text-meta",
                      contrast.passes ? "text-success-fg" : "text-danger-fg",
                    )}
                  >
                    Contrast {contrast.ratio} on white
                  </span>
                </div>
              </Field>
              <Field label="Invite your team" full>
                <div className="flex flex-wrap items-center gap-1.5 rounded-control border border-smoke bg-surface p-2">
                  {[
                    ["meera@fieldnote.media", "Admin"],
                    ["dev@fieldnote.media", "Member"],
                  ].map(([email, role]) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 rounded-chip bg-canvas px-2 py-1 text-meta"
                    >
                      <span className="font-mono text-charcoal">{email}</span>
                      <span className="text-steel">{role}</span>
                    </span>
                  ))}
                  <span className="px-1 text-meta text-fog">Add an email…</span>
                </div>
              </Field>
            </div>
          </Section>
        ) : null}

        {step === 2 ? (
          <Section
            title="What kind of agency are you?"
            sub="This decides which portal templates we offer first. You can use any template later."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VERTICALS.map(([name, unit, blurb], i) => (
                <Card
                  key={name}
                  className={cn(
                    "p-4",
                    i === 0 && "border-electric shadow-[0_0_0_1px_var(--color-electric)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body font-medium text-charcoal">{name}</span>
                    {i === 0 ? (
                      <span className="flex size-4 items-center justify-center rounded-full bg-electric">
                        <Check className="size-2.5 text-white" strokeWidth={3} />
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-meta text-steel">
                    Work unit: <span className="text-charcoal">{unit}</span>
                  </p>
                  <p className="mt-1.5 text-meta text-fog">{blurb}</p>
                </Card>
              ))}
            </div>
          </Section>
        ) : null}

        {step === 3 ? (
          <Section
            title="Connect Google Drive"
            sub="Drive stays where your files live. Map the folder you already use; we do not move or rename anything."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Card className="p-4">
                <div className="flex items-center gap-2 border-b border-canvas pb-3">
                  <StatusDot tone="success" />
                  <span className="font-mono text-meta text-charcoal">arjun@fieldnote.media</span>
                  <span className="ml-auto text-meta text-success-fg">Connected</span>
                </div>
                <ul className="mt-3 flex flex-col gap-0.5 font-mono text-meta">
                  {[
                    ["Fieldnote Media (Shared drive)", 0, null],
                    ["Clients", 1, "Clients root"],
                    ["Kiro Foods", 2, "client"],
                    ["Halden Labs", 2, "client"],
                    ["Sutra Living", 2, "client"],
                    ["_Archive 2024", 2, "skipped"],
                    ["Agency", 1, null],
                    ["Templates", 1, null],
                  ].map(([label, depth, tag]) => (
                    <li
                      key={String(label)}
                      className={cn(
                        "flex items-center gap-2 rounded-chip px-2 py-1",
                        tag === "Clients root" && "bg-electric/6 text-charcoal",
                        tag === "skipped" && "text-fog",
                        !tag && "text-steel",
                      )}
                      style={{ paddingLeft: 8 + Number(depth) * 16 }}
                    >
                      <span className="truncate">{label}</span>
                      {tag ? (
                        <span className="ml-auto shrink-0 rounded-chip bg-canvas px-1.5 text-fog">
                          {tag}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-canvas pt-3 text-meta text-steel">
                  Your existing folder structure is mapped, not replaced.
                </p>
              </Card>

              <div className="flex flex-col gap-4">
                <Card className="p-4">
                  <p className="label-caps">Mapping</p>
                  <dl className="mt-2 flex flex-col gap-2 text-meta">
                    <MapRow k="Clients root">/Fieldnote Media/Clients</MapRow>
                    <MapRow k="Each subfolder">becomes a client · 14 found</MapRow>
                    <MapRow k="Per project">subfolder created on project start</MapRow>
                    <MapRow k="Client uploads">land in /[Client]/From client</MapRow>
                  </dl>
                </Card>
                <Card className="p-4">
                  <p className="label-caps">Sync</p>
                  <div className="mt-2 flex flex-col gap-2 text-body">
                    <label className="flex items-start gap-2">
                      <Radio checked label="Two-way" className="mt-0.5" />
                      <span className="text-charcoal">
                        Two-way
                        <span className="block text-meta text-steel">
                          Files edited in Drive update here within minutes
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <Radio checked={false} label="Publish on demand" className="mt-0.5" />
                      <span className="text-steel">
                        Publish on demand
                        <span className="block text-meta text-fog">
                          We read Drive only when you publish
                        </span>
                      </span>
                    </label>
                  </div>
                </Card>
              </div>
            </div>
          </Section>
        ) : null}

        {step === 4 ? (
          <Section
            title="Pick a portal template"
            sub="Each template sets which modules are on, what they are called, and the shape of the timeline."
          >
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="flex flex-col gap-2">
                {templates.slice(0, 3).map((t, i) => (
                  <Card
                    key={t.id}
                    className={cn("p-3", i === 0 && "border-electric")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-body font-medium text-charcoal">{t.name}</span>
                      {i === 0 ? (
                        <span className="text-meta text-electric">Recommended</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-meta text-steel">
                      {t.workUnit} · {t.modules.filter((m) => m.enabled).length} modules on
                    </p>
                  </Card>
                ))}
                <p className="px-1 text-meta text-fog">
                  Product, tech and talent templates are in the library.
                </p>
              </div>

              <Card className="overflow-hidden">
                <p className="label-caps border-b border-ash px-4 py-2">
                  {marketing?.name} · module list
                </p>
                <ul>
                  {marketing?.modules.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-2.5 border-b border-canvas px-4 py-2 last:border-b-0"
                    >
                      <StatusDot tone={m.enabled ? "success" : "neutral"} />
                      <span className="min-w-0 flex-1 truncate text-body text-charcoal">
                        {m.key.charAt(0) + m.key.slice(1).toLowerCase()}
                      </span>
                      <span className="truncate text-meta text-steel">
                        {m.enabled ? m.label : "Off in this template"}
                      </span>
                      <span className="label-caps w-32 shrink-0 text-right">
                        {m.roles.length === 0 ? "All roles" : m.roles.join(", ").toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Section>
        ) : null}
      </div>

      <footer className="mt-10 flex items-center justify-between gap-3 border-t border-ash pt-5">
        {step > 1 ? (
          <Link href={`?step=${step - 1}`} className={buttonVariants({ variant: "ghost" })}>
            Back
          </Link>
        ) : (
          <span />
        )}
        <span className="text-meta text-steel">Step {step} of 4</span>
        {step < 4 ? (
          <Link href={`?step=${step + 1}`} className={buttonVariants({ variant: "primary" })}>
            {step === 3 ? "Map folders and continue" : "Continue"}
          </Link>
        ) : (
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            Open workspace
          </Link>
        )}
      </footer>
    </div>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-h1 font-semibold">{title}</h1>
      <p className="mt-1.5 max-w-xl text-read text-steel">{sub}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <span className="label-caps">{label}</span>
      {children}
    </label>
  );
}

function MapRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
      <dt className="text-steel">{k}</dt>
      <dd className="font-mono break-all text-charcoal">{children}</dd>
    </div>
  );
}
