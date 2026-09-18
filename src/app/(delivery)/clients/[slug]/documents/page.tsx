import { Folder, FolderOpen } from "lucide-react";
import { db } from "@/server/db";
import { driveHealth, getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDateTime, formatSince } from "@/server/format";
import { Banner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { SourceBadge, VersionTag } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "Documents" };

/**
 * 6.7 · Client record, Documents — the Drive backbone.
 *
 * The tree is the agency's own, shown as it is. The promise is written on the
 * screen because it is the thing agencies most need to believe: nothing here is
 * renamed, moved or copied.
 */
export default async function DocumentsTab({ params }: PageProps<"/clients/[slug]/documents">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);
  const drive = await driveHealth(agency.id);

  const files = await db.driveFile.findMany({
    where: { clientId: client.id },
    orderBy: { modifiedAt: "desc" },
    include: {
      version: {
        select: { label: true, deliverable: { select: { id: true, name: true } } },
      },
      uploadedByContact: { select: { name: true } },
    },
  });

  const root = client.driveFolderPath ?? "";
  const tree = buildTree(files.map((f) => f.path), root);

  return (
    <div className="px-8 pt-6 pb-24">
      {drive.failing ? (
        <Banner
          tone="error"
          className="mb-4"
          action={<Button variant="neutral" size="xs">Re-map folder</Button>}
        >
          {drive.provider} sync failed {formatSince(drive.syncedAt)} for {client.name}.{" "}
          {drive.errorReason}{" "}
          <span className="font-medium">
            Files already published stay visible to the client.
          </span>
        </Banner>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <Card className="p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-body font-semibold text-charcoal">
                <FolderOpen className="size-3.5 text-steel" strokeWidth={1.5} />
                {drive.provider}
              </span>
              <SourceBadge failed={drive.failing}>
                {drive.failing ? "sync failed" : `synced ${formatSince(drive.syncedAt)}`}
              </SourceBadge>
            </div>

            <ul className="mt-3 flex flex-col gap-0.5 font-mono text-meta">
              {tree.map((node) => (
                <li
                  key={node.path}
                  className={cn(
                    "flex items-center gap-1.5 rounded-chip px-1.5 py-1",
                    node.depth === 0 && "text-charcoal",
                    node.depth > 0 && "text-steel",
                  )}
                  style={{ paddingLeft: 6 + node.depth * 14 }}
                >
                  <Folder className="size-3 shrink-0 text-fog" strokeWidth={1.5} />
                  <span className="truncate">{node.name}</span>
                  {node.count ? (
                    <span className="ml-auto shrink-0 text-fog">{node.count}</span>
                  ) : null}
                  {node.depth === 0 ? (
                    <span className="ml-auto shrink-0 rounded-chip bg-canvas px-1.5 text-fog">
                      mapped
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mt-3 border-t border-canvas pt-2.5 text-meta text-steel">
              Your folder structure is mapped as-is. Nothing is renamed, moved or copied.
            </p>
          </Card>
        </aside>

        <section className="min-w-0">
          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-ash px-4 py-2.5">
              <span className="truncate font-mono text-meta text-steel">
                {root.replace(/^\//, "")}
              </span>
              <span className="shrink-0 text-meta text-fog">{files.length} files</span>
            </div>

            <div className="divide-y divide-canvas">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-charcoal">{f.name}</span>
                    {f.uploadedByContact ? (
                      <span className="block truncate text-meta text-steel">
                        {f.uploadedByContact.name} ({client.name}) uploaded this via the portal ·
                        no login required
                      </span>
                    ) : null}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-meta text-fog">
                    {f.sizeBytes ? formatBytes(Number(f.sizeBytes)) : "—"}
                  </span>
                  <span className="w-36 shrink-0 font-mono text-meta text-fog">
                    {f.modifiedAt ? formatDateTime(f.modifiedAt) : "—"}
                  </span>
                  <span className="w-56 shrink-0">
                    {f.version?.deliverable ? (
                      <span className="flex items-center gap-1.5">
                        <VersionTag>{f.version.label}</VersionTag>
                        <span className="truncate text-meta text-steel">
                          {f.version.deliverable.name}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-meta text-fog">Not a deliverable</span>
                        <Button variant="secondary" size="xs">
                          Promote
                        </Button>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <p className="mt-3 text-meta text-steel">
            A file becomes a deliverable when you promote it — that is the bridge between a folder
            and something a client understands.
          </p>
        </section>
      </div>
    </div>
  );
}

type Node = { path: string; name: string; depth: number; count: number };

/** Derives the folder tree from the file paths, so it is always the real one. */
function buildTree(paths: string[], root: string): Node[] {
  const counts = new Map<string, number>();
  for (const p of paths) {
    const dir = p.slice(0, p.lastIndexOf("/"));
    let walk = dir;
    while (walk.length > root.length) {
      counts.set(walk, (counts.get(walk) ?? 0) + (walk === dir ? 1 : 0));
      walk = walk.slice(0, walk.lastIndexOf("/"));
    }
  }
  const dirs = [...counts.keys()].sort();
  return [
    { path: root, name: root.split("/").pop() ?? root, depth: 0, count: 0 },
    ...dirs.map((d) => ({
      path: d,
      name: d.split("/").pop()!,
      depth: d.slice(root.length).split("/").filter(Boolean).length,
      count: counts.get(d) ?? 0,
    })),
  ];
}

function formatBytes(n: number) {
  if (n > 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n > 1000) return `${Math.round(n / 1000)} KB`;
  return `${n} B`;
}
