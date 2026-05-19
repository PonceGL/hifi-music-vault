"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/cn";
import { ScrollBar } from "./scroll-bar";

export type ScrollAreaProps = ComponentPropsWithRef<
  typeof ScrollAreaPrimitive.Root
>;

export function ScrollArea({
  className,
  children,
  ref,
  ...props
}: ScrollAreaProps): ReactElement {
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
