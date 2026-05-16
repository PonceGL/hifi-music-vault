import axios from "axios";
import { AxiosHttpClient } from "./axios-adapter";
import { AxiosErrorAdapter } from "./error-adapter";
import type { HttpClient } from "./types";

export type { HttpClient, HttpResponse, RequestConfig } from "./types";
export type { AppHttpError, HttpErrorCode, ErrorAdapter } from "./types";

/**
 * Factory that assembles a fully configured `HttpClient`.
 *
 * This is the only place in the codebase that knows which concrete HTTP
 * library is being used. Everything outside this file depends exclusively
 * on the `HttpClient` interface.
 *
 * @param baseURL - Base URL prepended to all requests made by this client.
 *   Use `"/"` for internal API calls (routes under `/api/`).
 *   Use the full origin for external services (`"https://musicbrainz.org"`).
 * @param source - Labels errors produced by this client.
 *   `"internal"` for our own Next.js API; `"external"` for third-party APIs.
 */
export function createHttpClient(
  baseURL: string,
  source: "internal" | "external"
): HttpClient {
  const axiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  const errorAdapter = new AxiosErrorAdapter();

  return new AxiosHttpClient(axiosInstance, errorAdapter, source);
}

/**
 * Pre-built client for calls to our own Next.js API routes (`/api/*`).
 * Errors are tagged `source: "internal"`.
 */
export const internalHttpClient: HttpClient = createHttpClient(
  "/",
  "internal"
);
