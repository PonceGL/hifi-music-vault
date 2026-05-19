import { CheckCircle2, Info, OctagonX, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export const DISMISS_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: Infinity,
};

export const MAX_VISIBLE_TOASTS = 3;

export const VARIANT_ARIA_ROLE: Record<ToastVariant, "status" | "alert"> = {
  success: "status",
  info: "status",
  warning: "status",
  error: "alert",
};

export const VARIANT_ICON: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: OctagonX,
};

export const VARIANT_ICON_CLASS: Record<ToastVariant, string> = {
  success: "text-health-green",
  info: "text-accent",
  warning: "text-health-yellow",
  error: "text-health-red",
};
