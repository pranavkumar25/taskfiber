import { portalContext } from "@/server/portal-session";
import { formatDateTime } from "@/server/format";
import { Card } from "@/components/ui/surface";

export const dynamic = "force-dynamic";

/** Meetings — the call summary, without chasing anyone for it. */
export default async function PortalMeetings({ params }: PageProps<"/p/[slug]/meetings">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, meetings] = await Promise.all([ctx.q.client(), ctx.q.meetings()]);

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Meetings</h1>
      <p className="mt-1.5 text-read text-steel">
        Notes and action items from calls with {client.agency.name}.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {meetings.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-h3 font-medium">{m.title}</h2>
              <span className="font-mono text-meta text-fog">{formatDateTime(m.heldAt)}</span>
            </div>
            {m.notes ? (
              <p className="mt-2 text-read leading-relaxed text-charcoal">{m.notes}</p>
            ) : null}
            {m.actionItems.length ? (
              <ul className="mt-3 flex flex-col gap-1.5">
                {m.actionItems.map((a) => (
                  <li key={a} className="flex gap-2 text-read text-steel">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
        {meetings.length === 0 ? (
          <p className="text-read text-steel">No meeting notes have been published yet.</p>
        ) : null}
      </div>
    </div>
  );
}
