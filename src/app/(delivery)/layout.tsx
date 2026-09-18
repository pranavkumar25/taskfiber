import { DeliveryShell } from "@/components/delivery/shell";
import { currentWorkspace, sidebarCounts } from "@/server/session";

// Every delivery screen reads the workspace's live data, so none of them are
// prerenderable.
export const dynamic = "force-dynamic";

export default async function DeliveryLayout({ children }: LayoutProps<"/">) {
  const { agency, member } = await currentWorkspace();
  const counts = await sidebarCounts(agency.id);

  return (
    <DeliveryShell
      agency={{
        name: agency.name,
        vertical: agency.vertical,
        city: agency.city,
        accentHex: agency.accentHex,
      }}
      member={{ name: member.name }}
      counts={counts}
    >
      {children}
    </DeliveryShell>
  );
}
