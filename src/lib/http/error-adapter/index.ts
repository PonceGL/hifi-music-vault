import axios, { type AxiosError } from "axios";
import type { AppHttpError, ErrorAdapter, HttpErrorCode } from "../types";

function resolveCodeFromStatus(status: number): HttpErrorCode {
  if (status === 400) return "HTTP_400";
  if (status === 401) return "HTTP_401";
  if (status === 403) return "HTTP_403";
  if (status === 404) return "HTTP_404";
  if (status === 409) return "HTTP_409";
  if (status === 422) return "HTTP_422";
  if (status >= 400 && status < 500) return "HTTP_4XX";
  if (status === 500) return "HTTP_500";
  if (status === 502) return "HTTP_502";
  if (status === 503) return "HTTP_503";
  if (status >= 500) return "HTTP_5XX";
  return "UNKNOWN";
}

function resolveAxiosCode(error: AxiosError): HttpErrorCode {
  if (axios.isCancel(error)) return "CANCELLED";
  if (error.code === "ECONNABORTED") return "TIMEOUT";
  if (error.response) return resolveCodeFromStatus(error.response.status);
  return "NETWORK_ERROR";
}

function extractMessage(error: AxiosError): string {
  // Prefer a message from the response body if the server sent one
  const responseData = error.response?.data as
    | { message?: string; error?: string }
    | undefined;

  return (
    responseData?.message ??
    responseData?.error ??
    error.message ??
    "HTTP request failed"
  );
}

/**
 * Normalizes Axios errors into the application's standard `AppHttpError`.
 *
 * Implementing the `ErrorAdapter` contract means that if Axios is ever
 * replaced, only this file changes — not a single call site in the app.
 */
export class AxiosErrorAdapter implements ErrorAdapter {
  normalize(
    error: unknown,
    source: "internal" | "external"
  ): AppHttpError {
    if (axios.isAxiosError(error)) {
      return {
        message: extractMessage(error),
        status: error.response?.status ?? null,
        code: resolveAxiosCode(error),
        source,
        originalError: error,
      };
    }

    // Non-Axios error (e.g. programming mistake, JSON parse error)
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return {
      message,
      status: null,
      code: "UNKNOWN",
      source,
      originalError: error,
    };
  }
}
