import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { formatSince } from "@/server/format";
import { Banner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { StatusDot } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

const GROUP_LABEL: Record<string, string> = {
  STORAGE: "Storage",
  ESIGN: "Contracts and e-sign",
  ACCOUNTING: "Accounting",
  PAYMENTS: "Payments",
  CRM: "CRM",
  ANALYTICS: "Analytics",
  REPORTING: "Reporting",
  DESIGN: "Design",
  DEV: "Dev and product",
  SOCIAL: "Social and creator",
  MESSAGING: "Communication",
  MEETINGS: "Meetings",
};

const ORDER = [
  "STORAGE", "ESIGN", "ACCOUNTING", "PAYMENTS", "CRM",
  "ANALYTICS", "REPORTING", "DESIGN", "SOCIAL", "MESSAGING", "DEV", "MEETINGS",
];

/**
 * 6.17 · Integrations.
 *
 * Every card states what the connection is *for*, not just that it exists, and
 * a failing one states its blast radius. Drive is called out as the backbone
 * because it is not one integration among twenty.
 */
export default async function IntegrationsPage() {
  const { agency } = await currentWorkspace();
  const rows = await db.integration.findMany({
    where: { agencyId: agency.id },
    orderBy: { provider: "asc" },
  });

  const connected = rows.filter((r) => r.status === "CONNECTED").length;
  const failing = rows.filter((r) => r.status === "FAILING");

  const groups = ORDER.map((key) => ({
    key,
    label: GROUP_LABEL[key],
    items: rows.filter((r) => r.category === key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-h1 font-semibold">Integrations</h1>
        <span className="text-meta text-steel">
          {connected} connected
          {failing.length ? ` · ${failing.length} failing` : ""} ·{" "}
          <span className="font-medium text-charcoal">Drive is the storage backbone</span>
        </span>
      </div>

      {failing.map((f) => (
        <Banner
          key={f.id}
          tone="error"
          className="mb-3"
          action={<Button variant="neutral" size="xs">Reconnect {f.provider}</Button>}
        >
          {f.errorReason ?? `${f.provider} is failing.`} {f.blastRadius}
        </Banner>
      ))}

      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <section key={g.key}>
            <p className="label-caps mb-2">{g.label}</p>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {g.items.map((i) => (
                <Card key={i.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body font-medium text-charcoal">{i.provider}</span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 text-meta",
                        i.status === "CONNECTED" && "text-success-fg",
                        i.status === "FAILING" && "text-danger-fg",
                        i.status === "EMBED" && "text-info-fg",
                        i.status === "NOT_CONNECTED" && "text-fog",
                      )}
                    >
                      <StatusDot
                        tone={
                          i.status === "CONNECTED"
                            ? "success"
                            : i.status === "FAILING"
                              ? "danger"
                              : i.status === "EMBED"
                                ? "info"
                                : "neutral"
                        }
                      />
                      {i.status === "NOT_CONNECTED"
                        ? "Not connected"
                        : i.status.charAt(0) + i.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {i.purpose ? (
                    <p className="mt-1.5 text-meta text-steel">{i.purpose}</p>
                  ) : null}

                  <p className="mt-2 font-mono text-meta text-fog">
                    {i.account ? `${i.account} · ` : ""}
                    {i.status === "FAILING"
                      ? `sync failed ${formatSince(i.syncedAt)}`
                      : i.syncedAt
                        ? `synced ${formatSince(i.syncedAt)}`
                        : "—"}
                  </p>

                  {i.status === "NOT_CONNECTED" ? (
                    <Button variant="secondary" size="sm" className="mt-2.5 w-full">
                      Connect
                    </Button>
                  ) : null}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-meta text-steel">
        Every category runs behind an adapter, so a provider can be swapped without touching a
        screen. The accounts person keeps their accounting tool, sales keep their CRM, designers
        keep Figma, and everyone keeps Drive — which is the point.
      </p>
    </div>
  );
}
