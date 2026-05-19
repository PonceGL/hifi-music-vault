import type { HealthStatus, TrackMetadata } from "@/types/track";

export function computeHealthStatus(
  metadata: TrackMetadata,
  corrupted = false,
): HealthStatus {
  if (corrupted || !metadata.artist || !metadata.title) return "critical";
  if (!metadata.album) return "alert";
  if (!metadata.genre || !metadata.artwork) return "warning";
  return "complete";
}
