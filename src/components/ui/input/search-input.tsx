import type { InputHTMLAttributes, ReactElement } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "./input";
import { SEARCH_PLACEHOLDER, SEARCH_SHORTCUT_LABEL } from "./constants";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function SearchInput({
  className,
  ...props
}: SearchInputProps): ReactElement {
  return (
    <div className="relative flex w-full items-center">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--color-text-tertiary)]"
      />
      <Input
        type="search"
        placeholder={SEARCH_PLACEHOLDER}
        className={cn("h-10 pl-9 pr-14", className)}
        {...props}
      />
      <kbd
        aria-label={`Atajo de teclado: ${SEARCH_SHORTCUT_LABEL}`}
        className={cn(
          "pointer-events-none absolute right-3",
          "rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
          "px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-tertiary)]",
        )}
      >
        {SEARCH_SHORTCUT_LABEL}
      </kbd>
    </div>
  );
}
