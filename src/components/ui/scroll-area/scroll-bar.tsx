"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/cn";

export type ScrollBarProps = ComponentPropsWithRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

export function ScrollBar({
  className,
  orientation = "vertical",
  ref,
  ...props
}: ScrollBarProps): ReactElement {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
