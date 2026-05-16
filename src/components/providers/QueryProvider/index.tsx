"use client";

import { useState, type ReactElement } from "react";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Creates a new QueryClient with defaults tuned for a local desktop app.
 *
 * - staleTime 2 min: library data only changes when the user triggers a sync,
 *   so frequent background refetches are unnecessary.
 * - gcTime 10 min: keeps cached data available while navigating between views.
 * - retry 1: our API is local, repeated retries rarely recover from an error.
 * - refetchOnWindowFocus false: focus-based refetching is useful for live
 *   dashboards but adds noise in a desktop-focused, single-user app.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/**
 * Wraps the application with `QueryClientProvider`.
 *
 * Uses `useState` to create the `QueryClient` so that:
 * - Each SSR render gets its own client (no shared state between requests).
 * - The browser reuses the same client across re-renders (stable cache).
 *
 * Dev tools are only mounted in development builds and do not affect
 * production bundle size.
 */
export function QueryProvider({ children }: PropsWithChildren): ReactElement {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
