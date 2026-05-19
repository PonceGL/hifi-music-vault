"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";

export type SheetTitleProps = ComponentPropsWithRef<
  typeof SheetPrimitive.Title
>;

export function SheetTitle({
  className,
  ref,
  ...props
}: SheetTitleProps): ReactElement {
  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-text-primary", className)}
      {...props}
    />
  );
}
