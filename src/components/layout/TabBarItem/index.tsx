"use client";

import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface TabBarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}

export function TabBarItem({
  icon: Icon,
  label,
  href,
  isActive,
}: TabBarItemProps): ReactElement {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
        "transition-colors duration-100",
        isActive
          ? "text-accent"
          : "text-text-secondary hover:text-text-primary",
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
