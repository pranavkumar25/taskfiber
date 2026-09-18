import Link from "next/link";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatDate } from "@/server/format";
import { buttonVariants } from "@/components/ui/button";
import { DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { FilterPill } from "@/components/ui/field";
import { VisibilityTag } from "@/components/ui/visibility";
import { BrandMark } from "@/components/ui/avatar";

export const metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

const COLS = "minmax(0,2fr) minmax(0,1fr) 130px 150px 130px";

/** Global document library, across every client. */
export default async function DocumentsPage({ searchParams }: PageProps<"/documents">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category.toUpperCase() : null;
  const { agency } = await currentWorkspace();

  const [documents, grouped, openApprovals, renewals] = await Promise.all([
    db.document.findMany({
      where: {
        client: { agencyId: agency.id },
        ...(category ? { category: category as never } : {}),
      },
      orderBy: { modifiedAt: "desc" },
      include: { client: { select: { name: true, slug: true, brandColor: true } } },
      take: 200,
    }),
    db.document.groupBy({
      by: ["category"],
      where: { client: { agencyId: agency.id } },
      _count: { _all: true },
    }),
    db.approvalRequest.count({
      where: { state: "WAITING", version: { deliverable: { client: { agencyId: agency.id } } } },
    }),
    db.contract.count({
      where: {
        client: { agencyId: agency.id },
        termEnd: { lte: new Date(Date.now() + 90 * 86400000), gte: new Date() },
      },
    }),
  ]);

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Documents</h1>
        <Link href="/documents">
          <FilterPill selected={!category} count={grouped.reduce((n, g) => n + g._count._all, 0)}>
            All
          </FilterPill>
        </Link>
        {grouped.map((g) => (
          <Link key={g.category} href={`?category=${g.category.toLowerCase()}`}>
            <FilterPill selected={category === g.category} count={g._count._all}>
              {g.category.charAt(0) + g.category.slice(1).toLowerCase()}
            </FilterPill>
          </Link>
        ))}
        <span className="ml-auto flex gap-2">
          <Link
            href="/documents/approvals"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Approvals · {openApprovals}
          </Link>
          <Link
            href="/documents/contracts"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Renewals · {renewals}
          </Link>
        </span>
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Document</span>
          <span>Client</span>
          <span>Category</span>
          <span>Visibility</span>
          <span>Modified</span>
        </TableHeader>
        {documents.map((d) => (
          <TableRow key={d.id} cols={COLS}>
            <span className="truncate text-charcoal">{d.name}</span>
            <Link
              href={`/clients/${d.client.slug}/documents`}
              className="flex min-w-0 items-center gap-2 hover:underline"
            >
              <BrandMark name={d.client.name} color={d.client.brandColor} size="sm" />
              <span className="truncate text-steel">{d.client.name}</span>
            </Link>
            <span className="text-meta text-steel">
              {d.category.charAt(0) + d.category.slice(1).toLowerCase()}
            </span>
            <VisibilityTag
              visibility={d.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
            />
            <span className="font-mono text-meta text-fog">{formatDate(d.modifiedAt)}</span>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
