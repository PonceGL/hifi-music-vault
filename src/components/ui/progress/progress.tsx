"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/cn";

export type ProgressProps = ComponentPropsWithRef<typeof ProgressPrimitive.Root>;

export function Progress({ className, value, ref, ...props }: ProgressProps): ReactElement {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-surface-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-accent transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
