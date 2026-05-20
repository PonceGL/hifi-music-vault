jest.mock("@/server/library/index", () => ({
  buildLibraryIndex: jest.fn(),
}));

import { buildLibraryIndex } from "@/server/library/index";
import { libraryServer } from "./library.server";
import type { Track } from "@/types/track";
import type { LibraryQueryDto } from "@/app/api/library/dtos/library.dto";

const mockBuildIndex = buildLibraryIndex as jest.Mock;

const DEFAULT_QUERY: LibraryQueryDto = {
  page: 1,
  limit: 20,
  sort: "title",
  order: "asc",
};

function makeTrack(overrides: Partial<Track> & { id: string }): Track {
  return {
    filePath: `/library/${overrides.id}.flac`,
    fileName: `${overrides.id}.flac`,
    metadata: {
      title: overrides.id,
      artist: "Artist",
      albumArtist: null,
      album: "Album",
      year: 2020,
      genre: "Rock",
      trackNumber: 1,
      totalTracks: null,
      discNumber: null,
      totalDiscs: null,
      composer: null,
      comment: null,
      artwork: null,
      bitrate: 1411,
      sampleRate: 44100,
      musicBrainzId: null,
    },
    healthStatus: "complete",
    format: "flac",
    size: 10_000_000,
    duration: 200,
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe("libraryServer.getLibrary — basic (MFM-420)", () => {
  it("returns empty tracks and total 0 for empty library", async () => {
    mockBuildIndex.mockResolvedValue([]);

    const result = await libraryServer.getLibrary("/library", DEFAULT_QUERY);

    expect(result.tracks).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
  });

  it("returns all tracks when count ≤ limit", async () => {
    const tracks = [makeTrack({ id: "a" }), makeTrack({ id: "b" })];
    mockBuildIndex.mockResolvedValue(tracks);

    const result = await libraryServer.getLibrary("/library", DEFAULT_QUERY);

    expect(result.tracks).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("passes libraryPath to buildLibraryIndex", async () => {
    mockBuildIndex.mockResolvedValue([]);
    await libraryServer.getLibrary("/my/library", DEFAULT_QUERY);
    expect(mockBuildIndex).toHaveBeenCalledWith("/my/library");
  });
});

describe("libraryServer.getLibrary — pagination (MFM-420)", () => {
  const tracks = Array.from({ length: 25 }, (_, i) =>
    makeTrack({ id: `track-${String(i).padStart(2, "0")}` }),
  );

  beforeEach(() => mockBuildIndex.mockResolvedValue(tracks));

  it("returns first page with default limit of 20", async () => {
    const result = await libraryServer.getLibrary("/library", DEFAULT_QUERY);

    expect(result.tracks).toHaveLength(20);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
  });

  it("returns remaining tracks on second page", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      page: 2,
    });

    expect(result.tracks).toHaveLength(5);
    expect(result.page).toBe(2);
  });

  it("returns empty tracks for page beyond total", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      page: 10,
    });

    expect(result.tracks).toHaveLength(0);
    expect(result.total).toBe(25);
  });

  it("respects custom limit", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      limit: 5,
    });

    expect(result.tracks).toHaveLength(5);
    expect(result.total).toBe(25);
  });
});

describe("libraryServer.getLibrary — filter by format (MFM-420)", () => {
  const mixed = [
    makeTrack({ id: "a", format: "flac" }),
    makeTrack({ id: "b", format: "mp3" }),
    makeTrack({ id: "c", format: "flac" }),
  ];

  beforeEach(() => mockBuildIndex.mockResolvedValue(mixed));

  it("returns only flac tracks when format=flac", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      format: "flac",
    });

    expect(result.tracks).toHaveLength(2);
    expect(result.total).toBe(2);
    result.tracks.forEach((t) => expect(t.format).toBe("flac"));
  });

  it("returns only mp3 tracks when format=mp3", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      format: "mp3",
    });

    expect(result.tracks).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("returns all tracks when no format filter", async () => {
    const result = await libraryServer.getLibrary("/library", DEFAULT_QUERY);
    expect(result.total).toBe(3);
  });
});

describe("libraryServer.getLibrary — filter by health (MFM-420)", () => {
  const tracks = [
    makeTrack({ id: "ok", healthStatus: "complete" }),
    makeTrack({ id: "warn", healthStatus: "warning" }),
    makeTrack({ id: "crit", healthStatus: "critical" }),
  ];

  beforeEach(() => mockBuildIndex.mockResolvedValue(tracks));

  it("filters by healthStatus=complete", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      health: "complete",
    });

    expect(result.total).toBe(1);
    expect(result.tracks[0].healthStatus).toBe("complete");
  });

  it("filters by healthStatus=warning", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      health: "warning",
    });

    expect(result.total).toBe(1);
  });

  it("returns 0 tracks for health with no matches", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      health: "alert",
    });

    expect(result.total).toBe(0);
  });
});

describe("libraryServer.getLibrary — sorting (MFM-420)", () => {
  const base = makeTrack({ id: "x" });
  const charlie = {
    ...base,
    id: "c",
    metadata: { ...base.metadata, title: "Charlie" },
  };
  const alpha = {
    ...base,
    id: "a",
    metadata: { ...base.metadata, title: "Alpha" },
  };
  const beta = {
    ...base,
    id: "b",
    metadata: { ...base.metadata, title: "Beta" },
  };

  beforeEach(() => mockBuildIndex.mockResolvedValue([charlie, alpha, beta]));

  it("sorts by title asc by default", async () => {
    const result = await libraryServer.getLibrary("/library", DEFAULT_QUERY);
    const titles = result.tracks.map((t) => t.metadata.title);
    expect(titles).toEqual(["Alpha", "Beta", "Charlie"]);
  });

  it("sorts by title desc when order=desc", async () => {
    const result = await libraryServer.getLibrary("/library", {
      ...DEFAULT_QUERY,
      order: "desc",
    });
    const titles = result.tracks.map((t) => t.metadata.title);
    expect(titles).toEqual(["Charlie", "Beta", "Alpha"]);
  });
});
