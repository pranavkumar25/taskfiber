import { portalContext } from "@/server/portal-session";
import { formatDate, formatMoney } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/field";
import { FilterPill } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/pill";

export const dynamic = "force-dynamic";

/** 6.25 · Documents. Everything exchanged, with the contract lifted to the top. */
export default async function PortalDocuments({ params }: PageProps<"/p/[slug]/documents">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, documents, contracts] = await Promise.all([
    ctx.q.client(),
    ctx.q.documents(),
    ctx.q.contracts(),
  ]);

  const main = contracts.find((c) => c.kind !== "SOW");
  const categories = [...new Set(documents.map((d) => d.category))];

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Documents</h1>
      <p className="mt-1.5 text-read text-steel">
        Everything {client.agency.name} has shared with {client.name}.
      </p>

      <SearchField placeholder="Search documents" className="mt-5" />

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <FilterPill key={c} count={documents.filter((d) => d.category === c).length}>
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </FilterPill>
        ))}
      </div>

      {main ? (
        <Card className="mt-5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-item font-medium text-charcoal">{main.title}</p>
              <p className="mt-1 font-mono text-meta text-steel">
                {main.termStart ? formatDate(main.termStart) : ""} –{" "}
                {main.termEnd ? formatDate(main.termEnd) : ""}
                {main.renewalDate ? ` · renews ${formatDate(main.renewalDate)}` : ""}
              </p>
              <p className="mt-1 font-mono text-meta text-fog">
                {main.signedAt ? `Signed ${formatDate(main.signedAt)}` : "Not signed"}
                {main.esignProvider ? ` · ${main.esignProvider}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular text-item text-charcoal">
                {formatMoney(Number(main.annualValue ?? 0), main.currency)}
              </span>
              <StatusPill>{main.status.charAt(0) + main.status.slice(1).toLowerCase()}</StatusPill>
              <Button variant="secondary" size="sm">
                Open signed copy
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="mt-4 divide-y divide-canvas">
        {documents.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-chip bg-canvas text-[10px] text-fog">
              {d.name.split(".").pop()?.slice(0, 3).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-read text-charcoal">{d.name}</span>
            <span className="shrink-0 rounded-chip bg-canvas px-2 py-0.5 text-meta text-steel">
              {d.category.charAt(0) + d.category.slice(1).toLowerCase()}
            </span>
            <span className="w-24 shrink-0 text-right font-mono text-meta text-fog">
              {formatDate(d.modifiedAt)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
