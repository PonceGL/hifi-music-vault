import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  );
}
