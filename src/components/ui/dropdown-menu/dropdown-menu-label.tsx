"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/cn";

export interface DropdownMenuLabelProps extends ComponentPropsWithRef<
  typeof DropdownMenuPrimitive.Label
> {
  inset?: boolean;
}

export function DropdownMenuLabel({
  className,
  inset,
  ref,
  ...props
}: DropdownMenuLabelProps): ReactElement {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}
