import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Signup and onboarding progress. Done is filled, current is ringed, the rest wait. */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  /** Zero-based index of the step in progress. */
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <React.Fragment key={label}>
            <li className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold",
                  done && "bg-charcoal text-white",
                  now && "border-[1.5px] border-electric text-electric",
                  !done && !now && "border-[1.5px] border-smoke text-steel",
                )}
              >
                {done ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-meta",
                  now ? "font-medium text-charcoal" : done ? "text-charcoal" : "text-steel",
                )}
              >
                {label}
              </span>
            </li>
            {i < steps.length - 1 ? (
              <span className={cn("h-px flex-1", done ? "bg-charcoal" : "bg-ash")} />
            ) : null}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
