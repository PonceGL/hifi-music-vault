/**
 * Cookie key names — single source of truth.
 *
 * Cookies are the only mechanism readable by both the server (middleware)
 * and the client. They complement localStorage, which is client-only.
 *
 * Rule: store only what the server-side route guard strictly needs to read.
 * The full application state lives in localStorage; the cookie is its
 * server-readable mirror for routing decisions.
 */
export const COOKIE_KEYS = {
  /**
   * JSON-encoded `FolderConfig` { downloadsPath, libraryPath }.
   * Middleware parses and validates both paths are non-empty before
   * allowing access to any protected route. Cleared on config reset.
   */
  folderConfigured: "folder-configured",
} as const;

export type CookieKey = (typeof COOKIE_KEYS)[keyof typeof COOKIE_KEYS];
