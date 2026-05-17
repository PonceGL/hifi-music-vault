/**
 * Cookie key names — single source of truth.
 *
 * Cookies are the only mechanism readable by both the server (middleware,
 * Server Components) and the client. They complement localStorage, which
 * is client-only.
 *
 * Rule: keep cookie values minimal. Store the full data in localStorage;
 * use cookies only for the flags that server-side route guards need to read.
 */
export const COOKIE_KEYS = {
  /** Set to "1" when both folder paths are configured. Cleared on reset. */
  folderConfigured: "folder-configured",
} as const;

export type CookieKey = (typeof COOKIE_KEYS)[keyof typeof COOKIE_KEYS];
