/**
 * API route constants — single source of truth for every endpoint the
 * frontend calls. The frontend ONLY calls our own Next.js API (`/api/*`).
 * External services (MusicBrainz, etc.) are called from src/server/.
 *
 * Usage:
 * ```ts
 * import { API_ROUTES } from "@/lib/apiRoutes";
 *
 * fetch(API_ROUTES.fs.dialog, { method: "POST", ... });
 * fetch(API_ROUTES.fs.validate("/path/to/folder"));
 * ```
 */
export const API_ROUTES = {
  fs: {
    /** POST — opens the native OS folder-picker dialog */
    dialog: "/api/fs/dialog",

    /** GET — validates a folder path: existence, permissions, disk space */
    validate: (path: string): string =>
      `/api/fs?${new URLSearchParams({ path }).toString()}`,
  },
} as const;
