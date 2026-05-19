"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";

export type DialogDescriptionProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Description
>;

export function DialogDescription({
  className,
  ref,
  ...props
}: DialogDescriptionProps): ReactElement {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  );
}
