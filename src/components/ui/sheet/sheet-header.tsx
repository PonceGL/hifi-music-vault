import type { HTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/cn";

export type SheetHeaderProps = HTMLAttributes<HTMLDivElement>;

export function SheetHeader({
  className,
  ...props
}: SheetHeaderProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}
