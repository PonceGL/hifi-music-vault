import path from "path";
import type { MinimalMetadata } from "@/server/sync/validator";

const MACOS_LINUX_FORBIDDEN = /[:/\x00]/g;
const WINDOWS_FORBIDDEN = /[<>:"/\\|?*\x00-\x1f]/g;
const WINDOWS_TRAILING = /[. ]+$/;
const MAX_SEGMENT_LENGTH = 255;

export function sanitizeName(
  name: string,
  platform: NodeJS.Platform = process.platform,
): string {
  const cleaned =
    platform === "win32"
      ? name.replace(WINDOWS_FORBIDDEN, "_").replace(WINDOWS_TRAILING, "")
      : name.replace(MACOS_LINUX_FORBIDDEN, "_");

  return cleaned.slice(0, MAX_SEGMENT_LENGTH).trim() || "_";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function buildDestPath(
  libraryPath: string,
  metadata: MinimalMetadata,
  ext: string,
): string {
  const { artist, album, year, trackNumber, title } = metadata;

  const artistDir = sanitizeName(artist);
  const albumSuffix = year ? ` [${year}]` : "";
  const albumDir = sanitizeName(album) + albumSuffix;
  const trackPrefix = trackNumber ? `${pad(trackNumber)} - ` : "";
  const fileName = sanitizeName(`${trackPrefix}${title}`) + ext;

  return path.join(libraryPath, artistDir, albumDir, fileName);
}
