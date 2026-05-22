jest.mock("@/server/sync/scanner");
jest.mock("@/server/sync/validator");
jest.mock("@/server/sync/deduplicator");
jest.mock("@/server/sync/pathBuilder");
jest.mock("@/server/sync/tagFolders");
jest.mock("fs", () => ({
  promises: { mkdir: jest.fn(), rename: jest.fn() },
}));

import { scanDownloads } from "@/server/sync/scanner";
import { validateMinimalMetadata } from "@/server/sync/validator";
import { isDuplicate } from "@/server/sync/deduplicator";
import { buildDestPath } from "@/server/sync/pathBuilder";
import { extractPlaylistAssignments } from "@/server/sync/tagFolders";
import { promises as fsMock } from "fs";
import { organize } from "./organizer";
import type { ScanResult, ScannedFile } from "@/server/sync/scanner";
import type {
  ValidationResult,
  MinimalMetadata,
} from "@/server/sync/validator";

const mockScan = scanDownloads as jest.Mock;
const mockValidate = validateMinimalMetadata as jest.Mock;
const mockIsDuplicate = isDuplicate as jest.Mock;
const mockBuildDestPath = buildDestPath as jest.Mock;
const mockExtractPlaylists = extractPlaylistAssignments as jest.Mock;
const mockMkdir = fsMock.mkdir as jest.Mock;
const mockRename = fsMock.rename as jest.Mock;

const DL = "/downloads";
const LIB = "/library";
const DEST = "/library/Artist/Album/track.flac";

const VALID_META: MinimalMetadata = {
  artist: "Artist",
  album: "Album",
  title: "Track",
  year: 2020,
  trackNumber: 1,
};

function makeScanned(p: string): ScannedFile {
  return { path: p, tagAncestors: [] };
}

function scanWith(files: ScannedFile[]): ScanResult {
  return { files, tagFolderNames: [], tooDeepCount: 0 };
}

function validResult(p: string): ValidationResult {
  return { filePath: p, valid: true, metadata: VALID_META };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockScan.mockResolvedValue(scanWith([]));
  mockValidate.mockResolvedValue({
    filePath: "",
    valid: false,
    metadata: null,
  });
  mockIsDuplicate.mockResolvedValue(false);
  mockBuildDestPath.mockReturnValue(DEST);
  mockExtractPlaylists.mockReturnValue([]);
  mockMkdir.mockResolvedValue(undefined);
  mockRename.mockResolvedValue(undefined);
});

describe("organize — happy path (MFM-435)", () => {
  it("moves a valid non-duplicate file and increments moved count", async () => {
    const file = makeScanned(`${DL}/track.flac`);
    mockScan.mockResolvedValue(scanWith([file]));
    mockValidate.mockResolvedValue(validResult(file.path));

    const result = await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(result.moved).toBe(1);
    expect(result.errors).toBe(0);
    expect(mockRename).toHaveBeenCalledWith(file.path, DEST);
  });

  it("creates destination directory before moving", async () => {
    const file = makeScanned(`${DL}/track.flac`);
    mockScan.mockResolvedValue(scanWith([file]));
    mockValidate.mockResolvedValue(validResult(file.path));

    await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it("returns playlist names from tag assignments", async () => {
    mockScan.mockResolvedValue(scanWith([]));
    mockExtractPlaylists.mockReturnValue([
      { filePath: "/x", playlists: ["Rock", "Favorites"] },
    ]);

    const result = await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(result.playlistsUpdated).toContain("Rock");
    expect(result.playlistsUpdated).toContain("Favorites");
  });
});

describe("organize — ignored files (MFM-435)", () => {
  it("skips file with invalid metadata and increments missingMetadataSkipped", async () => {
    const file = makeScanned(`${DL}/track.flac`);
    mockScan.mockResolvedValue(scanWith([file]));
    mockValidate.mockResolvedValue({
      filePath: file.path,
      valid: false,
      metadata: null,
    });

    const result = await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(result.missingMetadataSkipped).toBe(1);
    expect(result.withWarnings).toBe(0);
    expect(result.moved).toBe(0);
    expect(mockRename).not.toHaveBeenCalled();
  });

  it("skips duplicate and increments duplicatesSkipped", async () => {
    const file = makeScanned(`${DL}/track.flac`);
    mockScan.mockResolvedValue(scanWith([file]));
    mockValidate.mockResolvedValue(validResult(file.path));
    mockIsDuplicate.mockResolvedValue(true);

    const result = await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(result.duplicatesSkipped).toBe(1);
    expect(result.moved).toBe(0);
  });
});

describe("organize — fs error (MFM-435)", () => {
  it("increments errors when rename fails", async () => {
    const file = makeScanned(`${DL}/track.flac`);
    mockScan.mockResolvedValue(scanWith([file]));
    mockValidate.mockResolvedValue(validResult(file.path));
    mockRename.mockRejectedValue(new Error("EPERM"));

    const result = await organize({ downloadsPath: DL, libraryPath: LIB });

    expect(result.errors).toBe(1);
    expect(result.moved).toBe(0);
  });
});
