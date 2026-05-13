import type { HealthStatus } from "@/types/track";

export const HEALTH_COLOR: Record<HealthStatus, string> = {
  complete: "var(--color-health-green)",
  warning:  "var(--color-health-yellow)",
  alert:    "var(--color-health-orange)",
  critical: "var(--color-health-red)",
};

export const HEALTH_LABEL: Record<HealthStatus, string> = {
  complete: "Completo",
  warning:  "Falta: género",
  alert:    "Falta: álbum",
  critical: "Archivo corrupto",
};
