"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import type { ContextMenuAction } from "./floating-context-menu";
import { BOTTOM_SHEET_ARIA_LABEL, CANCEL_LABEL } from "./constants";

interface BottomSheetProps {
  isOpen: boolean;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function BottomSheet({
  isOpen,
  actions,
  onClose,
}: BottomSheetProps): ReactElement {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-50",
        "transition-opacity duration-200",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onMouseDown={onClose}
      />

      <div
        role="menu"
        aria-label={BOTTOM_SHEET_ARIA_LABEL}
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "rounded-t-2xl border-t border-[var(--color-border)]",
          "bg-[var(--color-surface-elevated)]",
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div
            aria-hidden="true"
            className="h-1 w-10 rounded-full bg-[var(--color-surface-overlay)]"
          />
        </div>

        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              role="menuitem"
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-5 py-4 text-base",
                "transition-colors duration-100",
                "hover:bg-[var(--color-surface-secondary)]",
                "focus:outline-none focus-visible:bg-[var(--color-surface-secondary)]",
                action.variant === "destructive"
                  ? "text-[var(--color-health-red)]"
                  : "text-[var(--color-text-primary)]",
              )}
            >
              {Icon && (
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              {action.label}
            </button>
          );
        })}

        <div className="mx-4 mb-6 mt-2 border-t border-[var(--color-border)] pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "w-full rounded-xl py-3.5 text-sm font-medium",
              "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]",
              "transition-colors duration-100",
            )}
          >
            {CANCEL_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
