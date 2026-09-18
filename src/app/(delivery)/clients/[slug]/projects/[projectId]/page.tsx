import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getClientRecord } from "@/server/client-record";
import { currentWorkspace } from "@/server/session";
import { formatDate, formatDateShort, formatDateTime } from "@/server/format";
import { Card, CardHead } from "@/components/ui/surface";
import { StatusPill, TypeChip, VersionTag } from "@/components/ui/pill";
import { Avatar } from "@/components/ui/avatar";
import { VisibilityMiniTag } from "@/components/ui/visibility";
import { MilestoneRail, PhaseBar } from "@/components/delivery/timeline";
import { TaskRow } from "@/components/delivery/task-row";
import { ProjectVisibility } from "@/components/delivery/project-visibility";
import { CommentComposer } from "@/components/delivery/composer";

const STATUS: Record<string, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BLOCKED: "Blocked",
  DONE: "Done",
};

/**
 * 6.5 · Project view.
 *
 * The timeline is the client's view of the work and the task list is not, so
 * the two sit side by side with the boundary drawn: internal milestones are
 * dashed squares, and every task row carries its own publish control.
 */
export default async function ProjectPage({
  params,
}: PageProps<"/clients/[slug]/projects/[projectId]">) {
  const { slug, projectId } = await params;
  const { agency, member } = await currentWorkspace();
  const { client } = await getClientRecord(agency.id, slug);

  const project = await db.project.findFirst({
    where: { id: projectId, clientId: client.id },
    include: {
      owner: { select: { name: true } },
      phases: { orderBy: { order: "asc" } },
      milestones: { orderBy: { date: "asc" } },
      tasks: {
        orderBy: { createdAt: "asc" },
        include: { owner: { select: { name: true } } },
      },
      deliverables: {
        orderBy: { createdAt: "desc" },
        include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          authorMember: { select: { name: true } },
          authorContact: { select: { name: true } },
        },
      },
    },
  });
  if (!project) notFound();

  const publishedMilestones = project.milestones.filter(
    (m) => m.visibility === "CLIENT_VISIBLE",
  ).length;
  const currentPhase = project.phases.findIndex((p) => p.status === "DUE");
  const grouped = groupTasks(project.tasks, project.milestones, project.phases);

  return (
    <div className="px-8 pt-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-h2 font-semibold">{project.name}</h2>
            <TypeChip className="capitalize">{project.type.toLowerCase()}</TypeChip>
            <StatusPill>{STATUS[project.status]}</StatusPill>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-steel">
            {project.owner ? (
              <span className="flex items-center gap-1.5">
                <Avatar name={project.owner.name} size="xs" />
                {project.owner.name}
              </span>
            ) : null}
            {project.startDate && project.endDate ? (
              <span className="font-mono">
                {formatDateShort(project.startDate)} – {formatDate(project.endDate)}
              </span>
            ) : null}
            {currentPhase >= 0 ? (
              <span className="font-medium text-charcoal">
                {project.phases[currentPhase].name.split("·")[0].trim()} of{" "}
                {project.phases.filter((p) => !/wrap/i.test(p.name)).length}
              </span>
            ) : null}
            {project.revisionRoundsAllowed ? (
              <span>
                Revision rounds: {project.revisionRoundsUsed} of {project.revisionRoundsAllowed}{" "}
                used
              </span>
            ) : null}
          </div>
        </div>

        <ProjectVisibility
          projectId={project.id}
          clientSlug={slug}
          initial={project.visibility}
          canPublish={member.canPublish}
        />
      </div>

      <Card className="mt-5 p-4">
        <CardHead
          title={project.type === "CAMPAIGN" ? "Campaign calendar" : "Project phases"}
          action={
            <span className="text-meta text-steel">
              Client sees phases and {publishedMilestones} of {project.milestones.length}{" "}
              milestones
            </span>
          }
        />
        <div className="mt-4">
          <PhaseBar
            phases={project.phases.map((p) => ({
              name: p.name,
              weight: p.weight,
              status: p.status,
            }))}
          />
        </div>
        <div className="mt-6">
          <MilestoneRail
            milestones={project.milestones.map((m) => ({
              id: m.id,
              name: m.name,
              date: m.date,
              state: m.state,
              visibility: m.visibility,
            }))}
          />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <CardHead
            title="Tasks"
            action={
              <span className="text-meta text-steel">
                Internal by default · switch a row to publish it
              </span>
            }
            className="mb-2.5"
          />
          <Card className="p-2">
            {grouped.map((g) => (
              <div key={g.label} className="mb-3 last:mb-1">
                <p className="label-caps px-2 py-1">{g.label}</p>
                {g.tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    clientSlug={slug}
                    canPublish={member.canPublish}
                    task={{
                      id: t.id,
                      name: t.name,
                      status: t.status,
                      completed: t.completed,
                      visibility: t.visibility,
                      owner: t.owner,
                    }}
                  />
                ))}
              </div>
            ))}
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          <section>
            <CardHead
              title="Deliverables"
              action={
                <Link
                  href={`/clients/${slug}/deliverables`}
                  className="text-meta text-electric hover:underline"
                >
                  All →
                </Link>
              }
              className="mb-2.5"
            />
            <Card className="divide-y divide-canvas">
              {project.deliverables.map((d) => (
                <Link
                  key={d.id}
                  href={`/clients/${slug}/deliverables?d=${d.id}`}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-canvas/60"
                >
                  <span className="min-w-0 flex-1 truncate text-body text-charcoal">{d.name}</span>
                  <VersionTag>{d.versions[0]?.label ?? "—"}</VersionTag>
                  <VisibilityMiniTag
                    visibility={d.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
                  />
                </Link>
              ))}
            </Card>
          </section>

          <section>
            <CardHead title="Updates and comments" className="mb-2.5" />
            <div className="flex flex-col gap-2.5">
              {project.updates.map((u) => (
                <Card key={u.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body font-medium text-charcoal">{u.title}</span>
                    <VisibilityMiniTag
                      visibility={u.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
                    />
                  </div>
                  <p className="mt-1 text-body text-steel">{u.body}</p>
                  <p className="mt-1.5 font-mono text-meta text-fog">
                    {u.author?.name} · {formatDateTime(u.createdAt)}
                  </p>
                </Card>
              ))}

              {project.comments.map((c) => (
                <Card key={c.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-meta font-medium text-charcoal">
                      {c.authorMember?.name ?? c.authorContact?.name}
                      {c.authorContact ? (
                        <span className="text-fog"> · {client.name}</span>
                      ) : null}
                    </span>
                    <VisibilityMiniTag
                      visibility={c.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
                    />
                  </div>
                  <p className="mt-1 text-body text-steel">{c.body}</p>
                  <p className="mt-1.5 font-mono text-meta text-fog">
                    {formatDateTime(c.createdAt)}
                  </p>
                </Card>
              ))}

              <CommentComposer
                projectId={project.id}
                clientSlug={slug}
                canPublish={member.canPublish}
                recipients={client.contacts.map((c) => c.name)}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

type Task = { id: string; milestoneId: string | null };

/** Tasks group under their milestone; the rest sit under the current phase. */
function groupTasks<T extends Task>(
  tasks: T[],
  milestones: { id: string; name: string }[],
  phases: { name: string; status: string }[],
) {
  const currentPhase = phases.find((p) => p.status === "DUE")?.name ?? "This phase";
  const groups: { label: string; tasks: T[] }[] = [];

  const loose = tasks.filter((t) => !t.milestoneId);
  if (loose.length) groups.push({ label: currentPhase, tasks: loose });

  for (const m of milestones) {
    const group = tasks.filter((t) => t.milestoneId === m.id);
    if (group.length) groups.push({ label: m.name, tasks: group });
  }
  return groups;
}
