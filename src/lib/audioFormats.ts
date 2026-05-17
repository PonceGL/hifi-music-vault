import type { AudioFormat, LosslessFormat } from "@/types/track";

export const LOSSLESS_FORMATS: LosslessFormat[] = ["flac", "alac"];

export function isLossless(format: AudioFormat): boolean {
  return (LOSSLESS_FORMATS as AudioFormat[]).includes(format);
}
