"use client";

import { useState } from "react";
import { storage } from "@/lib/storage";

type UseLocalStorageReturn<T> = [
  value: T,
  setValue: (value: T) => void,
  removeValue: () => void,
];

/**
 * Generic typed hook for reading and writing a single key in localStorage.
 *
 * Mirrors the `useState` API — returns a tuple of the current value,
 * a setter, and a remove function that resets the value to `initialValue`.
 *
 * SSR-safe: reads from `storage` (which guards against `window` being
 * unavailable) and falls back to `initialValue` on the first render.
 *
 * @param key - The localStorage key. Always import from a constants file —
 *   never write the key literal directly in a component.
 * @param initialValue - Returned when the key is absent or corrupted.
 *
 * @example
 * const [folderConfig, setFolderConfig, removeFolderConfig] =
 *   useLocalStorage<FolderConfig>(STORAGE_KEYS.folderConfig, { downloadsPath: null, libraryPath: null });
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(
    () => storage.get<T>(key) ?? initialValue,
  );

  function setValue(value: T): void {
    storage.set(key, value);
    setStoredValue(value);
  }

  function removeValue(): void {
    storage.remove(key);
    setStoredValue(initialValue);
  }

  return [storedValue, setValue, removeValue];
}
