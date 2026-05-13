import { toast as sonnerToast } from "sonner";
import { DISMISS_DURATION, MAX_VISIBLE_TOASTS } from "@/components/ui/toast/constants";

interface ToastOptions {
  description?: string;
}

function success(title: string, options?: ToastOptions): string | number {
  return sonnerToast.success(title, {
    description: options?.description,
    duration: DISMISS_DURATION.success,
  });
}

function info(title: string, options?: ToastOptions): string | number {
  return sonnerToast.info(title, {
    description: options?.description,
    duration: DISMISS_DURATION.info,
  });
}

function warning(title: string, options?: ToastOptions): string | number {
  return sonnerToast.warning(title, {
    description: options?.description,
    duration: DISMISS_DURATION.warning,
  });
}

function error(title: string, options?: ToastOptions): string | number {
  return sonnerToast.error(title, {
    description: options?.description,
    duration: DISMISS_DURATION.error,
  });
}

function dismiss(id?: string | number): void {
  sonnerToast.dismiss(id);
}

export function useToast() {
  return { success, info, warning, error, dismiss, MAX_VISIBLE_TOASTS };
}
