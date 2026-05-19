import type { AudioFormat } from "@/types/track";

interface FormatStyle {
  textClass: string;
  bgClass: string;
}

export const FORMAT_STYLES: Record<AudioFormat, FormatStyle> = {
  flac: { textClass: "text-format-flac", bgClass: "bg-accent-subtle" },
  alac: { textClass: "text-format-alac", bgClass: "bg-accent-subtle" },
  mp3: { textClass: "text-format-mp3", bgClass: "bg-surface-secondary" },
  wav: { textClass: "text-format-mp3", bgClass: "bg-surface-secondary" },
  aac: { textClass: "text-format-mp3", bgClass: "bg-surface-secondary" },
  ogg: { textClass: "text-format-mp3", bgClass: "bg-surface-secondary" },
};
