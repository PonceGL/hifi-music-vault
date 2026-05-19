"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";

export type SheetOverlayProps = ComponentPropsWithRef<
  typeof SheetPrimitive.Overlay
>;

export function SheetOverlay({
  className,
  ref,
  ...props
}: SheetOverlayProps): ReactElement {
  return (
    <SheetPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}
