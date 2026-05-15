"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress/progress";
import {
  BANNER_ARIA_LABEL,
  BANNER_TEXT_PREFIX,
  PROGRESS_ARIA_LABEL,
  CANCEL_LABEL,
} from "./constants";

export interface ArtworkOptimizationBannerProps {
  isVisible: boolean;
  progress: number;
  current: number;
  total: number;
  onCancel: () => void;
}

export function ArtworkOptimizationBanner({
  isVisible,
  progress,
  current,
  total,
  onCancel,
}: ArtworkOptimizationBannerProps): ReactElement {
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
        aria-label={BANNER_ARIA_LABEL}
        className={cn(
          "flex h-8 items-center gap-3 border-b border-border bg-surface-secondary px-4",
          "transition-transform duration-200 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <span className="shrink-0 text-xs text-text-secondary">
          {BANNER_TEXT_PREFIX}{" "}
          <span className="font-mono text-text-primary">
            ({current}/{total})
          </span>
        </span>

        <div className="flex-1">
          <Progress
            value={progress}
            size="sm"
            showPercentage={false}
            aria-label={PROGRESS_ARIA_LABEL}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={onCancel}>
          {CANCEL_LABEL}
        </Button>
      </div>
    </div>
  );
}
