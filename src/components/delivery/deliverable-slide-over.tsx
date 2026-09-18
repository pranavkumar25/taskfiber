"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button, Kbd } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { ConfirmPopover, SlideOver } from "@/components/ui/overlay";
import { StatusPill, VersionTag } from "@/components/ui/pill";
import { Avatar } from "@/components/ui/avatar";
import { VisibilityTag } from "@/components/ui/visibility";
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
import { useToast } from "@/components/ui/toaster";
import { publishDeliverableAction, unpublishDeliverableAction } from "@/server/actions";

export type SlideOverData = {
  id: string;
  name: string;
  type: string;
  previewKind: "CREATIVE" | "FIGMA" | "REEL" | "DOCUMENT" | "WEB";
  preview: unknown;
  status: string;
  assetSummary: string | null;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
  publishedAt: string | null;
  publishedByName: string | null;
  publishedVersion: string | null;
  driveFolderPath: string | null;
  ownerName: string | null;
  project: { id: string; name: string } | null;
  clientSlug: string;
  clientName: string;
  contacts: { id: string; name: string; role: string }[];
  versions: {
    id: string;
    label: string;
    note: string | null;
    authorName: string | null;
    createdAt: string;
    publishedAt: string | null;
    isCurrent: boolean;
    fileCount: number;
    outcome: string | null;
    records: { id: string; line: string; quote: string | null; approved: boolean }[];
    openRequest: { approverId: string; approverName: string; dueLabel: string | null } | null;
  }[];
  canPublish: boolean;
  syncLabel: string;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  DELIVERED: "Delivered",
};

/**
 * 6.6 · The deliverable slide-over.
 *
 * Two behaviours carry the product's rule. Publishing opens a confirmation that
 * names every recipient BEFORE it fires, and offers to raise the approval
 * request in the same action. Unpublishing needs no confirmation but is drawn
 * danger-outline and says the consequence in the client's own terms.
 */
export function DeliverableSlideOver({ data }: { data: SlideOverData }) {
  const router = useRouter();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [alsoRequest, setAlsoRequest] = React.useState(true);
  const [pending, startTransition] = React.useTransition();

  const current = data.versions[0];
  const published = data.visibility === "CLIENT_VISIBLE";
  const approver = data.contacts.find((c) => c.role === "APPROVER");

  function close() {
    router.push(`/clients/${data.clientSlug}/deliverables`);
  }

  function publish() {
    setConfirmOpen(false);
    startTransition(async () => {
      const r = await publishDeliverableAction({
        versionId: current.id,
        clientSlug: data.clientSlug,
        requestApprovalFrom: alsoRequest ? (approver?.id ?? null) : null,
      });
      toast(r.toast);
      router.refresh();
    });
  }

  function unpublish() {
    startTransition(async () => {
      const r = await unpublishDeliverableAction({
        deliverableId: data.id,
        clientSlug: data.clientSlug,
      });
      toast(r.toast);
      router.refresh();
    });
  }

  // `P` publishes, matching the row toggles and the menu.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key.toLowerCase() === "p" && !published && data.canPublish) {
        e.preventDefault();
        setConfirmOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [published, data.canPublish]);

  return (
    <SlideOver
      open
      onOpenChange={(o) => !o && close()}
      title={data.name}
      meta={
        <>
          <VersionTag current>{current?.label}</VersionTag>
          <VisibilityTag visibility={published ? "client" : "internal"} />
        </>
      }
      footer={
        published ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-meta text-steel">
              Visible to {data.contacts.length} contacts at {data.clientName}
            </span>
            <Button variant="danger" disabled={pending || !data.canPublish} onClick={unpublish}>
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" disabled={pending}>
              Request approval
            </Button>
            <ConfirmPopover
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={`Publish ${current?.label} to ${data.clientName}?`}
              trigger={
                <Button variant="primary" disabled={pending || !data.canPublish}>
                  <Upload className="size-3.5" strokeWidth={2} />
                  Publish to client
                  <Kbd onDark>P</Kbd>
                </Button>
              }
              footer={
                <>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={publish}>
                    Publish {current?.label}
                  </Button>
                </>
              }
            >
              <p>
                Publishing makes{" "}
                <span className="font-medium text-charcoal">
                  {data.name} {current?.label}
                </span>{" "}
                visible to {data.contacts.length} contacts at {data.clientName}:{" "}
                {data.contacts.map((c) => c.name).join(", ")}. They will be notified by email.
              </p>
              {approver ? (
                <label className="mt-2.5 flex items-start gap-2 text-body text-charcoal">
                  <Checkbox
                    checked={alsoRequest}
                    onChange={setAlsoRequest}
                    label="Also request approval"
                    className="mt-0.5"
                  />
                  <span>
                    Also request approval from {approver.name}
                  </span>
                </label>
              ) : null}
            </ConfirmPopover>
          </div>
        )
      }
    >
      <PreviewFrame source={data.syncLabel} version={current?.label}>
        <Preview data={data} />
      </PreviewFrame>

      <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-body">
        <dt className="text-steel">Status</dt>
        <dd>
          <StatusPill>{STATUS_LABEL[data.status] ?? data.status}</StatusPill>
        </dd>
        <dt className="text-steel">Type</dt>
        <dd className="text-charcoal">{data.assetSummary ?? data.type}</dd>
        {data.project ? (
          <>
            <dt className="text-steel">Project</dt>
            <dd>
              <Link
                href={`/clients/${data.clientSlug}/projects/${data.project.id}`}
                className="text-electric hover:underline"
              >
                {data.project.name}
              </Link>
            </dd>
          </>
        ) : null}
        <dt className="text-steel">Owner</dt>
        <dd className="flex items-center gap-1.5 text-charcoal">
          {data.ownerName ? (
            <>
              <Avatar name={data.ownerName} size="xs" />
              {data.ownerName}
            </>
          ) : (
            "Unassigned"
          )}
        </dd>
        {current?.openRequest ? (
          <>
            <dt className="text-steel">Approver</dt>
            <dd className="text-charcoal">
              {current.openRequest.approverName}
              {current.openRequest.dueLabel ? (
                <span className="text-steel"> · due </span>
              ) : null}
              {current.openRequest.dueLabel ? (
                <span className="font-mono">{current.openRequest.dueLabel}</span>
              ) : null}
            </dd>
          </>
        ) : null}
      </dl>

      <section>
        <h3 className="text-body font-semibold text-charcoal">Versions</h3>
        <ul className="mt-1.5 flex flex-col gap-2">
          {data.versions.map((v) => (
            <li key={v.id} className="flex gap-2.5">
              <VersionTag current={v.isCurrent} className="mt-px shrink-0">
                {v.label}
              </VersionTag>
              <span className="min-w-0 flex-1">
                <span className="block text-body text-charcoal">{v.note}</span>
                <span className="block font-mono text-meta text-fog">
                  {v.authorName} · {v.createdAt}
                  {v.outcome ? (
                    <span className="text-warning-fg"> · {v.outcome}</span>
                  ) : null}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {data.versions.some((v) => v.records.length) ? (
        <section>
          <h3 className="text-body font-semibold text-charcoal">Approval record</h3>
          <ul className="mt-1.5 flex flex-col gap-2.5">
            {data.versions.flatMap((v) =>
              v.records.map((r) => (
                <li key={r.id} className="flex gap-2.5">
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      r.approved ? "bg-success" : "bg-warning"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block font-mono text-meta text-steel">{r.line}</span>
                    {r.quote ? (
                      <span className="mt-0.5 block text-body text-charcoal">
                        &ldquo;{r.quote}&rdquo;
                      </span>
                    ) : null}
                  </span>
                </li>
              )),
            )}
          </ul>
        </section>
      ) : null}

      {published && data.publishedAt ? (
        <div className="animate-enter rounded-control border border-success/25 bg-success-tint px-3 py-2.5 text-body">
          <span className="font-medium text-charcoal">
            Published {data.publishedVersion} to {data.clientName}
          </span>
          <span className="mt-0.5 block font-mono text-meta text-steel">
            {data.publishedByName} · {data.publishedAt}
          </span>
        </div>
      ) : null}
    </SlideOver>
  );
}

function Preview({ data }: { data: SlideOverData }) {
  const p = data.preview as Record<string, unknown> | null;
  if (data.previewKind === "CREATIVE" && p?.tiles) {
    return <CreativeSet tiles={p.tiles as CreativeTile[]} />;
  }
  if (data.previewKind === "FIGMA" && p) {
    return <FigmaFrame preview={p as unknown as FigmaPreview} />;
  }
  if (data.previewKind === "REEL" && p) {
    return <ReelCard preview={p as unknown as ReelPreview} />;
  }
  return <DocumentPreview label={data.assetSummary ?? data.type} />;
}
