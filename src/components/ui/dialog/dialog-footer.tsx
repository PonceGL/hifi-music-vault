import type { HTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/cn";

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function DialogFooter({
  className,
  ...props
}: DialogFooterProps): ReactElement {
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
