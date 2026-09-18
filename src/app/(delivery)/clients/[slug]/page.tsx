import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { accountingHealth, getClientOverview, getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDateShort, formatMoney, formatSince } from "@/server/format";
import { Card, CardHead } from "@/components/ui/surface";
import { StatusPill, RoleTag, SourceBadge } from "@/components/ui/pill";
import { VisibilityTag } from "@/components/ui/visibility";
import { Avatar } from "@/components/ui/avatar";
import { ActivityRow } from "@/components/delivery/activity";

const PROJECT_STATUS: Record<string, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export async function generateMetadata({ params }: PageProps<"/clients/[slug]">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);
  return { title: client.name };
}

/**
 * 6.4 · Client record, Overview.
 *
 * The three things an agency manages, on one page: the work, the contract and
 * the accounts. Each project card is drawn in its visibility state, so what the
 * client can see is legible before you read a word.
 */
export default async function ClientOverviewPage({
  params,
}: PageProps<"/clients/[slug]">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);
  const { projects, contract, finance, activity } = await getClientOverview(client.id);
  const accounting = await accountingHealth(agency.id);

  const base = `/clients/${slug}`;

  return (
    <div className="grid gap-6 px-8 pt-6 pb-24 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section>
          <CardHead
            title="Active projects"
            action={
              <Link href={`${base}/projects`} className="text-meta text-electric hover:underline">
                All projects →
              </Link>
            }
            className="mb-2.5"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => {
              const visible = p.visibility === "CLIENT_VISIBLE";
              const next = p.milestones.find((m) => m.state !== "DONE");
              const publishedCount = p.milestones.filter(
                (m) => m.visibility === "CLIENT_VISIBLE",
              ).length;

              const body = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-item font-medium text-charcoal">{p.name}</span>
                    <StatusPill>{PROJECT_STATUS[p.status]}</StatusPill>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-steel">
                    <span className="rounded-chip bg-canvas px-1.5 py-px capitalize">
                      {p.type.toLowerCase()}
                    </span>
                    {p.startDate && p.endDate ? (
                      <span className="font-mono">
                        {formatDateShort(p.startDate)} – {formatDate(p.endDate)}
                      </span>
                    ) : null}
                    {p.owner ? <span>{p.owner.name}</span> : null}
                  </div>
                  {next ? (
                    <p className="mt-2 text-body text-steel">
                      Next: <span className="font-mono">{formatDateShort(next.date)}</span>{" "}
                      {next.name}
                    </p>
                  ) : null}
                  <p className="mt-2.5 border-t border-canvas pt-2 text-meta text-fog">
                    {visible
                      ? `Client-visible · ${publishedCount} of ${p.milestones.length} milestones published`
                      : "Internal · not yet published"}
                  </p>
                </>
              );

              return visible ? (
                <Link
                  key={p.id}
                  href={`${base}/projects/${p.id}`}
                  className="rounded-card border border-ash bg-surface p-4 shadow-card hover:border-smoke hover:shadow-lift"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={p.id}
                  className="rounded-card border border-dashed border-fog bg-surface p-4"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href={`${base}/contract`} className="block">
            <Card className="h-full p-4 hover:border-smoke hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <span className="text-body font-semibold">Contract</span>
                {contract ? <StatusPill>{contract.status.toLowerCase()}</StatusPill> : null}
              </div>
              {contract ? (
                <>
                  <p className="mt-2 font-mono text-h3 text-charcoal">
                    {formatMoney(Number(contract.annualValue ?? 0), contract.currency)} / year
                  </p>
                  <p className="mt-1 text-meta text-steel">
                    {contract.title}
                    {contract.termStart && contract.termEnd
                      ? ` · ${formatDateShort(contract.termStart)} – ${formatDate(contract.termEnd)}`
                      : ""}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-canvas pt-2 text-meta text-fog">
                    <span>
                      {contract.esignProvider}
                      {contract.signedAt ? ` · signed ${formatDate(contract.signedAt)}` : ""}
                    </span>
                    <VisibilityTag
                      visibility={contract.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-body text-steel">No contract on file.</p>
              )}
            </Card>
          </Link>

          <Link href={`${base}/finance`} className="block">
            <Card className="h-full p-4 hover:border-smoke hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <span className="text-body font-semibold">Finance</span>
                {finance.overdue.length ? (
                  <StatusPill tone="danger">{finance.overdue.length} overdue</StatusPill>
                ) : (
                  <StatusPill tone="success">Up to date</StatusPill>
                )}
              </div>
              <p className="mt-2 font-mono text-h3 text-charcoal">
                {formatMoney(finance.outstanding, client.currency)} outstanding
              </p>
              <p className="mt-1 text-meta text-steel">
                {finance.overdue[0]
                  ? `${finance.overdue[0].number} · due ${formatDateShort(finance.overdue[0].dueAt)}`
                  : "Nothing outstanding"}
                {` · paid on time ${finance.paidOnTime} of ${finance.total}`}
              </p>
              <div className="mt-2.5 flex items-center justify-between border-t border-canvas pt-2 text-meta text-fog">
                <SourceBadge failed={accounting.failing}>
                  {accounting.provider} ·{" "}
                  {accounting.failing
                    ? `sync failed ${formatSince(accounting.syncedAt)}`
                    : `synced ${formatSince(accounting.syncedAt)}`}
                </SourceBadge>
                <span>Billing, approver</span>
              </div>
            </Card>
          </Link>
        </section>

        <section>
          <CardHead
            title="Contacts"
            action={
              <Link href={`${base}/contacts`} className="text-meta text-electric hover:underline">
                Manage →
              </Link>
            }
            className="mb-2.5"
          />
          <Card className="divide-y divide-canvas">
            {client.contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar name={c.name} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-charcoal">
                    {c.name}
                  </span>
                  <span className="block truncate text-meta text-steel">{c.jobTitle}</span>
                </span>
                <RoleTag>{c.role.toLowerCase()}</RoleTag>
                <span className="w-24 shrink-0 text-right font-mono text-meta text-fog">
                  {formatSince(c.lastActiveAt)}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <aside className="min-w-0">
        <CardHead
          title="Recent activity"
          action={
            <Link href={`${base}/activity`} className="text-meta text-electric hover:underline">
              All →
            </Link>
          }
          className="mb-2.5"
        />
        <Card className="px-4 py-1">
          {activity.map((a) => (
            <ActivityRow
              key={a.id}
              item={{
                id: a.id,
                actorName: a.actorName,
                actorIsClient: a.actorIsClient,
                verb: a.verb,
                objectName: a.objectName,
                detail: a.detail,
                source: a.source,
                visibility: a.visibility,
                createdAt: a.createdAt,
              }}
              compact
            />
          ))}
        </Card>
        <p className="mt-2 flex items-center gap-1 text-meta text-fog">
          Every publish and visibility change is recorded <ArrowRight className="size-3" />
        </p>
      </aside>
    </div>
  );
}
