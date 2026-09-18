import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatSince } from "@/server/format";
import { Button } from "@/components/ui/button";
import { Card, CardHead, DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { RoleTag } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "Team and permissions" };
export const dynamic = "force-dynamic";

const COLS = "minmax(0,1.8fr) 100px minmax(0,2fr) 110px";

/**
 * 6.18 · Team and permissions.
 *
 * Agencies use freelancers, so scoping is not optional — and `canPublish` is
 * deliberately separate from role: a Member who can do the work is not
 * necessarily the person who decides what a client sees.
 */
export default async function TeamPage() {
  const { agency } = await currentWorkspace();

  const [members, clients] = await Promise.all([
    db.member.findMany({ where: { agencyId: agency.id }, orderBy: { role: "asc" } }),
    db.client.findMany({ where: { agencyId: agency.id }, select: { id: true, name: true } }),
  ]);

  const nameFor = (id: string) => clients.find((c) => c.id === id)?.name ?? "a client";

  return (
    <div className="grid gap-6 px-8 pt-8 pb-24 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-h1 font-semibold">Team and permissions</h1>
          <Button variant="primary">Invite</Button>
        </div>

        <DataTable>
          <TableHeader cols={COLS}>
            <span>Member</span>
            <span>Role</span>
            <span>Scope</span>
            <span>Last active</span>
          </TableHeader>
          {members.map((m) => (
            <TableRow key={m.id} cols={COLS} tall>
              <span className="flex min-w-0 items-center gap-2.5">
                <Avatar
                  name={m.name}
                  size="md"
                  className={cn(m.isFreelance && "border border-dashed border-smoke")}
                />
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-charcoal">
                    {m.name}
                    {m.isFreelance ? (
                      <span className="text-steel"> · freelance</span>
                    ) : null}
                  </span>
                  <span className="block truncate font-mono text-meta text-fog">{m.email}</span>
                </span>
              </span>
              <RoleTag>{m.role.toLowerCase()}</RoleTag>
              <span className="min-w-0 text-meta text-steel">
                <span className="block truncate">
                  {m.scopedClientIds.length === 0
                    ? "All clients"
                    : m.scopedClientIds.map(nameFor).join(", ")}
                </span>
                <span className="block truncate">
                  {m.canSeeFinance ? "" : "No finance · "}
                  {m.canPublish ? "Can publish" : "Cannot publish"}
                </span>
              </span>
              <span className="font-mono text-meta text-fog">{formatSince(m.lastActiveAt)}</span>
            </TableRow>
          ))}
        </DataTable>

        <p className="mt-3 text-meta text-steel">
          Publishing is a separate permission from role. Anyone without it can do the work and
          still not decide what crosses to a client.
        </p>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <Card className="p-4">
          <CardHead title="White-label" />
          <dl className="mt-3 flex flex-col gap-2.5 text-body">
            <Row label="Portal domain">
              <span className="font-mono text-meta">
                {agency.customDomain ?? agency.portalDomain}
              </span>
            </Row>
            <Row label="DNS">
              <span className="text-meta text-success-fg">Verified</span>
            </Row>
            <Row label="Email sender">
              <span className="truncate font-mono text-meta">portal@{agency.slug}.media</span>
            </Row>
            <Row label="Powered by">
              <span className="text-meta text-steel">Off · {agency.plan} plan</span>
            </Row>
          </dl>
        </Card>

        <Card className="p-4">
          <CardHead title="Data export" />
          <p className="mt-2 text-body text-steel">
            Full export of clients, projects, deliverables, documents and comments.{" "}
            <span className="font-medium text-charcoal">Files stay in your Drive.</span>
          </p>
          <Button variant="secondary" className="mt-3 w-full">
            Export workspace (.zip + .csv)
          </Button>
          <p className="mt-2 font-mono text-meta text-fog">
            Last export {formatDate(new Date(2026, 7, 1))} · 214 MB
          </p>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
      <dt className="text-meta text-steel">{label}</dt>
      <dd className="min-w-0 text-charcoal">{children}</dd>
    </div>
  );
}
