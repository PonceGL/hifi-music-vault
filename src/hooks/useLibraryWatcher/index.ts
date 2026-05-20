"use client";

import { useEffect } from "react";
import { useRevalidation } from "@/hooks/useRevalidation";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { WatchEvent } from "@/types/watch";

export function useLibraryWatcher(): void {
  const { revalidate } = useRevalidation();

  useEffect(() => {
    const abort = new AbortController();

    async function connect(): Promise<void> {
      try {
        const response = await fetch(API_ROUTES.library.watch, {
          signal: abort.signal,
        });

        if (!response.ok || !response.body) return;

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
              JSON.parse(raw) as WatchEvent;
              void revalidate();
            } catch {
              // ignore malformed SSE data
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    void connect();

    return () => {
      abort.abort();
    };
  }, [revalidate]);
}
