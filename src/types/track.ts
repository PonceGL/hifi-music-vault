export type HealthStatus = "complete" | "warning" | "alert" | "critical";

export type LosslessFormat = "flac" | "alac";
export type LossyFormat = "mp3" | "wav" | "aac" | "ogg";
export type AudioFormat = LosslessFormat | LossyFormat;

export const LOSSLESS_FORMATS: LosslessFormat[] = ["flac", "alac"];

export interface TrackMetadata {
  title: string | null;
  artist: string | null;
  albumArtist: string | null;
  album: string | null;
  year: number | null;
  genre: string | null;
  trackNumber: number | null;
  totalTracks: number | null;
  discNumber: number | null;
  totalDiscs: number | null;
  composer: string | null;
  comment: string | null;
  // base64-encoded image data extracted by ffprobe
  artwork: string | null;
  bitrate: number | null;
  sampleRate: number | null;
  musicBrainzId: string | null;
}

export interface Track {
  id: string;
  filePath: string;
  fileName: string;
  metadata: TrackMetadata;
  healthStatus: HealthStatus;
  format: AudioFormat;
  size: number;
  duration: number;
}
