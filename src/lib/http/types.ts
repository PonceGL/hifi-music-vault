// ─── Request / Response ───────────────────────────────────────────────────────

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// ─── Error ────────────────────────────────────────────────────────────────────

/**
 * Standardized HTTP error codes used across the entire application.
 * Every error that crosses the HTTP boundary — whether from our internal API
 * or from an external service — is mapped to one of these codes.
 */
export type HttpErrorCode =
  | "NETWORK_ERROR" // No response received (offline, DNS, CORS)
  | "TIMEOUT" // Request exceeded the configured timeout
  | "CANCELLED" // Request was cancelled via AbortSignal
  | "HTTP_400"
  | "HTTP_401"
  | "HTTP_403"
  | "HTTP_404"
  | "HTTP_409"
  | "HTTP_422"
  | "HTTP_4XX" // Any other 4xx not listed above
  | "HTTP_500"
  | "HTTP_502"
  | "HTTP_503"
  | "HTTP_5XX" // Any other 5xx not listed above
  | "UNKNOWN"; // Anything that doesn't fit the categories above

/**
 * The single error shape that all HTTP calls produce, regardless of:
 * - which HTTP library is being used under the hood
 * - whether the call targets our own API (`internal`) or a third-party (`external`)
 *
 * Consumers never inspect Axios errors, fetch Responses, or raw exceptions —
 * they always receive an `AppHttpError`.
 */
export interface AppHttpError {
  message: string;
  status: number | null;
  code: HttpErrorCode;
  source: "internal" | "external";
  originalError?: unknown;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

/**
 * The error normalization contract.
 * Concrete implementations translate library-specific error shapes into
 * `AppHttpError`. Swap the library → swap the adapter — no changes elsewhere.
 */
export interface ErrorAdapter {
  normalize(error: unknown, source: "internal" | "external"): AppHttpError;
}

/**
 * The HTTP client contract.
 * All application code that needs to make HTTP calls depends on this interface,
 * never on a concrete implementation (Axios, fetch, ky, etc.).
 */
export interface HttpClient {
  get<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;

  delete<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
}
