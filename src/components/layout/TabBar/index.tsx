"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import { TabBarItem } from "./TabBarItem";
import { TAB_ITEMS, TAB_BAR_ARIA_LABEL } from "./constants";

export function TabBar(): ReactElement {
  const pathname = usePathname();

  return (
    <nav
      aria-label={TAB_BAR_ARIA_LABEL}
      className="flex items-stretch border-t border-border bg-sidebar-bg pb-safe"
    >
      {TAB_ITEMS.map((item) => (
        <TabBarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  );
}
