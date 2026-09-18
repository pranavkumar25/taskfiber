import { notFound } from "next/navigation";
import { Upload } from "lucide-react";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { Button } from "@/components/ui/button";
import { Card, CardHead } from "@/components/ui/surface";
import { Radio, Toggle } from "@/components/ui/field";
import { InternalTag } from "@/components/ui/visibility";
import { Banner } from "@/components/ui/feedback";
import { BrandMark } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

type Metric = { label: string; value: string; delta?: string };

/**
 * 6.16 · Report builder.
 *
 * A document, not a dashboard — a client forwards this to their board. Every
 * section carries a provenance caption naming what it was drafted from, so an
 * account lead can check the machine's work before a word of it goes out.
 */
export default async function ReportPage({
  params,
}: PageProps<"/reports/[slug]/[period]">) {
  const { slug, period } = await params;
  const { agency } = await currentWorkspace();

  const report = await db.report.findFirst({
    where: { period, client: { slug, agencyId: agency.id } },
    include: {
      sections: { orderBy: { order: "asc" } },
      client: {
        select: {
          name: true,
          brandColor: true,
          contacts: { select: { id: true, name: true, role: true } },
          agency: { select: { name: true, accentHex: true, portalDomain: true } },
        },
      },
    },
  });
  if (!report) notFound();

  const recipients = report.client.contacts.filter((c) => c.role !== "BILLING");

  return (
    <div className="grid gap-6 px-8 pt-8 pb-24 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <Banner tone="info" className="mb-4" action={<InternalTag />}>
          Draft from{" "}
          <span className="font-medium">{report.sourceActivityCount} activity items</span> and{" "}
          <span className="font-medium">{report.sourceNames.length} connected sources</span>.
          Review before publishing.
        </Banner>

        <article className="mx-auto max-w-190 rounded-card border border-ash bg-surface px-12 py-10 shadow-card">
          <header className="flex items-center justify-between gap-3 border-b border-canvas pb-4">
            <span className="flex items-center gap-2">
              <BrandMark
                name={report.client.agency.name}
                color={report.client.agency.accentHex}
                size="md"
              />
              <span className="text-body text-steel">
                {report.client.agency.name} · for {report.client.name}
              </span>
            </span>
            <span className="font-mono text-meta text-steel">{report.title.split(" ").pop()}</span>
          </header>

          <h1 className="mt-6 text-display font-semibold">{report.title}</h1>

          {report.sections.map((s) => (
            <section key={s.id} className="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="min-w-0 sm:order-1">
                <h2 className="label-caps">{s.heading}</h2>
                {s.body ? (
                  <div className="mt-2 flex flex-col gap-2 text-read leading-relaxed text-charcoal">
                    {s.body.split("\n").map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
                {Array.isArray(s.metrics) ? (
                  <div
                    className="mt-3 grid gap-px overflow-hidden rounded-card border border-ash bg-ash"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
                  >
                    {(s.metrics as unknown as Metric[]).map((m) => (
                      <div key={m.label} className="bg-surface p-3">
                        <p className="text-meta text-steel">{m.label}</p>
                        <p className="mt-0.5 font-mono text-h3 font-medium text-charcoal">
                          {m.value}
                        </p>
                        {m.delta ? (
                          <p className="text-meta text-success-fg">{m.delta}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {s.provenance ? (
                <p className="text-meta text-fog sm:order-2 sm:text-right">{s.provenance}</p>
              ) : null}
            </section>
          ))}
        </article>
      </div>

      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-16 lg:self-start">
        <Card className="p-4">
          <CardHead title="Publish" />
          <p className="mt-2 text-body text-steel">
            Publishing makes this report visible to {recipients.length} contacts at{" "}
            {report.client.name} and sends it by email.
          </p>
          <Button variant="primary" className="mt-3 w-full">
            <Upload className="size-3.5" strokeWidth={2} />
            Publish to client
          </Button>
          <Button variant="secondary" className="mt-2 w-full">
            Export PDF
          </Button>
        </Card>

        <Card className="p-4">
          <CardHead title="Schedule" />
          <div className="mt-3 flex items-center justify-between gap-2 text-body">
            <span className="text-charcoal">{report.scheduleCadence ?? "Not scheduled"}</span>
            <Toggle checked={report.scheduleEnabled} label="Schedule this report" />
          </div>

          <div className="mt-3 flex flex-col gap-2 text-body">
            <label className="flex items-center gap-2">
              <Radio checked={report.scheduleDraftFirst} label="Draft for my review first" />
              <span className="text-charcoal">Draft for my review first</span>
            </label>
            <label className="flex items-center gap-2">
              <Radio checked={!report.scheduleDraftFirst} label="Send directly" />
              <span className="text-steel">Send directly</span>
            </label>
          </div>

          <div className="mt-3 border-t border-canvas pt-3">
            <p className="label-caps">Recipients</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {recipients.map((c) => (
                <span
                  key={c.id}
                  className="rounded-chip border border-ash bg-surface px-2 py-0.5 text-meta text-charcoal"
                >
                  {c.name}
                </span>
              ))}
              <span className="rounded-chip border border-dashed border-smoke px-2 py-0.5 text-meta text-steel">
                + Add
              </span>
            </div>
          </div>

          {report.permanentSlug ? (
            <div className="mt-3 border-t border-canvas pt-3">
              <p className="label-caps">Permanent link</p>
              <p className="mt-1 font-mono text-meta break-all text-steel">
                {report.client.agency.portalDomain}/{slug}/r/{period}
              </p>
            </div>
          ) : null}
        </Card>
      </aside>
    </div>
  );
}
