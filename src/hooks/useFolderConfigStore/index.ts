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
  /** Persists config to localStorage AND syncs the middleware cookie. */
  saveFolderConfig: (config: FolderConfig) => void;
  /** Removes config from localStorage and clears the middleware cookie. */
  clearFolderConfig: () => void;
}

/**
 * Writes the full FolderConfig as a JSON-encoded cookie so middleware can
 * validate both paths server-side on every request.
 */
function setConfiguredCookie(config: FolderConfig): void {
  document.cookie = `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}; path=/; SameSite=Strict`;
}

/** Clears the middleware cookie, triggering an onboarding redirect. */
function clearConfiguredCookie(): void {
  document.cookie = `${COOKIE_KEYS.folderConfigured}=; path=/; Max-Age=0; SameSite=Strict`;
}

/**
 * Reads the folder config back from the cookie (client-side).
 *
 * Used as the `initialValue` fallback for `useLocalStorage` so that if
 * localStorage is cleared while the cookie is still valid, the in-memory
 * state is immediately populated — preventing a spurious redirect to
 * onboarding on the next render cycle.
 */
function parseFolderConfigFromCookie(): FolderConfig | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_KEYS.folderConfigured}=`));
  if (!entry) return null;
  try {
    const raw = entry.slice(COOKIE_KEYS.folderConfigured.length + 1);
    const parsed = JSON.parse(decodeURIComponent(raw)) as FolderConfig;
    return parsed.downloadsPath && parsed.libraryPath ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Reads and writes the folder configuration (downloads + library paths).
 *
 * **Storage strategy — two layers, one source of truth:**
 * - `localStorage` is the primary client-side store (reactive, fast reads).
 * - Cookie mirrors the config so middleware can protect routes server-side.
 * - If localStorage is cleared but the cookie is intact, the config is
 *   restored from the cookie as the `useLocalStorage` initial value —
 *   synchronously, with no extra render or effect needed.
 *
 * Distinct from `useFolderConfig`, which manages the transient validation
 * UI state during the onboarding folder-picker flow.
 */
export function useFolderConfigStore(): UseFolderConfigStoreReturn {
  const [stored, setStored, removeStored] = useLocalStorage<FolderConfig>(
    STORAGE_KEYS.folderConfig,
    parseFolderConfigFromCookie() ?? INITIAL_CONFIG,
  );

  const folderConfig: FolderConfig | null =
    stored.downloadsPath !== null && stored.libraryPath !== null
      ? stored
      : null;

  function saveFolderConfig(config: FolderConfig): void {
    setStored(config);
    setConfiguredCookie(config);
  }

  function clearFolderConfig(): void {
    removeStored();
    clearConfiguredCookie();
  }

  return { folderConfig, saveFolderConfig, clearFolderConfig };
}
