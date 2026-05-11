"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import type { VariantProps } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { SheetOverlay } from "./sheet-overlay";
import { SheetPortal } from "./sheet-portal";
import { sheetVariants } from "./sheet-variants";

export interface SheetContentProps
  extends ComponentPropsWithRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export function SheetContent({ side = "right", className, children, ref, ...props }: SheetContentProps): ReactElement {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-surface-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}
