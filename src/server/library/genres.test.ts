import { extractGenres } from "./genres";
import type { Track } from "@/types/track";

function makeTrack(genre: string | null, id = genre ?? "no-genre"): Track {
  return {
    id,
    filePath: `/library/${id}.flac`,
    fileName: `${id}.flac`,
    metadata: {
      title: "Track",
      artist: "Artist",
      albumArtist: null,
      album: "Album",
      year: null,
      genre,
      trackNumber: null,
      totalTracks: null,
      discNumber: null,
      totalDiscs: null,
      composer: null,
      comment: null,
      artwork: null,
      bitrate: null,
      sampleRate: null,
      musicBrainzId: null,
    },
    healthStatus: "complete",
    format: "flac",
    size: 1000,
    duration: 180,
  };
}

describe("extractGenres — basic (MFM-411)", () => {
  it("returns empty array for empty track list", () => {
    expect(extractGenres([])).toEqual([]);
  });

  it("returns single genre from a single track", () => {
    expect(extractGenres([makeTrack("Rock")])).toEqual(["Rock"]);
  });

  it("ignores tracks with null genre", () => {
    expect(extractGenres([makeTrack(null, "a"), makeTrack("Jazz")])).toEqual([
      "Jazz",
    ]);
  });

  it("returns empty array when all tracks have null genre", () => {
    expect(extractGenres([makeTrack(null, "a"), makeTrack(null, "b")])).toEqual(
      [],
    );
  });
});

describe("extractGenres — deduplication (MFM-411)", () => {
  it("deduplicates identical genres", () => {
    const tracks = [makeTrack("Rock", "a"), makeTrack("Rock", "b")];
    expect(extractGenres(tracks)).toEqual(["Rock"]);
  });

  it("treats different casings as different genres (case-sensitive)", () => {
    const tracks = [makeTrack("Rock", "a"), makeTrack("rock", "b")];
    expect(extractGenres(tracks)).toHaveLength(2);
  });
});

describe("extractGenres — alphabetical order (MFM-411)", () => {
  it("sorts genres alphabetically", () => {
    const tracks = [
      makeTrack("Rock", "a"),
      makeTrack("Jazz", "b"),
      makeTrack("Classical", "c"),
    ];
    expect(extractGenres(tracks)).toEqual(["Classical", "Jazz", "Rock"]);
  });

  it("maintains alphabetical order for many genres", () => {
    const genres = ["Salsa", "Blues", "Metal", "Pop", "Folk"];
    const tracks = genres.map((g) => makeTrack(g));
    const result = extractGenres(tracks);
    expect(result).toEqual([...result].sort((a, b) => a.localeCompare(b)));
  });
});
