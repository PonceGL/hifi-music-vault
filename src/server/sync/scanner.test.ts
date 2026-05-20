import path from "path";

jest.mock("fs", () => ({
  promises: { readdir: jest.fn() },
}));

import { promises as fsMock } from "fs";
import { scanDownloads } from "./scanner";

const mockReaddir = fsMock.readdir as jest.Mock;
const DL = "/downloads";

type Entry = {
  name: string;
  isDirectory: () => boolean;
  isFile: () => boolean;
};

function dir(name: string): Entry {
  return { name, isDirectory: () => true, isFile: () => false };
}
function file(name: string): Entry {
  return { name, isDirectory: () => false, isFile: () => true };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockReaddir.mockResolvedValue([]);
});

describe("scanDownloads — empty folder (MFM-430)", () => {
  it("returns empty result for empty directory", async () => {
    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(0);
    expect(r.tagFolderNames).toHaveLength(0);
    expect(r.tooDeepCount).toBe(0);
  });

  it("handles readdir failure gracefully", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));
    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(0);
  });
});

describe("scanDownloads — non-audio files ignored (MFM-430)", () => {
  it("ignores .jpg, .txt, .pdf files", async () => {
    mockReaddir.mockResolvedValue([
      file("cover.jpg"),
      file("notes.txt"),
      file("track.flac"),
    ]);
    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(1);
    expect(r.files[0].path).toBe(path.join(DL, "track.flac"));
  });
});

describe("scanDownloads — 5-level depth limit (MFM-430)", () => {
  it("includes audio files at depth 1 (direct children)", async () => {
    mockReaddir.mockResolvedValue([file("track.flac")]);
    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(1);
    expect(r.tooDeepCount).toBe(0);
  });

  it("counts files at depth 6+ as tooDeepCount", async () => {
    const d1 = path.join(DL, "a");
    const d2 = path.join(d1, "b");
    const d3 = path.join(d2, "c");
    const d4 = path.join(d3, "d");
    const d5 = path.join(d4, "e");
    const d6 = path.join(d5, "f");

    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("a")]);
      if (p === d1) return Promise.resolve([dir("b")]);
      if (p === d2) return Promise.resolve([dir("c")]);
      if (p === d3) return Promise.resolve([dir("d")]);
      if (p === d4) return Promise.resolve([dir("e")]);
      if (p === d5) return Promise.resolve([dir("f")]);
      if (p === d6) return Promise.resolve([file("deep.flac")]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(0);
    expect(r.tooDeepCount).toBe(1);
  });

  it("includes audio files exactly at depth 5", async () => {
    const d1 = path.join(DL, "a");
    const d2 = path.join(d1, "b");
    const d3 = path.join(d2, "c");
    const d4 = path.join(d3, "d");

    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("a")]);
      if (p === d1) return Promise.resolve([dir("b")]);
      if (p === d2) return Promise.resolve([dir("c")]);
      if (p === d3) return Promise.resolve([dir("d")]);
      if (p === d4) return Promise.resolve([file("track.flac")]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.files).toHaveLength(1);
    expect(r.tooDeepCount).toBe(0);
  });
});

describe("scanDownloads — [Tag] folder detection (MFM-430)", () => {
  it("detects a [Tag] folder name", async () => {
    const tagDir = path.join(DL, "[Rock]");
    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("[Rock]")]);
      if (p === tagDir) return Promise.resolve([file("track.flac")]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.tagFolderNames).toContain("Rock");
  });

  it("stores tag name without brackets", async () => {
    const tagDir = path.join(DL, "[Favoritos]");
    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("[Favoritos]")]);
      if (p === tagDir) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.tagFolderNames).toContain("Favoritos");
    expect(r.tagFolderNames).not.toContain("[Favoritos]");
  });

  it("is case-sensitive: [Rock] and [rock] are different tags", async () => {
    const rockDir = path.join(DL, "[Rock]");
    const lrockDir = path.join(DL, "[rock]");
    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("[Rock]"), dir("[rock]")]);
      if (p === rockDir || p === lrockDir) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.tagFolderNames).toContain("Rock");
    expect(r.tagFolderNames).toContain("rock");
    expect(r.tagFolderNames).toHaveLength(2);
  });

  it("assigns tag ancestors to files inside [Tag] folder", async () => {
    const tagDir = path.join(DL, "[Rock]");
    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("[Rock]")]);
      if (p === tagDir) return Promise.resolve([file("track.flac")]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.files[0].tagAncestors).toEqual(["Rock"]);
  });

  it("deduplicates tag names when the same [Tag] folder appears multiple times", async () => {
    const tagDir1 = path.join(DL, "[Rock]");
    const tagDir2 = path.join(DL, "Artist", "[Rock]");
    const artistDir = path.join(DL, "Artist");
    mockReaddir.mockImplementation((p: unknown) => {
      if (p === DL) return Promise.resolve([dir("[Rock]"), dir("Artist")]);
      if (p === tagDir1) return Promise.resolve([]);
      if (p === artistDir) return Promise.resolve([dir("[Rock]")]);
      if (p === tagDir2) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const r = await scanDownloads(DL);
    expect(r.tagFolderNames.filter((t) => t === "Rock")).toHaveLength(1);
  });
});
