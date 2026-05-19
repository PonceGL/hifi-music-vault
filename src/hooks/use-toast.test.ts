import { renderHook } from "@testing-library/react";
import { useToast } from "./use-toast";
import {
  DISMISS_DURATION,
  MAX_VISIBLE_TOASTS,
} from "@/components/ui/toast/constants";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}));

import { toast as sonnerToast } from "sonner";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useToast", () => {
  describe("success", () => {
    it("calls sonner.toast.success with correct duration", () => {
      const { result } = renderHook(() => useToast());
      result.current.success("Guardado");
      expect(sonnerToast.success).toHaveBeenCalledWith("Guardado", {
        description: undefined,
        duration: DISMISS_DURATION.success,
      });
    });

    it("passes description when provided", () => {
      const { result } = renderHook(() => useToast());
      result.current.success("Guardado", { description: "En biblioteca" });
      expect(sonnerToast.success).toHaveBeenCalledWith("Guardado", {
        description: "En biblioteca",
        duration: DISMISS_DURATION.success,
      });
    });
  });

  describe("error", () => {
    it("calls sonner.toast.error with Infinity duration", () => {
      const { result } = renderHook(() => useToast());
      result.current.error("Error crítico");
      expect(sonnerToast.error).toHaveBeenCalledWith("Error crítico", {
        description: undefined,
        duration: Infinity,
      });
    });
  });

  describe("warning", () => {
    it("calls sonner.toast.warning with 6s duration", () => {
      const { result } = renderHook(() => useToast());
      result.current.warning("Advertencia");
      expect(sonnerToast.warning).toHaveBeenCalledWith("Advertencia", {
        description: undefined,
        duration: DISMISS_DURATION.warning,
      });
    });
  });

  describe("info", () => {
    it("calls sonner.toast.info with 4s duration", () => {
      const { result } = renderHook(() => useToast());
      result.current.info("Información");
      expect(sonnerToast.info).toHaveBeenCalledWith("Información", {
        description: undefined,
        duration: DISMISS_DURATION.info,
      });
    });
  });

  describe("dismiss", () => {
    it("calls sonner.toast.dismiss with id", () => {
      const { result } = renderHook(() => useToast());
      result.current.dismiss("toast-42");
      expect(sonnerToast.dismiss).toHaveBeenCalledWith("toast-42");
    });

    it("calls sonner.toast.dismiss without id to dismiss all", () => {
      const { result } = renderHook(() => useToast());
      result.current.dismiss();
      expect(sonnerToast.dismiss).toHaveBeenCalledWith(undefined);
    });
  });

  describe("MAX_VISIBLE_TOASTS", () => {
    it("exposes the MAX_VISIBLE_TOASTS constant", () => {
      const { result } = renderHook(() => useToast());
      expect(result.current.MAX_VISIBLE_TOASTS).toBe(MAX_VISIBLE_TOASTS);
    });
  });
});
