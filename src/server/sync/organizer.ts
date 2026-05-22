import { promises as fs } from "fs";
import path from "path";
import { scanDownloads } from "@/server/sync/scanner";
import { validateMinimalMetadata } from "@/server/sync/validator";
import { isDuplicate } from "@/server/sync/deduplicator";
import { buildDestPath } from "@/server/sync/pathBuilder";
import { extractPlaylistAssignments } from "@/server/sync/tagFolders";
import type { SyncProgress, SyncResult } from "@/types/sync";

export interface OrganizerOptions {
  downloadsPath: string;
  libraryPath: string;
  onProgress?: (progress: SyncProgress) => void;
}

function emit(
  onProgress: OrganizerOptions["onProgress"],
  progress: SyncProgress,
): void {
  onProgress?.(progress);
}

export async function organize(options: OrganizerOptions): Promise<SyncResult> {
  const { downloadsPath, libraryPath, onProgress } = options;

  const result: SyncResult = {
    moved: 0,
    duplicatesSkipped: 0,
    missingMetadataSkipped: 0,
    withWarnings: 0,
    errors: 0,
    playlistsUpdated: [],
  };

  emit(onProgress, {
    phase: "scanning",
    current: 0,
    total: 0,
    currentFile: null,
    percentage: 0,
  });

  const scanResult = await scanDownloads(downloadsPath);
  const { files } = scanResult;
  const total = files.length;

  for (const [index, scannedFile] of files.entries()) {
    const ext = path.extname(scannedFile.path).toLowerCase();

    emit(onProgress, {
      phase: "organizing",
      current: index,
      total,
      currentFile: scannedFile.path,
      percentage: Math.round((index / total) * 100),
    });

    const validation = await validateMinimalMetadata(scannedFile.path);

    if (!validation.valid || !validation.metadata) {
      result.missingMetadataSkipped += 1;
      continue;
    }

    const destPath = buildDestPath(libraryPath, validation.metadata, ext);

    if (await isDuplicate(destPath)) {
      result.duplicatesSkipped += 1;
      continue;
    }

    emit(onProgress, {
      phase: "moving",
      current: index,
      total,
      currentFile: scannedFile.path,
      percentage: Math.round((index / total) * 100),
    });

    try {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.rename(scannedFile.path, destPath);
      result.moved += 1;
    } catch {
      result.errors += 1;
    }
  }

  const assignments = extractPlaylistAssignments(files);
  const updatedPlaylists = [
    ...new Set(assignments.flatMap((a) => a.playlists)),
  ];

  emit(onProgress, {
    phase: "updating-playlists",
    current: total,
    total,
    currentFile: null,
    percentage: 100,
  });

  result.playlistsUpdated = updatedPlaylists;

  return result;
}
