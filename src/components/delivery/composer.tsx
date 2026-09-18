"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { VisibilitySwitch, type Visibility } from "@/components/ui/visibility";
import { postCommentAction } from "@/server/actions";
import { cn } from "@/lib/utils";

/**
 * The comment composer.
 *
 * It changes shape with its audience, deliberately: internal is a dashed,
 * unremarkable box; client-visible is a solid, elevated card with a blue submit
 * and a line naming exactly who will be notified. The affordance is the warning
 * — you cannot post to a client while the control still looks like a note.
 */
export function CommentComposer({
  projectId,
  clientSlug,
  recipients,
  canPublish,
}: {
  projectId: string;
  clientSlug: string;
  recipients: string[];
  canPublish: boolean;
}) {
  const [visibility, setVisibility] = React.useState<Visibility>("internal");
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const toClient = visibility === "client";
  const ready = body.trim().length > 0;

  function submit() {
    if (!ready) return;
    startTransition(async () => {
      await postCommentAction({
        projectId,
        body,
        visibility: toClient ? "CLIENT_VISIBLE" : "INTERNAL",
        clientSlug,
      });
      setBody("");
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg p-3",
        toClient
          ? "border border-ash bg-surface shadow-card"
          : "border border-dashed border-fog bg-surface",
      )}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          toClient
            ? `Write to the client… they will be notified`
            : "Write a comment… @ to mention"
        }
        className="min-h-9 resize-y border-0 p-0 shadow-none focus:shadow-none"
      />

      {toClient ? (
        <p className="mt-2 text-meta text-steel">
          Visible to {recipients.join(", ")}.
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <VisibilitySwitch
          value={visibility}
          onChange={setVisibility}
          size="xs"
          disabled={!canPublish}
        />
        <Button
          variant={toClient ? "primary" : "neutral"}
          size="sm"
          disabled={!ready || pending}
          onClick={submit}
        >
          {toClient ? "Post to client" : "Comment"}
        </Button>
      </div>
    </div>
  );
}
