"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import type { FolderConfig } from "@/types/settings";

const INITIAL_CONFIG: FolderConfig = {
  downloadsPath: null,
  libraryPath: null,
};

export interface UseFolderConfigStoreReturn {
  /** Stored config, or `null` if either path is missing. */
  folderConfig: FolderConfig | null;
  /** Persists a complete config to localStorage. */
  saveFolderConfig: (config: FolderConfig) => void;
  /** Removes the config from localStorage, which sends the user back to /onboarding. */
  clearFolderConfig: () => void;
}

/**
 * Reads and writes the folder configuration (downloads + library paths)
 * from localStorage. Returns reactive state via `useLocalStorage`.
 *
 * Distinct from `useFolderConfig`, which manages the transient validation
 * UI state during the onboarding folder-picker flow.
 *
 * `folderConfig` is `null` when either path is absent — use it as a binary
 * "configured / not configured" signal in guards and redirect logic.
 */
export function useFolderConfigStore(): UseFolderConfigStoreReturn {
  const [stored, setStored, removeStored] = useLocalStorage<FolderConfig>(
    STORAGE_KEYS.folderConfig,
    INITIAL_CONFIG
  );

  const folderConfig: FolderConfig | null =
    stored.downloadsPath !== null && stored.libraryPath !== null
      ? stored
      : null;

  function saveFolderConfig(config: FolderConfig): void {
    setStored(config);
  }

  function clearFolderConfig(): void {
    removeStored();
  }

  return { folderConfig, saveFolderConfig, clearFolderConfig };
}
