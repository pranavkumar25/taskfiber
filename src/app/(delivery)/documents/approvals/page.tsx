import Link from "next/link";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";
import { approvalRecordLine } from "@/server/approvals";
import { formatDate, formatDateShort, formatDueCompact } from "@/server/format";
import { Button } from "@/components/ui/button";
import { Card, CardHead, DataTable, TableHeader, TableRow } from "@/components/ui/surface";
import { FilterPill, Checkbox, Segmented, Select } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

const COLS = "minmax(0,2fr) 130px 130px 100px 100px 120px 120px";

/**
 * 6.8 · Approvals inbox.
 *
 * The Channel column doubles as the chase record, because "who have we already
 * nudged, and how" is the question this screen exists to answer. Reminders stop
 * the moment a decision arrives from any channel — the aside says so, and the
 * code in `approvals.ts` enforces it.
 */
export default async function ApprovalsPage({ searchParams }: PageProps<"/documents/approvals">) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : "open";
  const selected = typeof sp.a === "string" ? sp.a : null;
  const { agency } = await currentWorkspace();

  const scope = { version: { deliverable: { client: { agencyId: agency.id } } } };

  const [open, decidedRecords, counts] = await Promise.all([
    db.approvalRequest.findMany({
      where: { ...scope, state: "WAITING" },
      orderBy: { dueAt: "asc" },
      include: {
        approver: { select: { id: true, name: true, notifyChannel: true, lastActiveAt: true } },
        version: {
          include: {
            deliverable: {
              select: { id: true, name: true, client: { select: { name: true, slug: true } } },
            },
          },
        },
      },
    }),
    db.approvalRecord.findMany({
      where: scope,
      orderBy: { decidedAt: "desc" },
      take: 12,
      include: {
        approver: { select: { name: true } },
        version: { select: { label: true, deliverable: { select: { name: true } } } },
      },
    }),
    db.approvalRecord.count({ where: scope }),
  ]);

  const pastSla = open.filter((a) => a.dueAt && a.dueAt.getTime() < Date.now());
  const rows = filter === "sla" ? pastSla : open;
  const detail = selected ? open.find((a) => a.id === selected) : null;

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Approvals</h1>
        <Link href="/documents/approvals">
          <FilterPill selected={filter === "open"} count={open.length}>
            Open
          </FilterPill>
        </Link>
        <Link href="?filter=sla">
          <FilterPill selected={filter === "sla"} count={pastSla.length}>
            Past SLA
          </FilterPill>
        </Link>
        <Link href="?filter=decided">
          <FilterPill selected={filter === "decided"} count={counts}>
            Decided
          </FilterPill>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {filter !== "decided" ? (
            <DataTable>
              <TableHeader cols={COLS}>
                <span>Deliverable</span>
                <span>Client</span>
                <span>Approver</span>
                <span>Requested</span>
                <span>Due</span>
                <span>State</span>
                <span>Channel</span>
              </TableHeader>
              {rows.map((a) => {
                const late = a.dueAt && a.dueAt.getTime() < Date.now();
                return (
                  <TableRow
                    key={a.id}
                    cols={COLS}
                    selected={a.id === selected}
                    className="hover:bg-canvas/60"
                  >
                    <Link
                      href={a.id === selected ? "?" : `?a=${a.id}`}
                      scroll={false}
                      className="truncate font-medium text-charcoal hover:underline"
                    >
                      {a.version.deliverable.name}{" "}
                      <span className="font-mono text-meta text-steel">{a.version.label}</span>
                    </Link>
                    <span className="truncate text-steel">
                      {a.version.deliverable.client.name}
                    </span>
                    <span className="truncate text-steel">{a.approver.name}</span>
                    <span className="font-mono text-meta text-fog">
                      {formatDateShort(a.requestedAt)}
                    </span>
                    <span className="font-mono text-meta text-fog">
                      {a.dueAt ? formatDateShort(a.dueAt) : "—"}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-meta",
                        late ? "text-danger-fg" : "text-steel",
                      )}
                    >
                      {a.dueAt ? (late ? formatDueCompact(a.dueAt) : "Waiting") : "Waiting"}
                    </span>
                    <span className="truncate text-meta text-steel">{chaseLabel(a)}</span>
                  </TableRow>
                );
              })}
            </DataTable>
          ) : null}

          {detail ? <OverdueDetail request={detail} /> : null}

          <section className="mt-6">
            <CardHead title="Recently decided" className="mb-2.5" />
            <Card className="px-4 py-2">
              <ul className="flex flex-col gap-2.5">
                {decidedRecords.map((r) => (
                  <li key={r.id} className="flex gap-2.5">
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        r.decision === "APPROVED" ? "bg-success" : "bg-warning",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-meta text-steel">
                        {approvalRecordLine({
                          decision: r.decision,
                          versionLabel: `${r.version.deliverable.name} ${r.version.label}`,
                          approverName: r.approver.name,
                          decidedAt: r.decidedAt,
                          channel: r.channel,
                          recordedByName: r.recordedByName,
                        })}
                      </span>
                      {r.comment ? (
                        <span className="mt-0.5 block text-body text-charcoal">
                          &ldquo;{r.comment}&rdquo;
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <p className="mt-2 text-meta text-fog">
              Approval records are immutable. There is no edit path, by design.
            </p>
          </section>
        </div>

        <aside className="min-w-0">
          <Card className="p-4">
            <CardHead title="Reminders and SLA" />
            <div className="mt-3 flex flex-col gap-3 text-body">
              <label className="flex flex-col gap-1">
                <span className="label-caps">Default due</span>
                <Select defaultValue="3">
                  <option value="2">2 working days</option>
                  <option value="3">3 working days</option>
                  <option value="5">5 working days</option>
                </Select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="label-caps">Remind approver</span>
                {[
                  ["1 day before due · email", true],
                  ["On due date · email and WhatsApp", true],
                  ["2 days overdue · escalate to account lead", true],
                  ["5 days overdue · notify agency owner", false],
                ].map(([label, on]) => (
                  <label key={String(label)} className="flex items-start gap-2 text-steel">
                    <Checkbox checked={Boolean(on)} label={String(label)} className="mt-0.5" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <span className="label-caps">Tone</span>
                <Segmented
                  options={[
                    { value: "plain", label: "Plain" },
                    { value: "warm", label: "Warm" },
                    { value: "formal", label: "Formal" },
                  ]}
                  value="plain"
                />
              </div>

              <p className="border-t border-canvas pt-2.5 text-meta text-fog">
                Approval records are immutable. Reminders stop the moment a decision arrives from
                any channel.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

type Req = {
  reminderCount: number;
  escalatedAt: Date | null;
  approver: { notifyChannel: string };
};

function chaseLabel(a: Req) {
  if (a.escalatedAt) return "Escalated";
  if (a.reminderCount > 1) return `Reminded ×${a.reminderCount}`;
  if (a.reminderCount === 1) return "Reminded ×1";
  return a.approver.notifyChannel === "whatsapp" ? "WhatsApp" : "Email sent";
}

/**
 * The overdue state, spelled out: what was already tried, why it is probably
 * stuck, and three things you can do about it — including recording a decision
 * that was given out of band, which is labelled as such on the record.
 */
function OverdueDetail({
  request,
}: {
  request: {
    requestedAt: Date;
    dueAt: Date | null;
    reminderCount: number;
    lastRemindedAt: Date | null;
    escalatedAt: Date | null;
    escalatedToName: string | null;
    approver: { name: string; notifyChannel: string; lastActiveAt: Date | null };
    version: { label: string; deliverable: { name: string } };
  };
}) {
  const trail = [
    `Requested ${formatDateShort(request.requestedAt)}`,
    request.dueAt ? `due ${formatDateShort(request.dueAt)}` : null,
    request.reminderCount
      ? `reminded ${request.reminderCount}×${
          request.lastRemindedAt ? `, last ${formatDateShort(request.lastRemindedAt)}` : ""
        }`
      : null,
    request.escalatedAt
      ? `escalated to ${request.escalatedToName} ${formatDateShort(request.escalatedAt)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="mt-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-item font-medium text-charcoal">
          {request.version.deliverable.name}{" "}
          <span className="font-mono text-meta text-steel">{request.version.label}</span>
        </span>
        {request.dueAt ? (
          <StatusPill tone="danger">{formatDueCompact(request.dueAt)}</StatusPill>
        ) : null}
      </div>

      <p className="mt-2 font-mono text-meta text-steel">{trail}</p>

      <p className="mt-2 text-body text-steel">
        {request.approver.name} has not opened the portal since{" "}
        {request.approver.lastActiveAt ? formatDate(request.approver.lastActiveAt) : "the request"}.
        Emails were delivered;{" "}
        {request.approver.notifyChannel === "whatsapp"
          ? "WhatsApp is enabled."
          : "WhatsApp is not enabled for this client."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary">Send reminder now</Button>
        <Button variant="secondary">Reassign approver</Button>
        <Button variant="secondary">Mark approved verbally</Button>
      </div>

      <p className="mt-2.5 text-meta text-fog">
        &ldquo;Approved verbally&rdquo; records who told you, when and how. It is labelled as such
        on the approval record.
      </p>
    </Card>
  );
}
