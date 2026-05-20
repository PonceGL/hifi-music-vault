"use client";

import { useCallback, useRef, useState } from "react";
import { useOperationStore } from "@/store";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { PrescanResponseDto } from "@/app/api/sync/prescan/dtos/prescan.dto";
import type { SyncEvent } from "@/app/api/sync/dtos/sync.dto";
import type { SyncProgress, SyncResult, SyncStatus } from "@/types/sync";

interface PrescanApiResponse {
  data: PrescanResponseDto;
}

export interface UseSyncReturn {
  phase: SyncStatus;
  prescanData: PrescanResponseDto | null;
  progress: SyncProgress | null;
  result: SyncResult | null;
  error: string | null;
  startPrescan: () => Promise<void>;
  confirmSync: () => void;
  cancelSync: () => void;
  dismiss: () => void;
}

export function useSync(): UseSyncReturn {
  const [phase, setPhase] = useState<SyncStatus>("idle");
  const [prescanData, setPrescanData] = useState<PrescanResponseDto | null>(
    null,
  );
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { startSync, clearOperation } = useOperationStore();

  const startPrescan = useCallback(async () => {
    setPhase("prescanning");
    setPrescanData(null);
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      const response = await apiClient(API_ROUTES.sync.prescan, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Prescan failed with status ${response.status.toString()}`,
        );
      }

      const json = (await response.json()) as PrescanApiResponse;
      startSync();
      setPrescanData(json.data);
      setPhase("confirming");
    } catch (err) {
      setError((err as Error).message);
      setPhase("error");
    }
  }, [startSync]);

  const confirmSync = useCallback(() => {
    if (phase !== "confirming") return;

    setPhase("running");
    setProgress(null);

    const abort = new AbortController();
    abortRef.current = abort;

    void (async () => {
      try {
        const response = await fetch(API_ROUTES.sync.stream, {
          signal: abort.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(
            `Sync stream failed with status ${response.status.toString()}`,
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            const dataLine = chunk
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const raw = dataLine.slice("data: ".length).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as SyncEvent;

              if (event.type === "progress") {
                setProgress(event.data);
              } else if (event.type === "complete") {
                setResult(event.data);
                clearOperation();
                setPhase("completed");
              } else if (event.type === "cancelled") {
                clearOperation();
                setPhase("cancelled");
              } else if (event.type === "error") {
                clearOperation();
                setError(event.data.message);
                setPhase("error");
              }
            } catch {
              // ignore malformed SSE data
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        clearOperation();
        setError((err as Error).message);
        setPhase("error");
      }
    })();
  }, [phase, clearOperation]);

  const cancelSync = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearOperation();
    setPhase("cancelled");
  }, [clearOperation]);

  const dismiss = useCallback(() => {
    setPhase("idle");
    setPrescanData(null);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    phase,
    prescanData,
    progress,
    result,
    error,
    startPrescan,
    confirmSync,
    cancelSync,
    dismiss,
  };
}
