import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-text-on-accent hover:bg-accent/80",
        secondary:
          "border-transparent bg-surface-secondary text-text-primary hover:bg-surface-secondary/80",
        destructive:
          "border-transparent bg-[var(--color-error)] text-text-on-accent hover:bg-[var(--color-error)]/80",
        outline: "text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
