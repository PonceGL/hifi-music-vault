/**
 * Base class for all server-side application errors.
 * Route handlers catch these and map them to the appropriate HTTP response.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper prototype chain in transpiled code
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the server is running on an OS that the app does not support.
 * The app only supports macOS (darwin) and Windows (win32).
 */
export class UnsupportedPlatformError extends AppError {
  constructor(platform: string) {
    super(
      `Platform '${platform}' is not supported. Only macOS (darwin) and Windows (win32) are supported.`,
      500
    );
  }
}
