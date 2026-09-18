import Link from "next/link";
import { notFound } from "next/navigation";
import { portalContext } from "@/server/portal-session";
import { approvalRecordLine } from "@/server/approvals";
import { canApprove } from "@/server/visibility";
import { formatDate, formatDateTime } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { VersionTag } from "@/components/ui/pill";
import { Avatar } from "@/components/ui/avatar";
import {
  CreativeSet,
  DocumentPreview,
  FigmaFrame,
  PreviewFrame,
  ReelCard,
  type CreativeTile,
  type FigmaPreview,
  type ReelPreview,
} from "@/components/ui/preview";
import { DecisionBar } from "@/components/portal/decision-bar";

export const dynamic = "force-dynamic";

/**
 * 6.23 · Deliverable detail.
 *
 * The preview is the point — a rendered creative set, a live Figma frame with
 * its pinned comment, or the actual reel. Underneath sits the decision, and
 * beneath that the record of every decision already taken, which is the thing
 * an agency reaches for when a client says they never saw it.
 */
export default async function PortalDeliverable({
  params,
}: PageProps<"/p/[slug]/deliverables/[id]">) {
  const { slug, id } = await params;
  const ctx = await portalContext(slug);
  const [client, d] = await Promise.all([ctx.q.client(), ctx.q.deliverable(id)]);
  if (!d) notFound();

  const current = d.versions[0];
  const openRequest = current?.requests[0];
  const myDecision = current?.records.find((r) => r.approverId === ctx.viewer.contactId);

  const records = d.versions.flatMap((v) =>
    v.records.map((r) => ({
      id: r.id,
      approved: r.decision === "APPROVED",
      quote: r.comment,
      line: approvalRecordLine({
        decision: r.decision,
        versionLabel: v.label,
        approverName: r.approver.name,
        decidedAt: r.decidedAt,
        channel: r.channel,
        recordedByName: r.recordedByName,
      }),
    })),
  );

  const pin = d.comments.find((c) => c.pinX !== null && c.pinY !== null);
  const reply = pin ? d.comments.find((c) => c.parentId === pin.id) : null;

  return (
    <div className="mx-auto w-full max-w-250 px-5 pt-6 pb-16">
      <Link
        href={`/p/${slug}/deliverables`}
        className="text-body text-steel hover:text-charcoal"
      >
        ← Deliverables
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-h1 font-semibold">
            {d.name}
            <VersionTag current>{current?.label}</VersionTag>
          </h1>
          <p className="mt-1 text-body text-steel">
            {d.assetSummary ?? d.type}
            {d.project ? ` · ${d.project.name}` : ""}
            {d.publishedAt ? ` · published ${formatDate(d.publishedAt)}` : ""}
          </p>
        </div>

        <div className="w-full max-w-md">
          <DecisionBar
            versionId={current?.id ?? ""}
            versionLabel={current?.label ?? ""}
            approverId={openRequest ? ctx.viewer.contactId : null}
            approverName={openRequest?.approver.name ?? null}
            agencyName={client.agency.name}
            portalSlug={slug}
            canApprove={canApprove(ctx.viewer.role) && Boolean(openRequest)}
            alreadyDecided={
              myDecision
                ? approvalRecordLine({
                    decision: myDecision.decision,
                    versionLabel: current!.label,
                    approverName: myDecision.approver.name,
                    decidedAt: myDecision.decidedAt,
                    channel: myDecision.channel,
                    recordedByName: myDecision.recordedByName,
                  })
                : null
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <PreviewFrame
            source={`${(d.preview as { source?: string } | null)?.source ?? "Drive"} · synced recently`}
            version={current?.label}
          >
            <Preview deliverable={d} pin={pin} reply={reply} />
          </PreviewFrame>

          {records.length ? (
            <section className="mt-6">
              <h2 className="text-body font-semibold text-charcoal">Approval record</h2>
              <ul className="mt-2 flex flex-col gap-3">
                {records.map((r) => (
                  <li key={r.id} className="flex gap-2.5">
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        r.approved ? "bg-success" : "bg-warning"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-body text-steel">{r.line}</span>
                      {r.quote ? (
                        <span className="mt-1 block text-item text-charcoal">
                          &ldquo;{r.quote}&rdquo;
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card className="p-4">
            <p className="text-body font-semibold text-charcoal">Versions</p>
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {d.versions.map((v) => (
                <li key={v.id} className="flex gap-2.5">
                  <VersionTag current={v.isCurrent} className="mt-px shrink-0">
                    {v.label}
                  </VersionTag>
                  <span className="min-w-0">
                    <span className="block text-body text-charcoal">{v.note}</span>
                    <span className="block font-mono text-meta text-fog">
                      {v.publishedAt ? formatDateTime(v.publishedAt) : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <p className="text-body font-semibold text-charcoal">Owner</p>
            <p className="mt-2 flex items-center gap-2 text-body text-charcoal">
              {d.owner ? <Avatar name={d.owner.name} size="sm" /> : null}
              {d.owner?.name ?? "—"} · {client.agency.name}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

type Loaded = NonNullable<
  Awaited<ReturnType<Awaited<ReturnType<typeof portalContext>>["q"]["deliverable"]>>
>;

function Preview({
  deliverable: d,
  pin,
  reply,
}: {
  deliverable: Loaded;
  pin?: Loaded["comments"][number];
  reply?: Loaded["comments"][number] | null;
}) {
  const p = d.preview as Record<string, unknown> | null;

  if (d.previewKind === "CREATIVE" && p?.tiles) {
    return <CreativeSet tiles={p.tiles as CreativeTile[]} />;
  }
  if (d.previewKind === "FIGMA" && p) {
    return (
      <FigmaFrame
        preview={p as unknown as FigmaPreview}
        pin={
          pin
            ? {
                x: pin.pinX!,
                y: pin.pinY!,
                author: pin.authorContact?.name ?? pin.authorMember?.name ?? "",
                at: formatDateTime(pin.createdAt),
                body: pin.body,
                reply: reply
                  ? {
                      author: reply.authorMember?.name ?? "",
                      body: reply.body,
                    }
                  : undefined,
              }
            : null
        }
      />
    );
  }
  if (d.previewKind === "REEL" && p) {
    return <ReelCard preview={p as unknown as ReelPreview} />;
  }
  return <DocumentPreview label={d.assetSummary ?? d.type} />;
}
