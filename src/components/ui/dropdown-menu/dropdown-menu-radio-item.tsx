"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Circle } from "lucide-react";

import { cn } from "@/lib/cn";

export type DropdownMenuRadioItemProps = ComponentPropsWithRef<
  typeof DropdownMenuPrimitive.RadioItem
>;

export function DropdownMenuRadioItem({
  className,
  children,
  ref,
  ...props
}: DropdownMenuRadioItemProps): ReactElement {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-surface-elevated focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
