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
 * Global route guard.
 *
 * Reads the `folder-configured` cookie — set by `useFolderConfigStore`
 * when the user completes onboarding — and redirects unauthenticated
 * requests to `/onboarding` before any page renders.
 *
 * Why cookies and not localStorage:
 * Middleware runs on the Edge (server-side) before the page is rendered.
 * localStorage only exists in the browser, so it is not accessible here.
 * The cookie acts as the server-readable signal that the user is configured.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isConfigured = request.cookies.has(COOKIE_KEYS.folderConfigured);

  if (!isConfigured) {
    return NextResponse.redirect(
      new URL(APP_ROUTES.onboarding, request.url)
    );
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
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
