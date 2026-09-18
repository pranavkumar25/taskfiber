"use client";

import * as React from "react";
import { VisibilitySwitch } from "@/components/ui/visibility";
import { setVisibilityAction } from "@/server/actions";

/** The project-level 1a switch, on the detail header where there is room. */
export function ProjectVisibility({
  projectId,
  clientSlug,
  initial,
  canPublish,
}: {
  projectId: string;
  clientSlug: string;
  initial: "INTERNAL" | "CLIENT_VISIBLE";
  canPublish: boolean;
}) {
  const [value, setValue] = React.useState<"internal" | "client">(
    initial === "CLIENT_VISIBLE" ? "client" : "internal",
  );
  const [, startTransition] = React.useTransition();

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="label-caps">Project visibility</span>
      <VisibilitySwitch
        value={value}
        disabled={!canPublish}
        onChange={(next) => {
          setValue(next);
          startTransition(() =>
            setVisibilityAction({
              entity: "project",
              id: projectId,
              visibility: next === "client" ? "CLIENT_VISIBLE" : "INTERNAL",
              clientSlug,
            }),
          );
        }}
      />
    </div>
  );
}
