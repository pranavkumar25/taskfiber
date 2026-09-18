import Link from "next/link";
import { getClientRecord, getDeliverable, listDeliverables } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { approvalRecordLine } from "@/server/approvals";
import { formatDate, formatDateTime, formatSince } from "@/server/format";
import { Button } from "@/components/ui/button";
import { FilterPill } from "@/components/ui/field";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { StatusPill, VersionTag } from "@/components/ui/pill";
import { VisibilityTag, visibilityRowClass } from "@/components/ui/visibility";
import {
  DeliverableSlideOver,
  type SlideOverData,
} from "@/components/delivery/deliverable-slide-over";

export const metadata = { title: "Deliverables" };

const COLS = "minmax(0,2fr) 110px 120px 60px 110px 140px 130px";
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  DELIVERED: "Delivered",
};

/**
 * 6.6 · Client record, Deliverables.
 *
 * The register. Rows carry the 1b gutter so the client-visible ones stack into
 * a readable green column, and opening a row puts its id in the URL — a
 * slide-over you can link someone to.
 */
export default async function DeliverablesTab({
  params,
  searchParams,
}: PageProps<"/clients/[slug]/deliverables">) {
  const { slug } = await params;
  const sp = await searchParams;
  const openId = typeof sp.d === "string" ? sp.d : null;

  const { agency, member } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);
  const rows = await listDeliverables(client.id);
  const open = openId ? await getDeliverable(client.id, openId) : null;

  return (
    <div className="px-8 pt-6 pb-24">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-h3 font-semibold">Deliverables · {rows.length}</h2>
        <FilterPill>All projects</FilterPill>
        <FilterPill>Any status</FilterPill>
        <Button variant="secondary" className="ml-auto">
          Promote from Drive
        </Button>
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Deliverable</span>
          <span>Type</span>
          <span>Owner</span>
          <span>Ver.</span>
          <span>Status</span>
          <span>Visibility</span>
          <span>Last published</span>
        </TableHeader>
        {rows.map((r) => {
          const visible = r.visibility === "CLIENT_VISIBLE";
          return (
            <TableRow
              key={r.id}
              cols={COLS}
              className={`${visibilityRowClass(visible ? "client" : "internal")} hover:bg-canvas/60`}
            >
              <Link
                href={`?d=${r.id}`}
                scroll={false}
                className="truncate font-medium text-charcoal hover:underline"
              >
                {r.name}
              </Link>
              <span className="truncate text-steel">{r.type}</span>
              <span className="truncate text-steel">{r.owner?.name ?? "Unassigned"}</span>
              <VersionTag>{r.versions[0]?.label ?? "—"}</VersionTag>
              <StatusPill>{STATUS_LABEL[r.status] ?? r.status}</StatusPill>
              <VisibilityTag visibility={visible ? "client" : "internal"} />
              <span className="font-mono text-meta text-steel">
                {r.publishedAt
                  ? `${r.publishedVersion ?? ""} · ${formatDate(r.publishedAt)}`.trim()
                  : "Never"}
              </span>
            </TableRow>
          );
        })}
      </DataTable>

      <p className="mt-3 text-meta text-steel">
        Open a row for versions, the approval record and the Publish to client action.
      </p>

      {open ? <DeliverableSlideOver data={toSlideOver(open, member.canPublish)} /> : null}
    </div>
  );
}

type Loaded = NonNullable<Awaited<ReturnType<typeof getDeliverable>>>;

/** Flattens the query result into the shape the client component renders. */
function toSlideOver(d: Loaded, canPublish: boolean): SlideOverData {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    previewKind: d.previewKind,
    preview: d.preview,
    status: d.status,
    assetSummary: d.assetSummary,
    visibility: d.visibility,
    publishedAt: d.publishedAt ? formatDateTime(d.publishedAt) : null,
    publishedByName: d.publishedByName,
    publishedVersion: d.publishedVersion,
    driveFolderPath: d.driveFolderPath,
    ownerName: d.owner?.name ?? null,
    project: d.project,
    clientSlug: d.client.slug,
    clientName: d.client.name,
    contacts: d.client.contacts,
    canPublish,
    syncLabel: syncLabel(d),
    versions: d.versions.map((v) => ({
      id: v.id,
      label: v.label,
      note: v.note,
      authorName: v.author?.name ?? null,
      createdAt: formatDateTime(v.createdAt),
      publishedAt: v.publishedAt ? formatDateTime(v.publishedAt) : null,
      isCurrent: v.isCurrent,
      fileCount: v.files.length,
      outcome: v.records.some((r) => r.decision === "CHANGES_REQUESTED")
        ? `changes requested ${formatDate(v.records[0].decidedAt)}`
        : null,
      records: v.records.map((r) => ({
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
      openRequest: v.requests[0]
        ? {
            approverId: v.requests[0].approver.id,
            approverName: v.requests[0].approver.name,
            dueLabel: v.requests[0].dueAt ? formatDate(v.requests[0].dueAt) : null,
          }
        : null,
    })),
  };
}

/** Every preview names its source and how stale it is. */
function syncLabel(d: Loaded) {
  const files = d.versions[0]?.files.length ?? 0;
  const preview = (d.preview as { source?: string } | null)?.source;
  const base = preview ?? (files ? `Drive · ${files} files` : "Drive");
  const synced = d.versions[0]?.files[0] ? formatSince(d.updatedAt) : formatSince(d.updatedAt);
  return `${base} · synced ${synced}`;
}
