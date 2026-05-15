"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Progress } from "@/components/ui/progress/progress";
import { Button } from "@/components/ui/button";
import { CANCEL_LABEL, PAUSE_LABEL, SHELL_BLOCKABLE_SELECTOR } from "./constants";

export interface ProgressOverlayProps {
  isActive: boolean;
  progress: number | null;
  label: string;
  sublabel?: string;
  onCancel?: () => void;
  onPause?: () => void;
}

export function ProgressOverlay({
  isActive,
  progress,
  label,
  sublabel,
  onCancel,
  onPause,
}: ProgressOverlayProps): ReactElement {
  // TODO(MFM-shell-store): replace this DOM manipulation with a Zustand store
  // (useShellStore → isBlocked / setIsBlocked). AppShell will read isBlocked
  // declaratively. Tracked in ÉPICA — Gestión de Estado Global.
  useEffect(() => {
    const elements = document.querySelectorAll(SHELL_BLOCKABLE_SELECTOR);

    elements.forEach((el) => {
      if (isActive) {
        el.classList.add("opacity-40", "pointer-events-none");
      } else {
        el.classList.remove("opacity-40", "pointer-events-none");
      }
    });

    return () => {
      elements.forEach((el) => {
        el.classList.remove("opacity-40", "pointer-events-none");
      });
    };
  }, [isActive]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-hidden={!isActive}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-6 px-8",
        !isActive && "hidden",
      )}
    >
      <div className="w-full max-w-md space-y-3">
        <p className="text-center text-sm font-medium text-text-primary">
          {label}
        </p>

        <Progress
          value={progress !== null ? progress : undefined}
          aria-label={label}
        />

        {sublabel && (
          <p className="text-center font-mono text-xs text-text-secondary">
            {sublabel}
          </p>
        )}
      </div>

      {(onCancel || onPause) && (
        <div className="flex gap-3">
          {onPause && (
            <Button variant="secondary" onClick={onPause}>
              {PAUSE_LABEL}
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {CANCEL_LABEL}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
