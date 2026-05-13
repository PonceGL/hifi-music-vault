import type { ReactElement } from "react";
import type { AudioFormat } from "@/types/track";
import { cn } from "@/lib/cn";
import { FORMAT_STYLES } from "./constants";

interface FormatBadgeProps {
  format: AudioFormat;
}

export function FormatBadge({ format }: FormatBadgeProps): ReactElement {
  const { textClass, bgClass } = FORMAT_STYLES[format];
  const label = format.toUpperCase();

  return (
    <span
      aria-label={`Formato: ${label}`}
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5",
        "font-mono text-xs font-medium uppercase",
        textClass,
        bgClass,
      )}
    >
      {label}
    </span>
  );
}
