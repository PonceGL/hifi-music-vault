"use client";

import type { ReactElement } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/useSidebar";
import { SidebarNavItem } from "./sidebar-nav-item/sidebar-nav-item";
import {
  NAV_ITEMS,
  SIDEBAR_NAV_ARIA_LABEL,
  TOGGLE_COLLAPSE_LABEL,
  TOGGLE_EXPAND_LABEL,
  STATS_TRACKS_LABEL,
  STATS_SPACE_LABEL,
} from "./constants";

export interface SidebarStats {
  trackCount: number;
  diskSpaceLabel: string;
}

export interface SidebarProps {
  stats?: SidebarStats;
}

export function Sidebar({ stats }: SidebarProps): ReactElement {
  const { isCollapsed, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={300}>
      <nav
        aria-label={SIDEBAR_NAV_ARIA_LABEL}
        className={cn(
          "flex h-full flex-col bg-sidebar-bg transition-all duration-200",
          isCollapsed ? "w-16" : "w-60",
        )}
      >
        {/* Navigation items */}
        <ul className={cn("flex flex-col gap-0.5 p-2", isCollapsed && "items-center")}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarNavItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            </li>
          ))}
        </ul>

        {/* Footer: library stats + collapse toggle */}
        <div className="mt-auto flex flex-col gap-1 border-t border-border p-2">
          {stats && !isCollapsed && (
            <div className="px-3 py-1">
              <p className="font-mono text-xs text-text-tertiary">
                {stats.trackCount} {STATS_TRACKS_LABEL}
              </p>
              <p className="font-mono text-xs text-text-tertiary">
                {stats.diskSpaceLabel} {STATS_SPACE_LABEL}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={toggle}
            aria-label={isCollapsed ? TOGGLE_EXPAND_LABEL : TOGGLE_COLLAPSE_LABEL}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm",
              "text-text-tertiary transition-colors duration-100",
              "hover:bg-sidebar-hover hover:text-text-primary",
              isCollapsed && "justify-center px-0",
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="size-4 shrink-0" />
                <span>{TOGGLE_COLLAPSE_LABEL}</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </TooltipProvider>
  );
}
