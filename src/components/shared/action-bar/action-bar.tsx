"use client";

import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { CLEAR_SELECTION_LABEL, getSelectionLabel } from "./constants";

export interface ActionBarAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface ActionBarProps {
  selectedCount: number;
  actions: ActionBarAction[];
  onClearSelection: () => void;
}

export function ActionBar({
  selectedCount,
  actions,
  onClearSelection,
}: ActionBarProps): ReactElement {
  const isVisible = selectedCount > 0;

  return (
    <div
      role="toolbar"
      aria-label={getSelectionLabel(selectedCount)}
      aria-hidden={!isVisible}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "flex items-center gap-2 border-t border-border bg-surface-elevated px-4 py-3 shadow-md",
        "transition-transform duration-200 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
    >
      <span className="shrink-0 text-sm font-medium text-text-primary">
        {getSelectionLabel(selectedCount)}
      </span>

      <div className="flex-1" />

      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant === "destructive" ? "destructive" : "secondary"}
            size="sm"
            onClick={action.onClick}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        aria-label={CLEAR_SELECTION_LABEL}
        onClick={onClearSelection}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
