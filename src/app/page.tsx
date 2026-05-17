"use client";

import { useEffect, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/appRoutes";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { FolderConfig } from "@/types/settings";

/**
 * Entry point — reads localStorage on mount and redirects:
 * - Folder config present → /library
 * - No config (first launch or cleared) → /onboarding
 *
 * Renders a minimal spinner during the read so the user never sees a flash
 * of unstyled content. localStorage is read in useEffect because it is not
 * available on the server.
 */
export default function Home(): ReactElement {
  const router = useRouter();

  useEffect(() => {
    const config = storage.get<FolderConfig>(STORAGE_KEYS.folderConfig);
    const isConfigured =
      config?.downloadsPath != null && config?.libraryPath != null;

    if (isConfigured) {
      router.replace(APP_ROUTES.library);
    } else {
      router.replace(APP_ROUTES.onboarding);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="size-8 animate-spin rounded-full border-2 border-border border-t-accent"
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
}
