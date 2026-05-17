"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/appRoutes";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";

/**
 * Client-side route guard — second line of defence after middleware.
 *
 * Middleware validates the cookie server-side before any page renders.
 * This hook handles the edge case where the cookie is present but
 * localStorage has been cleared: `folderConfig` will be null (no paths
 * available), so the hook clears the stale cookie and redirects to
 * onboarding to force a clean re-configuration.
 *
 * Usage: call this hook in the layout that wraps all protected routes
 * (the `(app)` route group layout). Every route inside the group is
 * protected automatically — no per-page boilerplate needed.
 */
export function useFolderConfigGuard(): void {
  const router = useRouter();
  const { folderConfig, clearFolderConfig } = useFolderConfigStore();

  useEffect(() => {
    if (folderConfig === null) {
      clearFolderConfig();
      router.replace(APP_ROUTES.onboarding);
    }
  }, [folderConfig, clearFolderConfig, router]);
}
