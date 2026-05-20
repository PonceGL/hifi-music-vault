import type { AudioFormat, LosslessFormat } from "@/types/track";

export const LOSSLESS_FORMATS: LosslessFormat[] = ["flac", "alac"];

export function isLossless(format: AudioFormat): boolean {
  return (LOSSLESS_FORMATS as AudioFormat[]).includes(format);
}

/**
 * Default extension → AudioFormat mapping.
 * .m4a defaults to "aac"; use ffprobe codec detection to identify ALAC at scan time.
 */
export const EXT_TO_FORMAT: Readonly<Record<string, AudioFormat>> = {
  ".flac": "flac",
  ".mp3": "mp3",
  ".wav": "wav",
  ".ogg": "ogg",
  ".aac": "aac",
  ".m4a": "aac",
};

/** Set of all supported audio file extensions. Single source of truth. */
export const AUDIO_EXTENSIONS: ReadonlySet<string> = new Set(
  Object.keys(EXT_TO_FORMAT),
);
