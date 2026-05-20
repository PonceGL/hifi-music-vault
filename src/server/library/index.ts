import { createHash } from "crypto";
import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import type { AudioFormat, Track, TrackMetadata } from "@/types/track";
import { AUDIO_EXTENSIONS, EXT_TO_FORMAT } from "@/lib/audioFormats";
import { computeHealthStatus } from "@/server/library/health";

const execFileAsync = promisify(execFile);

interface FfprobeStream {
  codec_type: string;
  codec_name: string;
  sample_rate?: string;
  bit_rate?: string;
  duration?: string;
}

interface FfprobeFormat {
  filename: string;
  duration?: string;
  size?: string;
  bit_rate?: string;
  tags?: Record<string, string>;
}

interface FfprobeOutput {
  streams: FfprobeStream[];
  format: FfprobeFormat;
}

function idFromPath(absolutePath: string): string {
  return createHash("sha256").update(absolutePath).digest("hex").slice(0, 32);
}

function resolveFormat(
  ext: string,
  streams: FfprobeStream[],
): AudioFormat | null {
  const base = EXT_TO_FORMAT[ext];
  if (!base) return null;
  // .m4a can contain ALAC — override the default "aac" when ffprobe confirms it
  if (ext === ".m4a") {
    const audioStream = streams.find((s) => s.codec_type === "audio");
    return audioStream?.codec_name === "alac" ? "alac" : "aac";
  }
  return base;
}

function parseTrackNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.split("/")[0], 10);
  return isNaN(n) ? null : n;
}

function parseYear(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw.slice(0, 4), 10);
  return isNaN(n) ? null : n;
}

function buildMetadata(
  ffprobe: FfprobeOutput,
  hasArtwork: boolean,
): TrackMetadata {
  const tags = ffprobe.format.tags ?? {};
  const audioStream = ffprobe.streams.find((s) => s.codec_type === "audio");

  return {
    title: tags["title"] ?? tags["TITLE"] ?? null,
    artist: tags["artist"] ?? tags["ARTIST"] ?? null,
    albumArtist:
      tags["album_artist"] ??
      tags["ALBUM_ARTIST"] ??
      tags["albumartist"] ??
      null,
    album: tags["album"] ?? tags["ALBUM"] ?? null,
    year: parseYear(
      tags["date"] ?? tags["DATE"] ?? tags["year"] ?? tags["YEAR"],
    ),
    genre: tags["genre"] ?? tags["GENRE"] ?? null,
    trackNumber: parseTrackNumber(tags["track"] ?? tags["TRACK"]),
    totalTracks: parseTrackNumber(
      (tags["track"] ?? tags["TRACK"])?.split("/")[1],
    ),
    discNumber: parseTrackNumber(tags["disc"] ?? tags["DISC"]),
    totalDiscs: parseTrackNumber((tags["disc"] ?? tags["DISC"])?.split("/")[1]),
    composer: tags["composer"] ?? tags["COMPOSER"] ?? null,
    comment: tags["comment"] ?? tags["COMMENT"] ?? null,
    artwork: hasArtwork ? "embedded" : null,
    bitrate: ffprobe.format.bit_rate
      ? Math.round(parseInt(ffprobe.format.bit_rate, 10) / 1000)
      : null,
    sampleRate: audioStream?.sample_rate
      ? parseInt(audioStream.sample_rate, 10)
      : null,
    musicBrainzId:
      tags["MUSICBRAINZ_TRACKID"] ?? tags["musicbrainz_trackid"] ?? null,
  };
}

async function runFfprobe(filePath: string): Promise<FfprobeOutput> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  return JSON.parse(stdout) as FfprobeOutput;
}

async function collectAudioFiles(dir: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectAudioFiles(full);
        result.push(...nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) result.push(full);
      }
    }),
  );

  return result;
}

async function buildTrack(filePath: string): Promise<Track | null> {
  try {
    const ffprobe = await runFfprobe(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const format = resolveFormat(ext, ffprobe.streams);
    if (!format) return null;

    const hasArtwork = ffprobe.streams.some((s) => s.codec_type === "video");
    const metadata = buildMetadata(ffprobe, hasArtwork);
    const stat = await fs.stat(filePath);

    return {
      id: idFromPath(filePath),
      filePath,
      fileName: path.basename(filePath),
      metadata,
      healthStatus: computeHealthStatus(metadata),
      format,
      size: stat.size,
      duration: ffprobe.format.duration
        ? parseFloat(ffprobe.format.duration)
        : 0,
    };
  } catch {
    return null;
  }
}

export async function buildLibraryIndex(libraryPath: string): Promise<Track[]> {
  let files: string[];
  try {
    files = await collectAudioFiles(libraryPath);
  } catch {
    return [];
  }

  const results = await Promise.all(files.map(buildTrack));
  return results.filter((t): t is Track => t !== null);
}
