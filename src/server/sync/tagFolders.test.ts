import { extractPlaylistAssignments } from "./tagFolders";
import type { ScannedFile } from "./scanner";

function scanned(p: string, tags: string[] = []): ScannedFile {
  return { path: p, tagAncestors: tags };
}

describe("extractPlaylistAssignments — basic (MFM-434)", () => {
  it("returns empty array for files with no tag ancestors", () => {
    const files = [scanned("/dl/track.flac"), scanned("/dl/other.mp3")];
    expect(extractPlaylistAssignments(files)).toHaveLength(0);
  });

  it("returns assignment for file inside one [Tag] folder", () => {
    const files = [scanned("/dl/[Rock]/track.flac", ["Rock"])];
    const result = extractPlaylistAssignments(files);
    expect(result).toHaveLength(1);
    expect(result[0].playlists).toEqual(["Rock"]);
    expect(result[0].filePath).toBe("/dl/[Rock]/track.flac");
  });

  it("omits files with no tags from the result", () => {
    const files = [
      scanned("/dl/track.flac"),
      scanned("/dl/[Rock]/tagged.flac", ["Rock"]),
    ];
    const result = extractPlaylistAssignments(files);
    expect(result).toHaveLength(1);
    expect(result[0].filePath).toBe("/dl/[Rock]/tagged.flac");
  });
});

describe("extractPlaylistAssignments — nested [Tag] folders (MFM-434)", () => {
  it("file in nested [Rock]/[Favorites] gets both tags", () => {
    const files = [
      scanned("/dl/[Rock]/[Favorites]/track.flac", ["Rock", "Favorites"]),
    ];
    const result = extractPlaylistAssignments(files);
    expect(result[0].playlists).toContain("Rock");
    expect(result[0].playlists).toContain("Favorites");
    expect(result[0].playlists).toHaveLength(2);
  });
});

describe("extractPlaylistAssignments — case-sensitive (MFM-434)", () => {
  it("[Rock] and [rock] are treated as different playlists", () => {
    const files = [scanned("/dl/track.flac", ["Rock", "rock"])];
    const result = extractPlaylistAssignments(files);
    expect(result[0].playlists).toContain("Rock");
    expect(result[0].playlists).toContain("rock");
    expect(result[0].playlists).toHaveLength(2);
  });
});

describe("extractPlaylistAssignments — deduplication (MFM-434)", () => {
  it("deduplicates repeated tag names for the same file", () => {
    const files = [scanned("/dl/track.flac", ["Rock", "Rock", "Rock"])];
    const result = extractPlaylistAssignments(files);
    expect(result[0].playlists.filter((t) => t === "Rock")).toHaveLength(1);
  });
});
