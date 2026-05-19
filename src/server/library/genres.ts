import type { Track } from "@/types/track";

export function extractGenres(tracks: Track[]): string[] {
  const seen = new Set<string>();
  for (const track of tracks) {
    if (track.metadata.genre) seen.add(track.metadata.genre);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
