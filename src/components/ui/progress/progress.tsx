"use client";

import type { ReactElement } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";

export interface ProgressProps {
  value?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function Progress({
  value,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
}: ProgressProps): ReactElement {
  const isDeterminate = value !== undefined;
  const clamped = isDeterminate ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ProgressPrimitive.Root
        value={isDeterminate ? clamped : null}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-mode={isDeterminate ? "determinate" : "indeterminate"}
        className="relative h-2 w-full overflow-hidden rounded-full bg-surface-secondary"
      >
        {isDeterminate ? (
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full rounded-full",
              "bg-gradient-to-r from-accent via-accent-hover to-accent",
              "bg-[length:200%_100%] animate-shimmer",
              "transition-[width] duration-300 ease-out",
            )}
            style={{ width: `${clamped}%` }}
          />
        ) : (
          <div className="absolute h-full w-[30%] rounded-full bg-accent animate-progress-indeterminate" />
        )}
      </ProgressPrimitive.Root>

      {isDeterminate && (
        <span className="shrink-0 font-mono text-xs tabular-nums text-text-secondary">
          {clamped}%
        </span>
      )}
    </div>
  );
}
