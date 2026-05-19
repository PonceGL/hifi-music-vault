"use client";

import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "./bottom-sheet";
import { CONTEXT_MENU_ARIA_LABEL } from "./constants";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMenuPosition } from "@/hooks/useMenuPosition";

export interface ContextMenuAction {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  onClick: () => void;
}

export interface FloatingContextMenuProps {
  trigger: ReactNode;
  actions: ContextMenuAction[];
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingContextMenu({
  trigger,
  actions,
  isOpen,
  onClose,
}: FloatingContextMenuProps): ReactElement {
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const menuStyle = useMenuPosition(
    triggerRef,
    isOpen,
    isMobile,
    actions.length,
  );

  useEscapeKey(isOpen, onClose);
  useClickOutside([menuRef, triggerRef], isOpen && !isMobile, onClose);

  if (isMobile) {
    return (
      <>
        <div ref={triggerRef}>{trigger}</div>
        <BottomSheet isOpen={isOpen} actions={actions} onClose={onClose} />
      </>
    );
  }

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={CONTEXT_MENU_ARIA_LABEL}
          style={{ position: "fixed", ...menuStyle }}
          className={cn(
            "z-50 min-w-[200px] overflow-hidden",
            "rounded-md border border-border bg-surface-elevated",
            "py-1 shadow-lg",
          )}
        >
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
                  "flex w-full items-center gap-3 px-3 py-2 text-sm",
                  "transition-colors duration-100",
                  "hover:bg-surface-secondary",
                  "focus:outline-none focus-visible:bg-surface-secondary",
                  action.variant === "destructive"
                    ? "text-health-red"
                    : "text-text-primary",
                )}
              >
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
