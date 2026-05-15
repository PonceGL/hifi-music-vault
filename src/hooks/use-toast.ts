import { toast as sonnerToast } from "sonner";
import { DISMISS_DURATION, MAX_VISIBLE_TOASTS } from "@/components/ui/toast/constants";

interface ToastOptions {
  description?: string;
}
interface ToastReturn {
    success: (title: string, options?: ToastOptions | undefined) => string | number;
    info: (title: string, options?: ToastOptions) => string | number;
    warning: (title: string, options?: ToastOptions) => string | number;
    error: (title: string, options?: ToastOptions) => string | number;
    dismiss: (id?: string | number) => void;
    MAX_VISIBLE_TOASTS: number;
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

export function useToast(): ToastReturn {
  return { success, info, warning, error, dismiss, MAX_VISIBLE_TOASTS };
}
