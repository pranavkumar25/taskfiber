"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/field";
import { StatusDot, toneForStatus } from "@/components/ui/pill";
import { VisibilitySwitch, visibilityRowClass } from "@/components/ui/visibility";
import { setVisibilityAction } from "@/server/actions";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  WAITING: "Waiting",
  AT_RISK: "At risk",
  DONE: "Done",
};

/**
 * A task row. Internal by default, with the same two-position control and the
 * same `P` shortcut hint as the slide-over, so publishing means one thing
 * everywhere.
 */
export function TaskRow({
  task,
  clientSlug,
  canPublish,
}: {
  task: {
    id: string;
    name: string;
    status: string;
    completed: boolean;
    visibility: "INTERNAL" | "CLIENT_VISIBLE";
    owner: { name: string } | null;
  };
  clientSlug: string;
  canPublish: boolean;
}) {
  const [visibility, setVisibility] = React.useState<"internal" | "client">(
    task.visibility === "CLIENT_VISIBLE" ? "client" : "internal",
  );
  const [, startTransition] = React.useTransition();

  function change(next: "internal" | "client") {
    setVisibility(next);
    startTransition(() =>
      setVisibilityAction({
        entity: "task",
        id: task.id,
        visibility: next === "client" ? "CLIENT_VISIBLE" : "INTERNAL",
        clientSlug,
      }),
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-control py-1.5 pr-1 pl-2.5",
        visibilityRowClass(visibility),
      )}
    >
      <Checkbox checked={task.completed} label={task.name} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-body",
          task.completed && "text-steel line-through",
        )}
      >
        {task.name}
      </span>
      <span className="hidden w-28 shrink-0 truncate text-meta text-steel sm:block">
        {task.owner?.name ?? "Unassigned"}
      </span>
      <span className="flex w-24 shrink-0 items-center gap-1.5 text-meta text-steel">
        <StatusDot tone={toneForStatus(STATUS_LABEL[task.status] ?? task.status)} />
        {STATUS_LABEL[task.status] ?? task.status}
      </span>
      <VisibilitySwitch value={visibility} onChange={change} size="sm" disabled={!canPublish} />
    </div>
  );
}
