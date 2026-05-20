import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface MinimalMetadata {
  artist: string;
  album: string;
  title: string;
  year: number | null;
  trackNumber: number | null;
}

export interface ValidationResult {
  filePath: string;
  valid: boolean;
  metadata: MinimalMetadata | null;
}

function parseNum(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.split("/")[0], 10);
  return isNaN(n) ? null : n;
}

function parseYear(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.slice(0, 4), 10);
  return isNaN(n) ? null : n;
}

async function readTags(
  filePath: string,
): Promise<Record<string, string> | null> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      filePath,
    ]);
    const parsed = JSON.parse(stdout) as {
      format?: { tags?: Record<string, string> };
    };
    return parsed.format?.tags ?? {};
  } catch {
    return null;
  }
}

export async function validateMinimalMetadata(
  filePath: string,
): Promise<ValidationResult> {
  const tags = await readTags(filePath);

  if (!tags) {
    return { filePath, valid: false, metadata: null };
  }

  const title = tags["title"] ?? tags["TITLE"] ?? null;
  const artist = tags["artist"] ?? tags["ARTIST"] ?? null;
  const album = tags["album"] ?? tags["ALBUM"] ?? null;

  if (!title || !artist || !album) {
    return { filePath, valid: false, metadata: null };
  }

  return {
    filePath,
    valid: true,
    metadata: {
      title,
      artist,
      album,
      year: parseYear(
        tags["date"] ?? tags["DATE"] ?? tags["year"] ?? tags["YEAR"],
      ),
      trackNumber: parseNum(tags["track"] ?? tags["TRACK"]),
    },
  };
}
