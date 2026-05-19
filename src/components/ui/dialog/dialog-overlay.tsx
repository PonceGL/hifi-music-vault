"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";
import { DIALOG_OVERLAY_CLASSES } from "./dialog-constants";
import type { DialogVariant } from "./dialog-constants";

export interface DialogOverlayProps extends ComponentPropsWithRef<
  typeof DialogPrimitive.Overlay
> {
  variant?: DialogVariant;
}

export function DialogOverlay({
  className,
  variant = "confirmation",
  ref,
  ...props
}: DialogOverlayProps): ReactElement {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        DIALOG_OVERLAY_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
