"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { DIALOG_CLOSE_LABEL } from "./dialog-constants";
import type { DialogVariant } from "./dialog-constants";
import { DialogOverlay } from "./dialog-overlay";
import { DialogPortal } from "./dialog-portal";

export interface DialogContentProps extends ComponentPropsWithRef<
  typeof DialogPrimitive.Content
> {
  variant?: DialogVariant;
  hideCloseButton?: boolean;
}

export function DialogContent({
  className,
  children,
  ref,
  variant = "confirmation",
  hideCloseButton,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: DialogContentProps): ReactElement {
  const preventEscape = variant === "critical" || variant === "in-progress";
  const preventOutside = variant !== "informative";
  const shouldHideCloseButton = hideCloseButton ?? preventEscape;

  return (
    <DialogPortal>
      <DialogOverlay variant={variant} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface-primary p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        onEscapeKeyDown={
          preventEscape
            ? (e) => {
                e.preventDefault();
                onEscapeKeyDown?.(e);
              }
            : onEscapeKeyDown
        }
        onInteractOutside={
          preventOutside
            ? (e) => {
                e.preventDefault();
                onInteractOutside?.(e);
              }
            : onInteractOutside
        }
        {...props}
      >
        {children}
        {!shouldHideCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-surface-elevated data-[state=open]:text-text-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">{DIALOG_CLOSE_LABEL}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
