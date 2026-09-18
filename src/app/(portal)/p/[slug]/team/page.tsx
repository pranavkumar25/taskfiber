import { portalContext } from "@/server/portal-session";
import { Card } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { RoleTag } from "@/components/ui/pill";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** Team — who does what on this account, on both sides. */
export default async function PortalTeam({ params }: PageProps<"/p/[slug]/team">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const client = await ctx.q.client();

  const [team, contacts] = await Promise.all([
    db.member.findMany({
      where: { agencyId: ctx.viewer.agencyId, role: { not: "LIMITED" } },
      select: { id: true, name: true, discipline: true, role: true },
    }),
    db.contact.findMany({
      where: { clientId: ctx.viewer.clientId },
      select: { id: true, name: true, jobTitle: true, role: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Your team</h1>
      <p className="mt-1.5 text-read text-steel">
        Who is on {client.name} at {client.agency.name}, and who they work with on your side.
      </p>

      <section className="mt-6">
        <h2 className="label-caps">{client.agency.name}</h2>
        <Card className="mt-2 divide-y divide-canvas">
          {team.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.name} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-read text-charcoal">{m.name}</span>
                <span className="block truncate text-meta text-steel">{m.discipline}</span>
              </span>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="label-caps">{client.name}</h2>
        <Card className="mt-2 divide-y divide-canvas">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={c.name} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-read text-charcoal">{c.name}</span>
                <span className="block truncate text-meta text-steel">{c.jobTitle}</span>
              </span>
              <RoleTag>{c.role.toLowerCase()}</RoleTag>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
