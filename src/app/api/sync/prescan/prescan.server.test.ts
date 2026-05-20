import path from "path";

jest.mock("@/server/sync/scanner");
jest.mock("@/server/sync/validator");
jest.mock("@/server/sync/deduplicator");
jest.mock("@/server/sync/pathBuilder");

import { scanDownloads } from "@/server/sync/scanner";
import { validateMinimalMetadata } from "@/server/sync/validator";
import { isDuplicate } from "@/server/sync/deduplicator";
import { buildDestPath } from "@/server/sync/pathBuilder";
import { prescanServer } from "./prescan.server";
import type { ScanResult, ScannedFile } from "@/server/sync/scanner";
import type {
  ValidationResult,
  MinimalMetadata,
} from "@/server/sync/validator";

const mockScan = scanDownloads as jest.Mock;
const mockValidate = validateMinimalMetadata as jest.Mock;
const mockIsDuplicate = isDuplicate as jest.Mock;
const mockBuildDestPath = buildDestPath as jest.Mock;

const DL = "/downloads";
const LIB = "/library";
const DEST = "/library/Artist/Album/track.flac";

const META: MinimalMetadata = {
  artist: "Artist",
  album: "Album",
  title: "Track",
  year: 2020,
  trackNumber: 1,
};

function scanned(name: string): ScannedFile {
  return { path: path.join(DL, name), tagAncestors: [] };
}

function emptyScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return { files: [], tagFolderNames: [], tooDeepCount: 0, ...overrides };
}

function validResult(p: string): ValidationResult {
  return { filePath: p, valid: true, metadata: META };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockScan.mockResolvedValue(emptyScan());
  mockValidate.mockResolvedValue({
    filePath: "",
    valid: false,
    metadata: null,
  });
  mockIsDuplicate.mockResolvedValue(false);
  mockBuildDestPath.mockReturnValue(DEST);
});

describe("prescanServer.prescan — sin archivos (MFM-438)", () => {
  it("returns all zeros for an empty downloads folder", async () => {
    const r = await prescanServer.prescan(DL, LIB);
    expect(r.toMove).toBe(0);
    expect(r.ignored.duplicates).toBe(0);
    expect(r.ignored.missingMetadata).toBe(0);
    expect(r.tagFolders).toEqual([]);
    expect(r.depthExceededCount).toBe(0);
  });
});

describe("prescanServer.prescan — happy path (MFM-438)", () => {
  it("counts valid non-duplicate files as toMove", async () => {
    const file = scanned("track.flac");
    mockScan.mockResolvedValue(emptyScan({ files: [file] }));
    mockValidate.mockResolvedValue(validResult(file.path));

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.toMove).toBe(1);
    expect(r.ignored.duplicates).toBe(0);
    expect(r.ignored.missingMetadata).toBe(0);
  });

  it("includes tagFolders from scan result", async () => {
    mockScan.mockResolvedValue(
      emptyScan({ tagFolderNames: ["Rock", "Favorites"] }),
    );

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.tagFolders).toEqual(["Rock", "Favorites"]);
  });

  it("reflects depthExceededCount from scan result", async () => {
    mockScan.mockResolvedValue(emptyScan({ tooDeepCount: 3 }));

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.depthExceededCount).toBe(3);
  });
});

describe("prescanServer.prescan — todos duplicados (MFM-438)", () => {
  it("counts all valid files as duplicates when they already exist", async () => {
    const files = [scanned("a.flac"), scanned("b.flac")];
    mockScan.mockResolvedValue(emptyScan({ files }));
    mockValidate.mockResolvedValue(validResult(files[0].path));
    mockIsDuplicate.mockResolvedValue(true);

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.toMove).toBe(0);
    expect(r.ignored.duplicates).toBe(2);
  });
});

describe("prescanServer.prescan — metadatos incompletos (MFM-438)", () => {
  it("counts files with missing required metadata", async () => {
    const files = [scanned("a.flac"), scanned("b.flac")];
    mockScan.mockResolvedValue(emptyScan({ files }));
    mockValidate.mockResolvedValue({
      filePath: "",
      valid: false,
      metadata: null,
    });

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.toMove).toBe(0);
    expect(r.ignored.missingMetadata).toBe(2);
  });
});

describe("prescanServer.prescan — longPathWarnings (MFM-438)", () => {
  it("counts files whose destination path exceeds 260 chars", async () => {
    const file = scanned("track.flac");
    mockScan.mockResolvedValue(emptyScan({ files: [file] }));
    mockValidate.mockResolvedValue(validResult(file.path));
    mockBuildDestPath.mockReturnValue("/" + "a".repeat(260));

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.longPathWarnings).toBe(1);
    expect(r.toMove).toBe(1);
  });

  it("does not count short paths as warnings", async () => {
    const file = scanned("track.flac");
    mockScan.mockResolvedValue(emptyScan({ files: [file] }));
    mockValidate.mockResolvedValue(validResult(file.path));
    mockBuildDestPath.mockReturnValue(DEST);

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.longPathWarnings).toBe(0);
  });
});

describe("prescanServer.prescan — mixed cases (MFM-438)", () => {
  it("correctly tallies toMove, duplicates and missingMetadata together", async () => {
    const files = [
      scanned("valid.flac"),
      scanned("dup.flac"),
      scanned("no-meta.flac"),
    ];
    mockScan.mockResolvedValue(emptyScan({ files }));

    mockValidate
      .mockResolvedValueOnce(validResult(files[0].path))
      .mockResolvedValueOnce(validResult(files[1].path))
      .mockResolvedValueOnce({
        filePath: files[2].path,
        valid: false,
        metadata: null,
      });

    mockIsDuplicate.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const r = await prescanServer.prescan(DL, LIB);

    expect(r.toMove).toBe(1);
    expect(r.ignored.duplicates).toBe(1);
    expect(r.ignored.missingMetadata).toBe(1);
  });
});
