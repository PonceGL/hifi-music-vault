"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "./bottom-sheet";
import { CONTEXT_MENU_ARIA_LABEL } from "./constants";

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

const MOBILE_BREAKPOINT = 640;
const APPROX_ITEM_HEIGHT = 40;
const APPROX_PADDING = 16;
const MENU_WIDTH = 220;
const MENU_GAP = 4;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return (): void => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export function FloatingContextMenu({
  trigger,
  actions,
  isOpen,
  onClose,
}: FloatingContextMenuProps): ReactElement {
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen || isMobile || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const approxHeight = actions.length * APPROX_ITEM_HEIGHT + APPROX_PADDING;
    const openUpward = rect.bottom + approxHeight > window.innerHeight;
    const openLeft = rect.left + MENU_WIDTH > window.innerWidth;

    setMenuStyle({
      top: openUpward ? undefined : rect.bottom + MENU_GAP,
      bottom: openUpward ? window.innerHeight - rect.top + MENU_GAP : undefined,
      left: openLeft ? undefined : rect.left,
      right: openLeft ? window.innerWidth - rect.right : undefined,
    });
  }, [isOpen, isMobile, actions.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return (): void => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleMouseDown = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return (): void => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, isMobile, onClose]);

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
