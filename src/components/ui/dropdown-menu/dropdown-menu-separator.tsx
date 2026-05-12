"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/cn";

export type DropdownMenuSeparatorProps = ComponentPropsWithRef<typeof DropdownMenuPrimitive.Separator>;

export function DropdownMenuSeparator({ className, ref, ...props }: DropdownMenuSeparatorProps): ReactElement {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-surface-secondary", className)}
      {...props}
    />
  );
}
