jest.mock("fs", () => ({
  promises: { access: jest.fn() },
}));

import { promises as fsMock } from "fs";
import { isDuplicate } from "./deduplicator";

const mockAccess = fsMock.access as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("isDuplicate — exact path match (MFM-432)", () => {
  it("returns true when dest path already exists", async () => {
    mockAccess.mockResolvedValue(undefined);
    expect(await isDuplicate("/library/Artist/Album/track.flac")).toBe(true);
  });

  it("returns false when dest path does not exist", async () => {
    mockAccess.mockRejectedValue(new Error("ENOENT"));
    expect(await isDuplicate("/library/Artist/Album/track.flac")).toBe(false);
  });
});

describe("isDuplicate — extension matters (MFM-432)", () => {
  it("same path with different ext → distinct paths (no dup)", async () => {
    mockAccess.mockRejectedValue(new Error("ENOENT"));
    const flac = await isDuplicate("/library/Artist/Album/track.flac");
    const mp3 = await isDuplicate("/library/Artist/Album/track.mp3");
    expect(flac).toBe(false);
    expect(mp3).toBe(false);
  });

  it("same path with same ext → duplicate", async () => {
    mockAccess.mockResolvedValue(undefined);
    const result1 = await isDuplicate("/library/Artist/Album/track.flac");
    const result2 = await isDuplicate("/library/Artist/Album/track.flac");
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});

describe("isDuplicate — multi-[Tag] same file (MFM-432)", () => {
  it("file with multiple tag assignments checked at its single dest path", async () => {
    mockAccess.mockResolvedValue(undefined);
    const destPath =
      "/library/Queen/A Night at the Opera [1975]/11 - Bohemian Rhapsody.flac";
    expect(await isDuplicate(destPath)).toBe(true);
  });
});
