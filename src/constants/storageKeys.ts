/**
 * localStorage key names — single source of truth.
 *
 * Never write a key string directly in a component, hook, or utility.
 * Always import from here. This prevents bugs caused by mistyped key names
 * and makes it trivial to find every place a given key is used.
 */
export const STORAGE_KEYS = {
  folderConfig: "folder-config",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
