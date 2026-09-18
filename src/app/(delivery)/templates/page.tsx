import Link from "next/link";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate } from "@/server/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { StatusDot } from "@/components/ui/pill";
import { RoleTag } from "@/components/ui/pill";

export const metadata = { title: "Portal templates" };
export const dynamic = "force-dynamic";

const ROLE_WORD: Record<string, string> = {
  APPROVER: "Approver",
  COLLABORATOR: "Collaborator",
  VIEWER: "Viewer",
  BILLING: "Billing",
};

/**
 * 6.10 · Portal template library.
 *
 * Six shipped templates, plus the ones an agency has saved from a portal it
 * refined. Opening a card shows the whole module map, because that is what a
 * template *is* — which modules are on, what they are called, and who sees them.
 */
export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const sp = await searchParams;
  const openId = typeof sp.t === "string" ? sp.t : null;
  const { agency } = await currentWorkspace();

  const templates = await db.portalTemplate.findMany({
    where: { OR: [{ isShipped: true }, { agencyId: agency.id }] },
    orderBy: [{ isShipped: "desc" }, { name: "asc" }],
    include: {
      modules: { orderBy: { order: "asc" } },
      _count: { select: { portals: true } },
    },
  });

  const open = openId ? templates.find((t) => t.id === openId) : null;
  const shipped = templates.filter((t) => t.isShipped).length;

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-h1 font-semibold">Portal templates</h1>
        <span className="text-meta text-steel">
          {shipped} shipped · {templates.length - shipped} yours
        </span>
      </div>

      <div className={open ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" : ""}>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {templates.map((t) => {
            const on = t.modules.filter((m) => m.enabled);
            return (
              <Link key={t.id} href={t.id === openId ? "/templates" : `?t=${t.id}`} scroll={false}>
                <Card className="h-full p-4 hover:border-smoke hover:shadow-lift">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-item font-medium text-charcoal">{t.name}</span>
                    <span
                      className={
                        t.isShipped
                          ? "rounded-chip bg-canvas px-1.5 text-meta text-steel"
                          : "rounded-chip bg-info-tint px-1.5 text-meta text-info-fg"
                      }
                    >
                      {t.isShipped ? "Shipped" : "Yours"}
                    </span>
                  </div>
                  <p className="mt-2 text-meta text-steel">
                    Work unit <span className="text-charcoal">{t.workUnit}</span> · Timeline{" "}
                    <span className="text-charcoal">{t.timelineLabel}</span>
                  </p>
                  <p className="mt-1.5 text-meta text-steel">
                    {on.length} modules on:{" "}
                    {on
                      .slice(0, 4)
                      .map((m) => m.label)
                      .join(", ")}
                    {on.length > 4 ? "…" : ""}
                  </p>
                  {t.expectedTools.length ? (
                    <p className="mt-1.5 text-meta text-fog">
                      Expects {t.expectedTools.join(", ")}
                    </p>
                  ) : null}
                  {t.savedFromClientId ? (
                    <p className="mt-1.5 text-meta text-fog">
                      Saved {formatDate(t.createdAt)}
                    </p>
                  ) : null}
                  <p className="mt-2.5 border-t border-canvas pt-2 text-meta text-fog">
                    Used by {t._count.portals} client{t._count.portals === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>

        {open ? (
          <aside className="min-w-0">
            <Card className="sticky top-16 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-ash px-4 py-3">
                <span className="truncate text-body font-semibold text-charcoal">
                  {open.name} · Module map
                </span>
                <Link href="/templates" className="text-meta text-steel hover:text-charcoal">
                  Close
                </Link>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {open.modules.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2.5 border-b border-canvas px-4 py-2 last:border-b-0"
                  >
                    <StatusDot tone={m.enabled ? "success" : "neutral"} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body text-charcoal">
                        {m.key.charAt(0) + m.key.slice(1).toLowerCase()}
                      </span>
                      <span className="block truncate text-meta text-steel">
                        {m.enabled ? m.label : "Off in this template"}
                      </span>
                    </span>
                    {m.enabled ? (
                      <RoleTag className="shrink-0">
                        {m.roles.length === 0
                          ? "All roles"
                          : m.roles.map((r) => ROLE_WORD[r]).join(", ")}
                      </RoleTag>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 border-t border-ash p-3">
                <Button variant="primary" className="flex-1">
                  Use for a new client
                </Button>
                <Button variant="secondary">Duplicate</Button>
              </div>
            </Card>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
