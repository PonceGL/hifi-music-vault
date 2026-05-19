"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";

export type SheetDescriptionProps = ComponentPropsWithRef<
  typeof SheetPrimitive.Description
>;

export function SheetDescription({
  className,
  ref,
  ...props
}: SheetDescriptionProps): ReactElement {
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  );
}
