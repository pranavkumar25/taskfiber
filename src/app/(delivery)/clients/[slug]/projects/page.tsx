import Link from "next/link";
import { db } from "@/server/db";
import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDateShort } from "@/server/format";
import { Button } from "@/components/ui/button";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { StatusPill, TypeChip } from "@/components/ui/pill";
import { VisibilityTag, visibilityRowClass } from "@/components/ui/visibility";

export const metadata = { title: "Projects" };

const COLS = "minmax(0,2fr) 110px 130px 180px 110px 140px";
const STATUS: Record<string, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BLOCKED: "Blocked",
  DONE: "Done",
};

/** Client record · Projects. Every row wears its visibility on its left edge. */
export default async function ProjectsTab({ params }: PageProps<"/clients/[slug]/projects">) {
  const { slug } = await params;
  const { agency } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const projects = await db.project.findMany({
    where: { clientId: client.id },
    orderBy: [{ status: "asc" }, { startDate: "asc" }],
    include: { owner: { select: { name: true } } },
  });

  const active = projects.filter((p) => p.status !== "DONE").length;
  const done = projects.length - active;

  return (
    <div className="px-8 pt-6 pb-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-h3 font-semibold">
          Projects · {active} active, {done} done
        </h2>
        <Button variant="secondary">New project from template</Button>
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Project</span>
          <span>Type</span>
          <span>Owner</span>
          <span>Dates</span>
          <span>Status</span>
          <span>Visibility</span>
        </TableHeader>
        {projects.map((p) => {
          const visible = p.visibility === "CLIENT_VISIBLE";
          return (
            <TableRow
              key={p.id}
              cols={COLS}
              className={visibilityRowClass(visible ? "client" : "internal")}
            >
              {visible ? (
                <Link
                  href={`/clients/${slug}/projects/${p.id}`}
                  className="truncate font-medium text-charcoal hover:underline"
                >
                  {p.name}
                </Link>
              ) : (
                <span className="truncate font-medium">{p.name}</span>
              )}
              <TypeChip className="capitalize">{p.type.toLowerCase()}</TypeChip>
              <span className="truncate text-steel">{p.owner?.name ?? "Unassigned"}</span>
              <span className="truncate font-mono text-meta text-steel">
                {p.startDate ? formatDateShort(p.startDate) : "—"}
                {p.endDate ? ` – ${formatDate(p.endDate)}` : " →"}
              </span>
              <StatusPill>{STATUS[p.status]}</StatusPill>
              <VisibilityTag visibility={visible ? "client" : "internal"} />
            </TableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
