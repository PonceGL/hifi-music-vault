import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  ErrorAdapter,
  HttpClient,
  HttpResponse,
  RequestConfig,
} from "@/lib/http/types";

function toAxiosConfig(config?: RequestConfig): AxiosRequestConfig {
  return {
    headers: config?.headers,
    params: config?.params,
    signal: config?.signal,
    timeout: config?.timeout,
  };
}

function flattenHeaders(
  headers: AxiosResponse["headers"],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") result[key] = value;
    else if (Array.isArray(value)) result[key] = value.join(", ");
    else if (value !== undefined && value !== null) result[key] = String(value);
  }
  return result;
}

function toHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
  return {
    data: response.data,
    status: response.status,
    headers: flattenHeaders(response.headers),
  };
}

/**
 * Axios implementation of the `HttpClient` contract.
 *
 * Receives its dependencies via constructor — the `AxiosInstance` controls
 * base URL, default headers and interceptors; the `ErrorAdapter` normalizes
 * every error into `AppHttpError` before it leaves this class.
 *
 * To replace Axios: create a new class that implements `HttpClient`,
 * inject it wherever `createHttpClient` is called — nothing else changes.
 */
export class AxiosHttpClient implements HttpClient {
  constructor(
    private readonly client: AxiosInstance,
    private readonly errorAdapter: ErrorAdapter,
    private readonly source: "internal" | "external",
  ) {}

  async get<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.client.get<T>(url, toAxiosConfig(config));
      return toHttpResponse(response);
    } catch (error) {
      throw this.errorAdapter.normalize(error, this.source);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.client.post<T>(
        url,
        data,
        toAxiosConfig(config),
      );
      return toHttpResponse(response);
    } catch (error) {
      throw this.errorAdapter.normalize(error, this.source);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.client.put<T>(
        url,
        data,
        toAxiosConfig(config),
      );
      return toHttpResponse(response);
    } catch (error) {
      throw this.errorAdapter.normalize(error, this.source);
    }
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.client.patch<T>(
        url,
        data,
        toAxiosConfig(config),
      );
      return toHttpResponse(response);
    } catch (error) {
      throw this.errorAdapter.normalize(error, this.source);
    }
  }

  async delete<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, toAxiosConfig(config));
      return toHttpResponse(response);
    } catch (error) {
      throw this.errorAdapter.normalize(error, this.source);
    }
  }
}
