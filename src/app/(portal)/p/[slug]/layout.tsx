import { portalContext, portalNav } from "@/server/portal-session";
import { PortalChrome } from "@/components/portal/chrome";
import { ToastProvider } from "@/components/ui/toaster";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children, params }: LayoutProps<"/p/[slug]">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, nav] = await Promise.all([ctx.q.client(), portalNav(ctx)]);

  const team = await db.member.findMany({
    where: { agencyId: ctx.viewer.agencyId, role: { not: "LIMITED" } },
    select: { name: true, discipline: true },
    take: 4,
  });

  return (
    <PortalChrome
      slug={slug}
      agency={{
        name: client.agency.name,
        accentHex: client.agency.accentHex,
        domain: client.agency.customDomain ?? client.agency.portalDomain,
      }}
      client={{ name: client.name }}
      contact={{ name: ctx.contact.name, role: ctx.contact.role }}
      team={team.map((t) => ({ name: t.name, role: t.discipline ?? "" }))}
      nav={nav.map((n) => ({ key: n.key, label: n.label, href: n.href }))}
      preview={ctx.preview}
    >
      <ToastProvider>{children}</ToastProvider>
    </PortalChrome>
  );
}
