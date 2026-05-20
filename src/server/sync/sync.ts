import { organize } from "@/server/sync/organizer";
import type { SyncProgress, SyncResult } from "@/types/sync";

export interface SyncInput {
  downloadsPath: string;
  libraryPath: string;
  onProgress: (progress: SyncProgress) => void;
}

export async function runSync(input: SyncInput): Promise<SyncResult> {
  return organize({
    downloadsPath: input.downloadsPath,
    libraryPath: input.libraryPath,
    onProgress: input.onProgress,
  });
}
