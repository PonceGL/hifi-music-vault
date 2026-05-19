import { computeHealthStatus } from "./health";
import type { TrackMetadata } from "@/types/track";

const FULL_METADATA: TrackMetadata = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  albumArtist: "Queen",
  album: "A Night at the Opera",
  year: 1975,
  genre: "Rock",
  trackNumber: 11,
  totalTracks: 12,
  discNumber: 1,
  totalDiscs: 1,
  composer: "Freddie Mercury",
  comment: null,
  artwork: "embedded",
  bitrate: 1411,
  sampleRate: 44100,
  musicBrainzId: null,
};

function meta(overrides: Partial<TrackMetadata>): TrackMetadata {
  return { ...FULL_METADATA, ...overrides };
}

describe("computeHealthStatus — complete (MFM-410)", () => {
  it("returns 'complete' when all required fields are present", () => {
    expect(computeHealthStatus(FULL_METADATA)).toBe("complete");
  });

  it("returns 'complete' regardless of optional fields like composer or comment", () => {
    expect(computeHealthStatus(meta({ composer: null, comment: null }))).toBe(
      "complete",
    );
  });
});

describe("computeHealthStatus — warning (MFM-410)", () => {
  it("returns 'warning' when genre is null", () => {
    expect(computeHealthStatus(meta({ genre: null }))).toBe("warning");
  });

  it("returns 'warning' when artwork is null", () => {
    expect(computeHealthStatus(meta({ artwork: null }))).toBe("warning");
  });

  it("returns 'warning' when both genre and artwork are null", () => {
    expect(computeHealthStatus(meta({ genre: null, artwork: null }))).toBe(
      "warning",
    );
  });
});

describe("computeHealthStatus — alert (MFM-410)", () => {
  it("returns 'alert' when album is null", () => {
    expect(computeHealthStatus(meta({ album: null }))).toBe("alert");
  });

  it("returns 'alert' (not warning) even if genre/artwork also missing", () => {
    expect(
      computeHealthStatus(meta({ album: null, genre: null, artwork: null })),
    ).toBe("alert");
  });
});

describe("computeHealthStatus — critical (MFM-410)", () => {
  it("returns 'critical' when artist is null", () => {
    expect(computeHealthStatus(meta({ artist: null }))).toBe("critical");
  });

  it("returns 'critical' when title is null", () => {
    expect(computeHealthStatus(meta({ title: null }))).toBe("critical");
  });

  it("returns 'critical' when both artist and title are null", () => {
    expect(computeHealthStatus(meta({ artist: null, title: null }))).toBe(
      "critical",
    );
  });

  it("returns 'critical' when corrupted flag is true even if metadata is complete", () => {
    expect(computeHealthStatus(FULL_METADATA, true)).toBe("critical");
  });

  it("critical takes priority over alert (artist null + album null)", () => {
    expect(computeHealthStatus(meta({ artist: null, album: null }))).toBe(
      "critical",
    );
  });

  it("critical takes priority over warning (artist null + genre null)", () => {
    expect(computeHealthStatus(meta({ artist: null, genre: null }))).toBe(
      "critical",
    );
  });
});
