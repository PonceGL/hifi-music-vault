"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/cn";

export type DialogTitleProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Title
>;

export function DialogTitle({
  className,
  ref,
  ...props
}: DialogTitleProps): ReactElement {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-text-primary",
        className,
      )}
      {...props}
    />
  );
}
