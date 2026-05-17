import { NextRequest, NextResponse } from "next/server";
import { APP_ROUTES } from "@/constants/appRoutes";
import { COOKIE_KEYS } from "@/constants/cookieKeys";

/**
 * Routes that do NOT require folder configuration.
 * Any other route is protected and redirects to /onboarding if not configured.
 */
const PUBLIC_PATHS: readonly string[] = [APP_ROUTES.onboarding];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Returns true only when the cookie carries a valid FolderConfig — both
 * `downloadsPath` and `libraryPath` are non-empty strings.
 *
 * The cookie value is a JSON-encoded FolderConfig written by
 * `useFolderConfigStore.saveFolderConfig`. Checking only cookie *existence*
 * is not enough: if localStorage is cleared the cookie can still be present
 * but the app would have no paths to work with.
 */
function isFolderConfigured(request: NextRequest): boolean {
  const raw = request.cookies.get(COOKIE_KEYS.folderConfigured)?.value;
  if (!raw) return false;
  try {
    const config = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    return (
      typeof config.downloadsPath === "string" &&
      config.downloadsPath.length > 0 &&
      typeof config.libraryPath === "string" &&
      config.libraryPath.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Global route guard — runs server-side before any protected page renders.
 *
 * Protected routes require a valid `folder-configured` cookie that contains
 * both folder paths. Requests without it are redirected to `/onboarding`.
 *
 * Why cookies and not localStorage:
 * Middleware runs in Edge Runtime before the page is rendered.
 * localStorage is browser-only and unavailable here.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isFolderConfigured(request)) {
    return NextResponse.redirect(new URL(APP_ROUTES.onboarding, request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Apply to all routes except:
   * - Next.js internals (_next/static, _next/image)
   * - API routes (/api/*)
   * - Static files (favicon, images, fonts, etc.)
   */
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};
