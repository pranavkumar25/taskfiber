import Link from "next/link";
import { portalContext } from "@/server/portal-session";
import { formatDateTime } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** 6.27 · Updates — the running record of what the agency has said. */
export default async function PortalUpdates({ params }: PageProps<"/p/[slug]/updates">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, updates, requestsModule] = await Promise.all([
    ctx.q.client(),
    ctx.q.updates(),
    db.portalModule.findFirst({
      where: { portal: { clientId: ctx.viewer.clientId }, key: "REQUESTS", enabled: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">Updates</h1>
          <p className="mt-1.5 text-read text-steel">
            The running record from {client.agency.name}.
          </p>
        </div>
        {requestsModule ? (
          <Link
            href={`/p/${slug}/requests`}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            New request
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {updates.map((u) => (
          <Card key={u.id} className="p-5">
            <div className="flex items-center gap-2.5">
              <Avatar name={u.author?.name ?? client.agency.name} size="lg" />
              <span className="min-w-0">
                <span className="block truncate text-body text-charcoal">
                  {u.author?.name}
                  <span className="text-steel"> · {client.agency.name}</span>
                </span>
                <span className="block font-mono text-meta text-fog">
                  {formatDateTime(u.publishedAt ?? u.createdAt)}
                </span>
              </span>
            </div>
            <h2 className="mt-3 text-h3 font-medium">{u.title}</h2>
            <p className="mt-2 text-read leading-relaxed text-charcoal">{u.body}</p>
          </Card>
        ))}
        {updates.length === 0 ? (
          <p className="text-read text-steel">No updates have been posted yet.</p>
        ) : null}
      </div>
    </div>
  );
}
