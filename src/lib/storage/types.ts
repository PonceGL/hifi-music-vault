/**
 * Contract for any storage adapter used in the application.
 *
 * Implementations hide the underlying storage mechanism (localStorage,
 * sessionStorage, in-memory, etc.) behind this interface so that call
 * sites never depend on a concrete API.
 *
 * All methods are SSR-safe: implementations must guard against environments
 * where `window` is unavailable (e.g. Next.js server render) and return
 * graceful no-ops or null values in that case.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
