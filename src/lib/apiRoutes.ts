const PREFIX = "/api";
const FILESYSTEM_ROUTE = "/fs";
const DIALOG_ROUTE = "/dialog";
const VALIDATE_ROUTE = "/validate";
const LIBRARY_ROUTE = "/library";
const STATUS_ROUTE = "/status";
const WATCH_ROUTE = "/watch";
const SYNC_ROUTE = "/sync";
const PRESCAN_ROUTE = "/prescan";
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
    dialog: `${PREFIX}${FILESYSTEM_ROUTE}${DIALOG_ROUTE}`,

    /** GET — validates a folder path: existence, permissions, disk space */
    validate: (path: string): string =>
      `${PREFIX}${FILESYSTEM_ROUTE}${VALIDATE_ROUTE}?${new URLSearchParams({ path }).toString()}`,
  },

  library: {
    /** GET — paginated, filterable track index */
    index: `${PREFIX}${LIBRARY_ROUTE}`,
    /** GET — returns audio file counts for downloads and library folders */
    status: `${PREFIX}${LIBRARY_ROUTE}${STATUS_ROUTE}`,
    /** GET — SSE stream: emits file-added / file-removed events from the library watcher */
    watch: `${PREFIX}${LIBRARY_ROUTE}${WATCH_ROUTE}`,
  },

  sync: {
    /** POST — runs pre-scan and returns summary before confirming sync */
    prescan: `${PREFIX}${SYNC_ROUTE}${PRESCAN_ROUTE}`,
    /** GET — SSE stream: emits progress events then complete/error */
    stream: `${PREFIX}${SYNC_ROUTE}`,
  },
} as const;
