"use client";

import type { ReactElement } from "react";
import type { HealthStatus } from "@/types/track";
import { HEALTH_COLOR, HEALTH_LABEL } from "@/lib/health";

export interface HealthBadgeProps {
  status: HealthStatus;
}

export function HealthBadge({ status }: HealthBadgeProps): ReactElement {
  const color = HEALTH_COLOR[status];
  const label = HEALTH_LABEL[status];

  return (
    <span
      role="status"
      aria-label={`Salud: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
