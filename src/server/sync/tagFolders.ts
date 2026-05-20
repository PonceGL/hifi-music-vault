import type { ScannedFile } from "@/server/sync/scanner";

export interface PlaylistAssignment {
  filePath: string;
  playlists: string[];
}

export function extractPlaylistAssignments(
  files: ScannedFile[],
): PlaylistAssignment[] {
  return files
    .filter((f) => f.tagAncestors.length > 0)
    .map((f) => ({
      filePath: f.path,
      playlists: dedupe(f.tagAncestors),
    }));
}

function dedupe(tags: string[]): string[] {
  return [...new Set(tags)];
}
