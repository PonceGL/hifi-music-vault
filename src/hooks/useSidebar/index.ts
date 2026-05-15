"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 1280px)";

export interface UseSidebarReturn {
  isCollapsed: boolean;
  toggle: () => void;
}

function getInitialIsCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia(DESKTOP_QUERY).matches) return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function useSidebar(): UseSidebarReturn {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(getInitialIsCollapsed);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);

    const handleChange = ({ matches }: MediaQueryListEvent): void => {
      if (matches) setIsCollapsed(false);
    };

    mq.addEventListener("change", handleChange);
    return (): void => mq.removeEventListener("change", handleChange);
  }, []);

  function toggle(): void {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return { isCollapsed, toggle };
}
