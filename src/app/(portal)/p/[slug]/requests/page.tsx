import { portalContext } from "@/server/portal-session";
import { RequestForm } from "@/components/portal/request-form";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const TYPES_BY_VERTICAL: Record<string, string[]> = {
  MARKETING: ["Creative change", "New campaign", "Report question", "Something else"],
  DESIGN: ["Design change", "New asset", "Question", "Something else"],
  PRODUCT: ["Scope question", "New request", "Question", "Something else"],
  TECH: ["Bug", "New request", "Question", "Something else"],
  INFLUENCER: ["Add a creator", "Content change", "Question", "Something else"],
  TALENT: ["New booking", "Change a booking", "Question", "Something else"],
};

/** 6.28 · New request — a structured ask, not an email into a void. */
export default async function PortalRequests({ params }: PageProps<"/p/[slug]/requests">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const client = await ctx.q.client();

  const open = await db.clientRequest.findMany({
    where: { clientId: ctx.viewer.clientId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">New request</h1>
      <p className="mt-1.5 text-read text-steel">
        Goes straight to {client.agency.name} as a tracked item. You will see its status here.
      </p>

      <RequestForm
        clientId={ctx.viewer.clientId}
        contactId={ctx.viewer.contactId}
        contactName={ctx.contact.name}
        portalSlug={slug}
        agencyName={client.agency.name}
        types={TYPES_BY_VERTICAL[client.vertical] ?? TYPES_BY_VERTICAL.MARKETING}
        existing={open.map((r) => ({
          id: r.id,
          kind: r.kind,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
