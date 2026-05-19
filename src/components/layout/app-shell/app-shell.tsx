"use client";

import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  DETAIL_PANEL_ARIA_LABEL,
  SIDEBAR_ARIA_LABEL,
  MAIN_CONTENT_LABEL,
} from "./constants";

export interface AppShellProps extends PropsWithChildren {
  sidebar: ReactNode;
  topbar: ReactNode;
  tabBar: ReactNode;
  detailPanel?: ReactNode;
  artworkBanner?: ReactNode;
  isBlocked?: boolean;
}

export function AppShell({
  sidebar,
  topbar,
  tabBar,
  detailPanel,
  artworkBanner,
  children,
  isBlocked = false,
}: AppShellProps): ReactElement {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile (<640px), always visible sm+ */}
      <aside
        data-shell-blockable
        aria-label={SIDEBAR_ARIA_LABEL}
        className={cn(
          "hidden sm:flex flex-col shrink-0 border-r border-border bg-sidebar-bg transition-opacity duration-200",
          isBlocked && "opacity-40 pointer-events-none",
        )}
      >
        {sidebar}
      </aside>

      {/* Main column: topbar + optional banner + content + tab bar */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header
          data-shell-blockable
          className={cn(
            "shrink-0 transition-opacity duration-200",
            isBlocked && "opacity-40 pointer-events-none",
          )}
        >
          {topbar}
        </header>

        {/* Artwork optimization banner — non-blocking, slim strip */}
        {artworkBanner && <div className="shrink-0">{artworkBanner}</div>}

        {/* Content row: main area + optional detail panel */}
        <div className="flex flex-1 overflow-hidden">
          <main
            aria-label={MAIN_CONTENT_LABEL}
            className="flex-1 overflow-auto"
          >
            {children}
          </main>

          {/* Detail panel — desktop only (≥1280px) */}
          {detailPanel && (
            <aside
              aria-label={DETAIL_PANEL_ARIA_LABEL}
              className="hidden xl:flex w-80 shrink-0 flex-col overflow-hidden border-l border-border"
            >
              {detailPanel}
            </aside>
          )}
        </div>

        {/* Tab bar — mobile only (<640px) */}
        <div className="shrink-0 sm:hidden">{tabBar}</div>
      </div>
    </div>
  );
}
