import axios from "axios";
import { AxiosHttpClient } from "@/lib/http/axiosAdapter";
import { AxiosErrorAdapter } from "@/lib/http/errorAdapter";
import type { ErrorAdapter, HttpClient } from "@/lib/http/types";

export type { HttpClient, HttpResponse, RequestConfig } from "@/lib/http/types";
export type {
  AppHttpError,
  HttpErrorCode,
  ErrorAdapter,
} from "@/lib/http/types";

/**
 * Factory that assembles a fully configured `HttpClient`.
 *
 * This is the ONLY place in the codebase that knows which concrete HTTP
 * library is in use. Everything outside depends exclusively on the
 * `HttpClient` interface — making the underlying library transparent to
 * the rest of the application.
 *
 * ## Replacing Axios
 * Both the HTTP client and the error adapter are independently swappable:
 * 1. Create `FetchHttpClient implements HttpClient`
 * 2. Create `FetchErrorAdapter implements ErrorAdapter`
 * 3. Update this factory to use them
 * Zero changes needed outside `src/lib/http/`.
 *
 * @param baseURL - Base URL for all requests.
 *   Use `"/"` for internal API calls (`/api/*`).
 *   Use the full origin for external services (`"https://musicbrainz.org"`).
 * @param source - Tags every error produced by this client.
 *   `"internal"` for our own API; `"external"` for third-party APIs.
 * @param errorAdapter - Normalizes library errors into `AppHttpError`.
 *   Defaults to `AxiosErrorAdapter`. Pass a custom implementation to swap
 *   the error-normalization strategy without touching `HttpClient` consumers.
 */
export function createHttpClient(
  baseURL: string,
  source: "internal" | "external",
  errorAdapter: ErrorAdapter = new AxiosErrorAdapter(),
): HttpClient {
  const axiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  return new AxiosHttpClient(axiosInstance, errorAdapter, source);
}

/**
 * Pre-built client for calls to our own Next.js API routes (`/api/*`).
 * Errors are tagged `source: "internal"`.
 */
export const internalHttpClient: HttpClient = createHttpClient("/", "internal");
