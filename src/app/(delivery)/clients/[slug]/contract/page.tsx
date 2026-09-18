import Link from "next/link";
import { db } from "@/server/db";
import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDateTime, formatMoney } from "@/server/format";
import { nowMs, requestNow } from "@/server/now";
import { Button } from "@/components/ui/button";
import { Card, CardHead } from "@/components/ui/surface";
import { Segmented } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/pill";
import { VisibilityTag } from "@/components/ui/visibility";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "Contract" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  SIGNED: "Signed",
  ACTIVE: "Active",
  EXPIRING: "Expiring",
  EXPIRED: "Expired",
};

/**
 * 6.14 · Client record, Contract.
 *
 * One of the three pillars, and the one v1 of this product missed entirely. The
 * SOW rows are the useful part: they say what they govern and link straight to
 * the work, which is where scope arguments actually get settled.
 */
export default async function ContractTab({ params }: PageProps<"/clients/[slug]/contract">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const contracts = await db.contract.findMany({
    where: { clientId: client.id },
    orderBy: [{ kind: "asc" }, { termStart: "desc" }],
  });

  const main = contracts.find((c) => c.kind !== "SOW");
  const sows = contracts.filter((c) => c.kind === "SOW");

  const projects = await db.project.findMany({
    where: { clientId: client.id },
    select: { id: true, name: true },
  });

  const renewalsSoon = await db.contract.count({
    where: {
      client: { agencyId: agency.id },
      termEnd: { lte: new Date(nowMs() + 90 * 86400000), gte: requestNow() },
    },
  });

  const approver = client.contacts.find((c) => c.role === "APPROVER");

  return (
    <div className="grid gap-6 px-8 pt-6 pb-24 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {main ? (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h3 font-semibold">{main.title}</h2>
              <StatusPill>{STATUS_LABEL[main.status]}</StatusPill>
              <VisibilityTag
                visibility={main.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
              />
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-3 text-body sm:grid-cols-2">
              <Field label="Parties">{main.parties.join(" · ")}</Field>
              <Field label="Value" mono>
                {formatMoney(Number(main.annualValue ?? 0), main.currency)} / year
                {main.monthlyValue
                  ? ` · ${formatMoney(Number(main.monthlyValue), main.currency)} monthly`
                  : ""}
              </Field>
              <Field label="Term" mono>
                {main.termStart ? formatDate(main.termStart) : "—"} –{" "}
                {main.termEnd ? formatDate(main.termEnd) : "—"}
              </Field>
              <Field label="Renewal" mono>
                {main.renewalDate ? formatDate(main.renewalDate) : "—"}
                <span className="text-steel"> · alerts at 90, 60, 30 days</span>
              </Field>
              <Field label="Signed" mono>
                {main.signedAt ? formatDateTime(main.signedAt) : "Not signed"}
              </Field>
              <Field label="E-sign">
                {main.esignProvider}
                {main.esignEnvelopeId ? (
                  <span className="font-mono text-meta text-steel">
                    {" "}
                    · envelope {main.esignEnvelopeId.slice(0, 9)}…
                  </span>
                ) : null}
              </Field>
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button variant="secondary">Open signed PDF</Button>
              <Button variant="secondary">Send amendment for signature</Button>
              <span className="ml-auto font-mono text-meta text-fog">
                Filed to Drive · {main.driveFilePath ?? `${client.name} / Contract`}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="p-5 text-body text-steel">No contract on file for {client.name}.</Card>
        )}

        <section className="mt-6">
          <CardHead title="Statements of work" className="mb-2.5" />
          <Card className="divide-y divide-canvas">
            {sows.map((s) => {
              const governs = projects.find((p) => p.id === s.governsProjectId);
              return (
                <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-charcoal">
                      {s.title}
                    </span>
                    <span className="block truncate text-meta text-steel">
                      {governs ? (
                        <>
                          Governs{" "}
                          <Link
                            href={`/clients/${slug}/projects/${governs.id}`}
                            className="text-electric hover:underline"
                          >
                            {governs.name}
                          </Link>
                        </>
                      ) : (
                        "Not linked to a project"
                      )}
                      {s.signedAt ? ` · signed ${formatDate(s.signedAt)}` : ""}
                    </span>
                  </span>
                  <StatusPill>{STATUS_LABEL[s.status]}</StatusPill>
                  {s.status === "DRAFT" ? (
                    <Button variant="secondary" size="sm">
                      Send for signature
                    </Button>
                  ) : (
                    <VisibilityTag
                      visibility={s.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
                    />
                  )}
                </div>
              );
            })}
            {sows.length === 0 ? (
              <p className="px-4 py-6 text-center text-body text-steel">No SOWs yet.</p>
            ) : null}
          </Card>
        </section>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <Card className="p-4">
          <CardHead title="Send for signature" />
          <div className="mt-3 flex flex-col gap-3 text-body">
            <Field label="Document">
              {sows.find((s) => s.status === "DRAFT")?.title ?? "No draft waiting"}
            </Field>
            <Field label="Signer">
              <span className="flex items-center gap-1.5">
                {approver ? <Avatar name={approver.name} size="xs" /> : null}
                {approver ? `${approver.name} · approver` : "No approver set"}
              </span>
            </Field>
            <div className="flex flex-col gap-1">
              <span className="label-caps">Via</span>
              <Segmented
                value={main?.esignProvider === "Zoho Sign" ? "zoho" : "docusign"}
                options={[
                  { value: "docusign", label: "DocuSign" },
                  { value: "zoho", label: "Zoho Sign" },
                ]}
              />
            </div>
            <Button variant="primary">Send envelope</Button>
            <p className="text-meta text-fog">
              The signed copy files to Drive and appears in the portal automatically.
            </p>
          </div>
        </Card>

        <Link href="/documents/contracts">
          <Card className="p-4 hover:border-smoke hover:shadow-lift">
            <span className="text-body font-semibold text-charcoal">
              Renewals across clients →
            </span>
            <p className="mt-1 text-meta text-steel">
              {renewalsSoon} within the next 90 days
            </p>
          </Card>
        </Link>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="label-caps">{label}</dt>
      <dd className={`mt-0.5 text-charcoal ${mono ? "font-mono text-meta" : ""}`}>{children}</dd>
    </div>
  );
}
