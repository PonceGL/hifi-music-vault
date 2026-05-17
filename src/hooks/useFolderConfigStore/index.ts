"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import type { FolderConfig } from "@/types/settings";

const INITIAL_CONFIG: FolderConfig = {
  downloadsPath: null,
  libraryPath: null,
};

export interface UseFolderConfigStoreReturn {
  /** Stored config, or `null` if either path is missing. */
  folderConfig: FolderConfig | null;
  /** Persists config to localStorage AND signals middleware via cookie. */
  saveFolderConfig: (config: FolderConfig) => void;
  /** Removes config from localStorage and clears the middleware cookie. */
  clearFolderConfig: () => void;
}

/** Sets the "folder-configured" cookie so middleware can read it server-side. */
function setConfiguredCookie(): void {
  document.cookie = `${COOKIE_KEYS.folderConfigured}=1; path=/; SameSite=Strict`;
}

/** Removes the "folder-configured" cookie, triggering onboarding redirect. */
function clearConfiguredCookie(): void {
  document.cookie = `${COOKIE_KEYS.folderConfigured}=; path=/; Max-Age=0; SameSite=Strict`;
}

/**
 * Reads and writes the folder configuration (downloads + library paths).
 *
 * Persists to localStorage (client-side reactive state) and syncs a cookie
 * so Next.js middleware can protect routes server-side without accessing
 * localStorage — which is not available in Server Components.
 *
 * Distinct from `useFolderConfig`, which manages the transient validation
 * UI state during the onboarding folder-picker flow.
 */
export function useFolderConfigStore(): UseFolderConfigStoreReturn {
  const [stored, setStored, removeStored] = useLocalStorage<FolderConfig>(
    STORAGE_KEYS.folderConfig,
    INITIAL_CONFIG,
  );

  const folderConfig: FolderConfig | null =
    stored.downloadsPath !== null && stored.libraryPath !== null
      ? stored
      : null;

  function saveFolderConfig(config: FolderConfig): void {
    setStored(config);
    setConfiguredCookie();
  }

  function clearFolderConfig(): void {
    removeStored();
    clearConfiguredCookie();
  }

  return { folderConfig, saveFolderConfig, clearFolderConfig };
}
