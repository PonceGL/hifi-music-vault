import type { InputHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/cn";

type InputState = "error" | "warning" | "default";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  warning?: string;
}

function resolveState(error?: string, warning?: string): InputState {
  if (error) return "error";
  if (warning) return "warning";
  return "default";
}

const STATE_BORDER: Record<InputState, string> = {
  default: "border-[var(--color-border)] focus-visible:border-[var(--color-accent)]",
  error:   "border-[var(--color-health-red)]",
  warning: "border-[var(--color-health-yellow)]",
};

export function Input({
  className,
  type,
  error,
  warning,
  ...props
}: InputProps): ReactElement {
  const state = resolveState(error, warning);

  return (
    <div className="flex w-full flex-col gap-1">
      <input
        type={type}
        data-state={state}
        className={cn(
          "h-9 w-full rounded-md border bg-[var(--color-surface-secondary)] px-3 text-sm",
          "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          STATE_BORDER[state],
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-health-red)]" role="alert">
          {error}
        </p>
      )}
      {!error && warning && (
        <p className="text-xs text-[var(--color-health-yellow)]" role="status">
          {warning}
        </p>
      )}
    </div>
  );
}
