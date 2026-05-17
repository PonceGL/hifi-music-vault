import type { StorageAdapter } from "@/lib/storage/types";

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or security policy — fail silently
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
  }
}

/**
 * Pre-built localStorage adapter.
 *
 * Import this singleton wherever you need typed localStorage access.
 * To switch to a different storage mechanism, replace this with another
 * implementation of `StorageAdapter` — no call sites need to change.
 */
export const storage: StorageAdapter = new LocalStorageAdapter();
