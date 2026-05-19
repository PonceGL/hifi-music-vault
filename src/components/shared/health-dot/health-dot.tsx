"use client";

import type { ReactElement } from "react";
import type { HealthStatus } from "@/types/track";
import { Tooltip } from "@/components/ui/tooltip/tooltip";
import { TooltipContent } from "@/components/ui/tooltip/tooltip-content";
import { TooltipProvider } from "@/components/ui/tooltip/tooltip-provider";
import { TooltipTrigger } from "@/components/ui/tooltip/tooltip-trigger";
import { HEALTH_COLOR, HEALTH_LABEL } from "@/lib/health";

type HealthDotSize = "standard" | "large";

interface HealthDotProps {
  status: HealthStatus;
  size?: HealthDotSize;
}

const SIZE_STYLES: Record<
  HealthDotSize,
  { width: string; height: string; boxShadow?: string }
> = {
  standard: { width: "8px", height: "8px" },
  large: {
    width: "10px",
    height: "10px",
    boxShadow: "0 0 0 2px var(--color-surface-primary)",
  },
};

export function HealthDot({
  status,
  size = "standard",
}: HealthDotProps): ReactElement {
  const label = HEALTH_LABEL[status];
  const color = HEALTH_COLOR[status];
  const { width, height, boxShadow } = SIZE_STYLES[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label={`Salud: ${label.toLowerCase()}`}
            role="img"
            style={{ backgroundColor: color, width, height, boxShadow }}
            className="inline-block shrink-0 rounded-full"
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
