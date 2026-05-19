"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/cn";

export interface DropdownMenuItemProps extends ComponentPropsWithRef<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean;
}

export function DropdownMenuItem({
  className,
  inset,
  ref,
  ...props
}: DropdownMenuItemProps): ReactElement {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-surface-elevated focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}
