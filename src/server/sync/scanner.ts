import { promises as fs } from "fs";
import path from "path";

const AUDIO_EXTENSIONS = new Set([
  ".flac",
  ".mp3",
  ".wav",
  ".ogg",
  ".aac",
  ".m4a",
]);

const MAX_DEPTH = 5;
const TAG_FOLDER_RE = /^\[(.+)\]$/;

export interface ScannedFile {
  path: string;
  tagAncestors: string[];
}

export interface ScanResult {
  files: ScannedFile[];
  tagFolderNames: string[];
  tooDeepCount: number;
}

function isTagFolder(name: string): boolean {
  return TAG_FOLDER_RE.test(name);
}

function extractTagName(name: string): string {
  return TAG_FOLDER_RE.exec(name)![1];
}

async function walk(
  dir: string,
  depth: number,
  ancestorTags: string[],
  result: ScanResult,
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const folderTags = isTagFolder(path.basename(dir))
    ? [...ancestorTags, extractTagName(path.basename(dir))]
    : ancestorTags;

  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (isTagFolder(entry.name)) {
          const tag = extractTagName(entry.name);
          if (!result.tagFolderNames.includes(tag)) {
            result.tagFolderNames.push(tag);
          }
        }
        if (depth < MAX_DEPTH) {
          await walk(full, depth + 1, folderTags, result);
        } else {
          result.tooDeepCount += await countAudioFilesBelow(full);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) {
          if (depth <= MAX_DEPTH) {
            result.files.push({ path: full, tagAncestors: folderTags });
          } else {
            result.tooDeepCount += 1;
          }
        }
      }
    }),
  );
}

async function countAudioFilesBelow(dir: string): Promise<number> {
  let count = 0;
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }

  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += await countAudioFilesBelow(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) count += 1;
      }
    }),
  );
  return count;
}

export async function scanDownloads(
  downloadsPath: string,
): Promise<ScanResult> {
  const result: ScanResult = {
    files: [],
    tagFolderNames: [],
    tooDeepCount: 0,
  };
  await walk(downloadsPath, 1, [], result);
  return result;
}
