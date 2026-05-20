import chokidar from "chokidar";
import type { FSWatcher } from "chokidar";
import type { WatchEvent } from "@/types/watch";

const DEBOUNCE_MS = 1000;

type Listener = (event: WatchEvent) => void;

class LibraryWatcher {
  private watcher: FSWatcher | null = null;
  private currentPath: string | null = null;
  private readonly listeners: Set<Listener> = new Set();
  private readonly debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  public async watch(libraryPath: string): Promise<void> {
    if (this.currentPath === libraryPath) return;
    await this.stopCurrent();
    this.currentPath = libraryPath;
    this.watcher = chokidar.watch(libraryPath, {
      ignoreInitial: true,
      persistent: true,
      depth: 5,
    });
    this.watcher.on("add", (filePath) =>
      this.debounce(filePath, { type: "file-added", path: filePath }),
    );
    this.watcher.on("unlink", (filePath) =>
      this.debounce(filePath, { type: "file-removed", path: filePath }),
    );
  }

  public async updatePath(newPath: string): Promise<void> {
    await this.watch(newPath);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async close(): Promise<void> {
    await this.stopCurrent();
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  private async stopCurrent(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.currentPath = null;
    }
  }

  private debounce(key: string, event: WatchEvent): void {
    const existing = this.debounceTimers.get(key);
    if (existing !== undefined) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      this.emit(event);
    }, DEBOUNCE_MS);
    this.debounceTimers.set(key, timer);
  }

  private emit(event: WatchEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const libraryWatcher = new LibraryWatcher();
