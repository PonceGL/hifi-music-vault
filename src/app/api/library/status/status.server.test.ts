import path from "path";

jest.mock("@/app/api/fs/validate/validate.server", () => ({
  validateServer: { checkPath: jest.fn() },
}));

jest.mock("fs", () => ({
  promises: { readdir: jest.fn() },
}));

import { validateServer } from "@/app/api/fs/validate/validate.server";
import { promises as fsMock } from "fs";
import { statusServer } from "./status.server";
import { BadRequestError } from "@/lib/httpErrors";
import type { ValidatePathResult } from "@/app/api/fs/validate/type";

const mockCheckPath = validateServer.checkPath as jest.Mock;
const mockReaddir = fsMock.readdir as jest.Mock;

const DOWNLOADS = "/downloads";
const LIBRARY = "/library";

const VALID: ValidatePathResult = {
  path: "",
  exists: true,
  isDirectory: true,
  isFile: false,
  hasPermissions: true,
};

const MISSING: ValidatePathResult = {
  path: "",
  exists: false,
  isDirectory: false,
  isFile: false,
  hasPermissions: false,
};

function mockBothValid(): void {
  mockCheckPath.mockResolvedValue(VALID);
}

function mockEmptyDir(): void {
  mockReaddir.mockResolvedValue([]);
}

function makeFileEntry(name: string) {
  return { name, isDirectory: () => false, isFile: () => true };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("statusServer.getStatus — validation (MFM-415)", () => {
  it("throws BadRequestError when downloadsPath is missing", async () => {
    mockCheckPath.mockResolvedValueOnce(MISSING).mockResolvedValueOnce(VALID);

    await expect(statusServer.getStatus(DOWNLOADS, LIBRARY)).rejects.toThrow(
      BadRequestError,
    );
  });

  it("throws BadRequestError when libraryPath is missing", async () => {
    mockCheckPath.mockResolvedValueOnce(VALID).mockResolvedValueOnce(MISSING);

    await expect(statusServer.getStatus(DOWNLOADS, LIBRARY)).rejects.toThrow(
      BadRequestError,
    );
  });

  it("error message includes the invalid path", async () => {
    mockCheckPath.mockResolvedValue(MISSING);

    await expect(statusServer.getStatus(DOWNLOADS, LIBRARY)).rejects.toThrow(
      DOWNLOADS,
    );
  });
});

describe("statusServer.getStatus — 4 casos de estado (MFM-415)", () => {
  it("caso 1: both folders empty → count 0 for both", async () => {
    mockBothValid();
    mockEmptyDir();

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);

    expect(result.downloads.count).toBe(0);
    expect(result.library.count).toBe(0);
  });

  it("caso 2: downloads has audio files, library is empty", async () => {
    mockBothValid();
    mockReaddir
      .mockResolvedValueOnce([
        makeFileEntry("track1.flac"),
        makeFileEntry("track2.mp3"),
        makeFileEntry("cover.jpg"),
      ])
      .mockResolvedValueOnce([]);

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);

    expect(result.downloads.count).toBe(2);
    expect(result.downloads.byFormat).toEqual({ flac: 1, mp3: 1 });
    expect(result.library.count).toBe(0);
  });

  it("caso 3: library has audio files, downloads is empty", async () => {
    mockBothValid();
    mockReaddir
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        makeFileEntry("01 - Song.flac"),
        makeFileEntry("02 - Song.flac"),
      ]);

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);

    expect(result.downloads.count).toBe(0);
    expect(result.library.count).toBe(2);
    expect(result.library.byFormat).toEqual({ flac: 2 });
  });

  it("caso 4: both folders have audio files of multiple formats", async () => {
    mockBothValid();
    mockReaddir
      .mockResolvedValueOnce([makeFileEntry("a.mp3"), makeFileEntry("b.wav")])
      .mockResolvedValueOnce([
        makeFileEntry("x.flac"),
        makeFileEntry("y.flac"),
        makeFileEntry("z.ogg"),
      ]);

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);

    expect(result.downloads.count).toBe(2);
    expect(result.downloads.byFormat).toEqual({ mp3: 1, wav: 1 });
    expect(result.library.count).toBe(3);
    expect(result.library.byFormat).toEqual({ flac: 2, ogg: 1 });
  });
});

describe("statusServer.getStatus — non-audio files ignored (MFM-415)", () => {
  it("ignores .jpg, .txt, .pdf and other non-audio files", async () => {
    mockBothValid();
    mockReaddir.mockResolvedValue([
      makeFileEntry("cover.jpg"),
      makeFileEntry("notes.txt"),
      makeFileEntry("artwork.png"),
      makeFileEntry("track.flac"),
    ]);

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);

    expect(result.downloads.count).toBe(1);
    expect(result.downloads.byFormat).toEqual({ flac: 1 });
  });
});

describe("statusServer.getStatus — subdirectory scan (MFM-415)", () => {
  it("counts files in subdirectories recursively", async () => {
    mockBothValid();

    const subDir = {
      name: "Artist",
      isDirectory: () => true,
      isFile: () => false,
    };
    const file = makeFileEntry("track.flac");
    const subDirPath = path.join(DOWNLOADS, "Artist");

    mockReaddir.mockImplementation((dir: unknown) => {
      if (dir === DOWNLOADS) return Promise.resolve([subDir]);
      if (dir === subDirPath) return Promise.resolve([file]);
      return Promise.resolve([]);
    });

    const result = await statusServer.getStatus(DOWNLOADS, LIBRARY);
    expect(result.downloads.count).toBe(1);
  });
});
