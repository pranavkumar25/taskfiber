import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatSince } from "@/server/format";
import { db } from "@/server/db";
import { Button } from "@/components/ui/button";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { RoleTag } from "@/components/ui/pill";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "Contacts" };

const COLS = "minmax(0,1.6fr) minmax(0,1.4fr) 120px minmax(0,1.6fr) minmax(0,1.4fr) 100px";

const CADENCE: Record<string, string> = {
  immediate: "immediate",
  daily: "daily",
  weekly: "weekly digest",
  invoices: "invoices only",
};

/**
 * Client record · Contacts.
 *
 * The "Sees" column is the one that matters: it spells out, per person, which
 * modules their role opens. Module visibility follows role, and this is where an
 * account lead checks it before sending a link.
 */
export default async function ContactsTab({ params }: PageProps<"/clients/[slug]/contacts">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const modules = await db.portalModule.findMany({
    where: { portal: { clientId: client.id }, enabled: true },
    orderBy: { order: "asc" },
  });

  function sees(role: string) {
    const open = modules.filter((m) => m.roles.length === 0 || m.roles.includes(role as never));
    const withheld = modules.filter((m) => m.roles.length > 0 && !m.roles.includes(role as never));
    if (withheld.length === 0) return `All ${open.length} modules`;
    return `${open.length} modules · not ${withheld.map((m) => m.label).join(", ")}`;
  }

  return (
    <div className="px-8 pt-6 pb-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-h3 font-semibold">Contacts · {client.contacts.length}</h2>
        <Button variant="secondary">Add contact</Button>
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Contact</span>
          <span>Email</span>
          <span>Role</span>
          <span>Sees</span>
          <span>Notifications</span>
          <span>Last active</span>
        </TableHeader>
        {client.contacts.map((c) => (
          <TableRow key={c.id} cols={COLS}>
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={c.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-charcoal">{c.name}</span>
                <span className="block truncate text-meta text-steel">{c.jobTitle}</span>
              </span>
            </span>
            <span className="truncate font-mono text-meta text-steel">{c.email}</span>
            <RoleTag>{c.role.toLowerCase()}</RoleTag>
            <span className="truncate text-meta text-steel">{sees(c.role)}</span>
            <span className="truncate text-meta text-steel capitalize">
              {c.notifyChannel} · {CADENCE[c.notifyCadence] ?? c.notifyCadence}
            </span>
            <span className="font-mono text-meta text-fog">{formatSince(c.lastActiveAt)}</span>
          </TableRow>
        ))}
      </DataTable>

      <p className="mt-3 text-meta text-steel">
        Each contact gets a personal magic link — no passwords, ever. Module visibility follows
        role; adjust it in the Portal tab.
      </p>
    </div>
  );
}
