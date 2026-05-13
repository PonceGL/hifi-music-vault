import type { ReactElement } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  VARIANT_ARIA_ROLE,
  VARIANT_ICON,
  VARIANT_ICON_CLASS,
  type ToastVariant,
} from "./constants";

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  variant,
  title,
  description,
  onClose,
}: ToastProps): ReactElement {
  const Icon = VARIANT_ICON[variant];
  const role = VARIANT_ARIA_ROLE[variant];

  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border border-border",
        "bg-surface-elevated px-4 py-3 shadow-md",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 h-4 w-4 shrink-0", VARIANT_ICON_CLASS[variant])}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="text-xs text-text-secondary">{description}</p>
        )}
      </div>

      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => onClose(id)}
        className={cn(
          "shrink-0 rounded-sm p-0.5 text-text-tertiary",
          "hover:text-text-primary transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
        )}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
