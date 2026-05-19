import type { HTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/cn";

export type DropdownMenuShortcutProps = HTMLAttributes<HTMLSpanElement>;

export function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps): ReactElement {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
}
