import { portalContext } from "@/server/portal-session";
import { formatCount, formatSince } from "@/server/format";
import { BarChart, LineChart, ProgressRail, WidgetCard } from "@/components/ui/chart";

export const dynamic = "force-dynamic";

type Cfg = {
  value?: number | string;
  delta?: string;
  series?: number[];
  bars?: number[];
  rows?: string[][];
  stats?: [string, string][];
  target?: number;
  percent?: number;
  caption?: string;
};

/** 6.24 · Dashboards. Live from connected sources, each card naming its own. */
export default async function PortalDashboard({ params }: PageProps<"/p/[slug]/dashboard">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, widgets] = await Promise.all([ctx.q.client(), ctx.q.widgets()]);

  return (
    <div className="mx-auto w-full max-w-240 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Dashboards</h1>
      <p className="mt-1.5 text-read text-steel">
        Live from the sources {client.agency.name} has connected.
      </p>

      <div
        className="mt-6 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {widgets.map((w) => {
          const cfg = w.config as Cfg;
          const source = w.syncedAt
            ? `${w.source} · ${formatSince(w.syncedAt)}`
            : (w.source ?? undefined);

          return (
            <WidgetCard
              key={w.id}
              title={w.title}
              source={source}
              span={w.span}
              value={
                typeof cfg.value === "number"
                  ? formatCount(cfg.value, client.currency)
                  : cfg.value
              }
              delta={cfg.delta}
            >
              {cfg.series ? (
                <LineChart series={cfg.series} labels={["1 Sep", "17 Sep"]} />
              ) : null}
              {cfg.bars ? <BarChart values={cfg.bars} highlightLast={2} /> : null}
              {cfg.stats ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-body">
                  {cfg.stats.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-2">
                      <dt className="text-steel">{k}</dt>
                      <dd className="font-mono text-charcoal">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {cfg.rows ? (
                <table className="w-full text-body">
                  <tbody>
                    {cfg.rows.map((r) => (
                      <tr key={r[0]} className="border-b border-canvas last:border-b-0">
                        <td className="py-1.5 text-charcoal">{r[0]}</td>
                        <td className="py-1.5 text-right font-mono text-steel">{r[1]}</td>
                        <td className="w-10 py-1.5 text-right font-mono text-success-fg">
                          {r[2]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {cfg.percent !== undefined ? (
                <div>
                  <ProgressRail percent={cfg.percent} />
                  <p className="mt-1.5 text-meta text-steel">
                    {cfg.percent}% of target
                    {cfg.target ? ` · ${formatCount(cfg.target, client.currency)}` : ""}
                  </p>
                </div>
              ) : null}
              {cfg.caption ? <p className="text-meta text-fog">{cfg.caption}</p> : null}
            </WidgetCard>
          );
        })}
      </div>

      {widgets.length === 0 ? (
        <p className="mt-8 text-read text-steel">No dashboard has been built for you yet.</p>
      ) : null}
    </div>
  );
}
