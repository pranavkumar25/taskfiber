import { db } from "@/server/db";
import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { PortalBuilder } from "@/components/delivery/portal-builder";

export const metadata = { title: "Portal" };

/** 6.9 · Client record, Portal — the builder. */
export default async function PortalTab({ params }: PageProps<"/clients/[slug]/portal">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const portal = await db.portalConfig.findUniqueOrThrow({
    where: { clientId: client.id },
    include: {
      modules: { orderBy: { order: "asc" } },
      template: { select: { name: true } },
    },
  });

  const domain = client.agency.customDomain ?? client.agency.portalDomain;

  return (
    <PortalBuilder
      clientSlug={slug}
      clientName={client.name}
      agencyName={client.agency.name}
      portalUrl={`${domain}/${portal.slug}`}
      accentHex={portal.accentHex ?? client.agency.accentHex}
      logoAsset={portal.logoAsset ?? client.agency.logoAsset}
      emailSender={portal.emailSender ?? client.agency.emailSender}
      customDomain={client.agency.customDomain}
      dnsVerified={client.agency.dnsVerified}
      templateName={portal.template?.name ?? null}
      modules={portal.modules.map((m) => ({
        id: m.id,
        key: m.key,
        label: m.label,
        enabled: m.enabled,
        roles: m.roles,
        order: m.order,
      }))}
      contacts={client.contacts.map((c) => ({ id: c.id, name: c.name, role: c.role }))}
    />
  );
}
