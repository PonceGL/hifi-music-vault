// ─── Standard error response shape ───────────────────────────────────────────

export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: unknown;
  };
}

// ─── Base error class ─────────────────────────────────────────────────────────

/**
 * Base class for all server-side errors that map to an HTTP response.
 *
 * Throw an `HttpError` (or a subclass) anywhere in a server service.
 * The `withErrorHandler` wrapper catches it and serializes it via `toJSON()`
 * so every endpoint returns the exact same error shape.
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): ApiErrorBody {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details !== undefined && { details: this.details }),
      },
    };
  }
}

// ─── Subclasses ───────────────────────────────────────────────────────────────

/**
 * Thrown when Zod schema validation fails on a request body or query params.
 * Maps to HTTP 400.
 */
export class ValidationError extends HttpError {
  constructor(details: unknown) {
    super(
      "Los datos de entrada no son válidos",
      400,
      "VALIDATION_ERROR",
      details
    );
  }
}

/**
 * Thrown when the server runs on an unsupported OS.
 * Maps to HTTP 500.
 */
export class UnsupportedPlatformError extends HttpError {
  constructor(platform: string) {
    super(
      `La plataforma '${platform}' no está soportada. Solo macOS (darwin) y Windows (win32) son compatibles.`,
      500,
      "UNSUPPORTED_PLATFORM"
    );
  }
}
