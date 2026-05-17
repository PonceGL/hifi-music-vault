/**
 * Frontend route constants — single source of truth for all app paths.
 *
 * Usage:
 * ```ts
 * import { APP_ROUTES } from "@/constants/appRoutes";
 *
 * router.push(APP_ROUTES.library);
 * <Link href={APP_ROUTES.settings}>Settings</Link>
 * ```
 *
 * Never write route strings as literals in components, hooks, or layouts.
 */
export const APP_ROUTES = {
  home: "/",
  onboarding: "/onboarding",
  library: "/library",
  artists: "/artists",
  albums: "/albums",
  playlists: "/playlists",
  health: "/health",
  settings: "/settings",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
