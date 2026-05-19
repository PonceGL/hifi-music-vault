import type { HTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/cn";

export type SheetFooterProps = HTMLAttributes<HTMLDivElement>;

export function SheetFooter({
  className,
  ...props
}: SheetFooterProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}
