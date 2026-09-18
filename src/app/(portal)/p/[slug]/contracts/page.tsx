import { portalContext } from "@/server/portal-session";
import { formatDate, formatMoney } from "@/server/format";
import { Card } from "@/components/ui/surface";
import { StatusPill } from "@/components/ui/pill";

export const dynamic = "force-dynamic";

/**
 * Contracts, in the portal.
 *
 * On by default for influencer and talent, where a campaign is a contract per
 * engagement. The rights footnote matters as much as the list: what the brand
 * may do with the content, and for how long.
 */
export default async function PortalContracts({ params }: PageProps<"/p/[slug]/contracts">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, contracts, roster] = await Promise.all([
    ctx.q.client(),
    ctx.q.contracts(),
    ctx.q.roster(),
  ]);

  const main = contracts.find((c) => c.kind !== "SOW");
  const signed = roster.filter((r) => r.status !== "BRIEFED");

  return (
    <div className="mx-auto w-full max-w-170 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Contracts</h1>
      <p className="mt-1.5 text-read text-steel">
        The agreement between {client.agency.name} and {client.name}, and the creator contracts
        under it.
      </p>

      {main ? (
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-h3 font-medium text-charcoal">{main.title}</p>
              <p className="mt-1 font-mono text-meta text-steel">
                {main.termStart ? formatDate(main.termStart) : ""} –{" "}
                {main.termEnd ? formatDate(main.termEnd) : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular text-h3 text-charcoal">
                {formatMoney(Number(main.annualValue ?? 0), main.currency)}
              </span>
              <StatusPill>{main.status.charAt(0) + main.status.slice(1).toLowerCase()}</StatusPill>
            </div>
          </div>
          <p className="mt-3 border-t border-canvas pt-3 font-mono text-meta text-fog">
            {main.signedAt ? `Signed ${formatDate(main.signedAt)}` : "Not signed"}
            {main.esignProvider ? ` · ${main.esignProvider}` : ""}
          </p>
        </Card>
      ) : null}

      {roster.length ? (
        <section className="mt-6">
          <h2 className="text-h2 font-semibold">
            Creator contracts · {signed.length} of {roster.length} signed
          </h2>
          <Card className="mt-2.5 divide-y divide-canvas">
            {roster.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1 truncate font-mono text-body text-charcoal">
                  {r.handle}
                </span>
                <span className="font-mono text-meta text-steel">
                  {r.status === "BRIEFED"
                    ? "Awaiting signature"
                    : `Signed ${formatDate(r.createdAt)}`}
                </span>
                <StatusPill tone={r.status === "BRIEFED" ? "neutral" : "success"}>
                  {r.status === "BRIEFED" ? "Briefed" : "Signed"}
                </StatusPill>
              </div>
            ))}
          </Card>
          <p className="mt-3 text-meta text-fog">
            Usage rights: 12 months paid social, Instagram and YouTube. Signed via{" "}
            {main?.esignProvider ?? "e-sign"}; copies are filed in Documents.
          </p>
        </section>
      ) : null}
    </div>
  );
}
