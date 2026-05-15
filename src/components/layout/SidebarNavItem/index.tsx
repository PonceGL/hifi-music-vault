"use client";

import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
}: SidebarNavItemProps): ReactElement {
  const link = (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium",
        "transition-colors duration-100",
        isActive
          ? "bg-sidebar-active text-accent"
          : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary",
        isCollapsed && "w-9 justify-center px-0",
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  if (!isCollapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
