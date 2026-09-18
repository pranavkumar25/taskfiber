import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { ClientHeader } from "@/components/delivery/client-header";

export default async function ClientRecordLayout({
  children,
  params,
}: LayoutProps<"/clients/[slug]">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client, counts } = await getClientRecord(agency.id, slug);

  const portalUrl = `${client.agency.customDomain ?? client.agency.portalDomain}/${client.portal?.slug ?? client.slug}`;

  return (
    <div>
      <ClientHeader
        client={{
          name: client.name,
          slug: client.slug,
          brandColor: client.brandColor,
          stage: client.stage,
          templateName: client.portal?.template?.name ?? null,
          accountLead: client.accountLead?.name ?? null,
          portalUrl,
          portalSlug: client.portal?.slug ?? client.slug,
        }}
        counts={counts}
      />
      {children}
    </div>
  );
}
