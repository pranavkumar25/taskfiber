import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { SourceBadge } from "@/components/ui/pill";
import { VisibilityMiniTag } from "@/components/ui/visibility";
import { formatDateTime, formatSince } from "@/server/format";
import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  actorName: string;
  actorIsClient: boolean;
  verb: string;
  objectName: string | null;
  detail: string | null;
  source: "DRIVE" | "PORTAL" | "EMAIL" | "WHATSAPP" | "SYSTEM";
  visibility: "INTERNAL" | "CLIENT_VISIBLE" | null;
  createdAt: Date;
};

/**
 * One line of the audit trail. Names and object titles are weighted; everything
 * else stays quiet, so a column of these reads as a narrative rather than a log.
 */
export function ActivityRow({
  item,
  compact,
  className,
}: {
  item: ActivityItem;
  /** The record\u2019s aside has no room for a full timestamp. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2.5 border-b border-canvas py-2 last:border-b-0", className)}>
      <Avatar name={item.actorName} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1 text-body text-steel">
        <p className="text-pretty">
          <span className="font-medium text-charcoal">{item.actorName}</span>
          {item.actorIsClient ? (
            <span className="text-fog"> (client)</span>
          ) : null}{" "}
          {item.verb}{" "}
          {item.objectName ? (
            <span className="font-medium text-charcoal">{item.objectName}</span>
          ) : null}
        </p>
        {item.detail ? <p className="mt-0.5 text-meta text-fog">{item.detail}</p> : null}
      </div>
      <div className={cn("flex shrink-0 items-start gap-2", compact && "flex-col items-end gap-1")}>
        {item.source === "DRIVE" ? (
          <SourceBadge className="h-4 px-1.5 text-[10px]">Drive</SourceBadge>
        ) : null}
        {item.visibility ? (
          <VisibilityMiniTag
            visibility={item.visibility === "CLIENT_VISIBLE" ? "client" : "internal"}
          />
        ) : null}
        <span className="font-mono text-meta whitespace-nowrap text-fog">
          {compact ? formatSince(item.createdAt) : formatDateTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}
