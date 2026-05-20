"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOperationStore } from "@/store";
import { internalHttpClient } from "@/lib/http";
import { API_ROUTES } from "@/lib/apiRoutes";

export interface UseRevalidationReturn {
  revalidate: () => Promise<void>;
  isRevalidating: boolean;
}

export function useRevalidation(): UseRevalidationReturn {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const isRevalidatingRef = useRef(false);
  const { startRevalidation, clearOperation } = useOperationStore();
  const queryClient = useQueryClient();

  const revalidate = useCallback(async () => {
    if (isRevalidatingRef.current) return;
    isRevalidatingRef.current = true;
    setIsRevalidating(true);
    startRevalidation();

    try {
      await internalHttpClient.get(API_ROUTES.library.index);
      await queryClient.invalidateQueries({ queryKey: ["library"] });
    } catch {
      // revalidation errors are non-fatal — UI recovers on next trigger
    } finally {
      isRevalidatingRef.current = false;
      clearOperation();
      setIsRevalidating(false);
    }
  }, [startRevalidation, clearOperation, queryClient]);

  return { revalidate, isRevalidating };
}
