"use client";

import type { ReactElement } from "react";
import { Music, Search, Settings, RefreshCw, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import {
  APP_NAME,
  APP_LOGO_ARIA_LABEL,
  SEARCH_PLACEHOLDER,
  SEARCH_SHORTCUT_HINT,
  SEARCH_TRIGGER_ARIA_LABEL,
  SYNC_LABEL,
  SYNC_ARIA_LABEL,
  SETTINGS_MENU_ARIA_LABEL,
  SETTINGS_LABEL,
  TOGGLE_THEME_LABEL_DARK,
  TOGGLE_THEME_LABEL_LIGHT,
} from "./constants";

export interface TopbarProps {
  isBlocked?: boolean;
  onSearchOpen?: () => void;
  onSyncStart?: () => void;
}

export function Topbar({
  isBlocked = false,
  onSearchOpen,
  onSyncStart,
}: TopbarProps): ReactElement {
  const { theme, setTheme } = useTheme();

  useSearchShortcut(onSearchOpen);

  const isDark = theme !== "light";

  return (
    <div
      className={cn(
        "flex h-14 items-center gap-4 border-b border-border bg-topbar-bg px-4 backdrop-blur-sm",
        isBlocked && "opacity-40 pointer-events-none",
      )}
    >
      {/* Logo / App name */}
      <div className="flex shrink-0 items-center gap-2" aria-label={APP_LOGO_ARIA_LABEL}>
        <Music aria-hidden="true" className="size-5 text-accent" />
        <span className="text-sm font-semibold text-text-primary">{APP_NAME}</span>
      </div>

      {/* Search trigger — opens search modal, not a real input */}
      <div className="mx-auto flex max-w-sm flex-1 items-center">
        <button
          type="button"
          aria-label={SEARCH_TRIGGER_ARIA_LABEL}
          onClick={onSearchOpen}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 text-sm text-text-tertiary",
            "transition-colors duration-100 hover:border-border-strong hover:bg-surface-elevated",
          )}
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="flex-1 text-left">{SEARCH_PLACEHOLDER}</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
            {SEARCH_SHORTCUT_HINT}
          </kbd>
        </button>
      </div>

      {/* Right section: sync + settings */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          aria-label={SYNC_ARIA_LABEL}
          onClick={onSyncStart}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {SYNC_LABEL}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={SETTINGS_MENU_ARIA_LABEL}>
              <Settings aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href="/settings">{SETTINGS_LABEL}</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? (
                <Sun aria-hidden="true" className="size-4" />
              ) : (
                <Moon aria-hidden="true" className="size-4" />
              )}
              {isDark ? TOGGLE_THEME_LABEL_LIGHT : TOGGLE_THEME_LABEL_DARK}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
