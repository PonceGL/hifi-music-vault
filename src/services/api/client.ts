import { API_BASE_URL } from '@/constants/app';

/**
 * Error personalizado para errores de API
 */
export class ApiError extends Error {
    status?: number;
    data?: any;

    constructor(message: string, status?: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Opciones para las peticiones HTTP
 */
interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

type JsonBody = object;

/**
 * Cliente HTTP base con manejo de errores y configuración común
 */
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Construye la URL completa con query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
        const url = new URL(endpoint, this.baseURL);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        return url.toString();
    }

    /**
     * Maneja la respuesta HTTP y errores
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorData;

            try {
                errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
                // Si no se puede parsear JSON, usar mensaje por defecto
            }

            throw new ApiError(errorMessage, response.status, errorData);
        }

        // Para respuestas 204 No Content, no intentar parsear JSON
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        return this.handleResponse<T>(response);
    }

    /**
     * POST request
     */
    async post<T, B extends JsonBody = JsonBody>(
        endpoint: string,
        body?: B,
        options?: FetchOptions
    ): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PUT request
     */
    async put<T, B extends JsonBody = JsonBody>(
        endpoint: string,
        body?: B,
        options?: FetchOptions
    ): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const response = await fetch(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * DELETE request
     */
    async delete<T, B extends JsonBody = JsonBody>(
        endpoint: string,
        body?: B,
        options?: FetchOptions
    ): Promise<T> {
        const url = this.buildURL(endpoint, options?.params);
        const response = await fetch(url, {
            ...options,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return this.handleResponse<T>(response);
    }
}

/**
 * Instancia singleton del cliente API
 */
export const apiClient = new ApiClient();
