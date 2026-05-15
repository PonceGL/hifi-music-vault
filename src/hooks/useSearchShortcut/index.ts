"use client";

import { useEffect } from "react";

const SEARCH_SHORTCUT_KEY = "k";

export function useSearchShortcut(onActivate?: () => void): void {
  useEffect(() => {
    if (!onActivate) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === SEARCH_SHORTCUT_KEY && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onActivate();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return (): void => document.removeEventListener("keydown", handleKeyDown);
  }, [onActivate]);
}
