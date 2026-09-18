import Link from "next/link";
import { currentWorkspace } from "@/server/session";
import { formatMoney } from "@/server/format";
import { Card } from "@/components/ui/surface";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/team", label: "Team, white-label and data export" },
  { href: "/integrations", label: "Integrations" },
  { href: "/documents/approvals", label: "Approval reminders and SLA" },
];

export default async function SettingsPage() {
  const { agency } = await currentWorkspace();

  return (
    <div className="max-w-2xl px-8 pt-8 pb-24">
      <h1 className="text-h1 font-semibold">Settings</h1>
      <Card className="mt-4 divide-y divide-canvas">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between gap-3 px-4 py-3 text-body hover:bg-canvas/60"
          >
            <span className="text-charcoal">{l.label}</span>
            <span className="text-fog">→</span>
          </Link>
        ))}
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-body">
          <span className="text-charcoal">
            Plan · {agency.plan} · {agency.seats} seats
          </span>
          <span className="font-mono text-meta text-steel">
            {formatMoney(14900, "INR")} / month
          </span>
        </div>
      </Card>
    </div>
  );
}
