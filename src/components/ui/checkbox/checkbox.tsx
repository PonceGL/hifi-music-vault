"use client";

import type { ComponentPropsWithoutRef, ReactElement } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export type CheckboxProps = ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

export function Checkbox({ className, ...props }: CheckboxProps): ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-border-focus ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-text-on-accent",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("grid place-content-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
