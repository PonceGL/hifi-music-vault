"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { Progress } from "@/components/ui/progress/progress";
import { useOperationStore } from "@/store/useOperationStore";
import {
  REVALIDATION_BAR_ARIA_LABEL,
  REVALIDATION_BAR_LABEL,
  REVALIDATION_BAR_PROGRESS_ARIA_LABEL,
} from "./constants";

export function RevalidationProgressBar(): ReactElement {
  const { operationInProgress } = useOperationStore();
  const isVisible = operationInProgress === "revalidation";

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "w-full overflow-hidden",
        "transition-[max-height] duration-200 ease-in-out",
        isVisible ? "max-h-8" : "max-h-0",
      )}
    >
      <div
        role="status"
        aria-label={REVALIDATION_BAR_ARIA_LABEL}
        className="flex h-8 items-center gap-3 border-b border-border bg-surface-secondary px-4"
      >
        <span className="shrink-0 text-xs text-text-secondary">
          {REVALIDATION_BAR_LABEL}
        </span>
        <div className="flex-1">
          <Progress
            aria-label={REVALIDATION_BAR_PROGRESS_ARIA_LABEL}
            size="sm"
            showPercentage={false}
          />
        </div>
      </div>
    </div>
  );
}
