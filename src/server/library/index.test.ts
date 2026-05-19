import path from "path";

jest.mock("child_process");
jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    stat: jest.fn(),
  },
}));

import { execFile } from "child_process";
import { promises as fsMock } from "fs";
import { buildLibraryIndex } from "./index";

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;
const mockReaddir = fsMock.readdir as jest.Mock;
const mockStat = fsMock.stat as jest.Mock;

const LIBRARY = "/library";
const FLAC_PATH = path.join(LIBRARY, "Bohemian Rhapsody.flac");

const GOOD_FFPROBE: object = {
  streams: [{ codec_type: "audio", codec_name: "flac", sample_rate: "44100" }],
  format: {
    filename: FLAC_PATH,
    duration: "354.08",
    size: "43000000",
    bit_rate: "1411000",
    tags: {
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      genre: "Rock",
      track: "11/12",
      date: "1975",
    },
  },
};

function mockFfprobeSuccess(output: object): void {
  mockExecFile.mockImplementation((...args: unknown[]) => {
    const cb = args[args.length - 1] as (
      err: null,
      result: { stdout: string; stderr: string },
    ) => void;
    cb(null, { stdout: JSON.stringify(output), stderr: "" });
    return {} as ReturnType<typeof execFile>;
  });
}

function mockFfprobeError(): void {
  mockExecFile.mockImplementation((...args: unknown[]) => {
    const cb = args[args.length - 1] as (err: Error) => void;
    cb(new Error("ffprobe failed"));
    return {} as ReturnType<typeof execFile>;
  });
}

function mockDirWithFiles(files: string[]): void {
  mockReaddir.mockImplementation((dir: string, opts?: object) => {
    if (dir === LIBRARY) {
      if (opts && (opts as { withFileTypes?: boolean }).withFileTypes) {
        return Promise.resolve(
          files.map((f) => ({
            name: path.basename(f),
            isDirectory: () => false,
            isFile: () => true,
          })),
        );
      }
      return Promise.resolve(files.map((f) => path.basename(f)));
    }
    return Promise.resolve([]);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStat.mockResolvedValue({ size: 43000000 });
});

describe("buildLibraryIndex — empty library (MFM-409)", () => {
  it("returns empty array when library folder is empty", async () => {
    mockReaddir.mockResolvedValue([]);
    expect(await buildLibraryIndex(LIBRARY)).toEqual([]);
  });

  it("returns empty array when readdir fails", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));
    expect(await buildLibraryIndex(LIBRARY)).toEqual([]);
  });

  it("ignores non-audio files", async () => {
    mockDirWithFiles([path.join(LIBRARY, "cover.jpg")]);
    expect(await buildLibraryIndex(LIBRARY)).toEqual([]);
  });
});

describe("buildLibraryIndex — scan correct (MFM-409)", () => {
  it("returns one track for one audio file", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const tracks = await buildLibraryIndex(LIBRARY);
    expect(tracks).toHaveLength(1);
  });

  it("sets filePath on the track", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(track.filePath).toBe(FLAC_PATH);
  });

  it("sets fileName from basename", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(track.fileName).toBe("Bohemian Rhapsody.flac");
  });

  it("sets format to 'flac' for .flac files", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(track.format).toBe("flac");
  });

  it("reads title and artist from ffprobe tags", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(track.metadata.title).toBe("Bohemian Rhapsody");
    expect(track.metadata.artist).toBe("Queen");
  });

  it("sets duration from ffprobe format.duration", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(track.duration).toBeCloseTo(354.08);
  });

  it("generates a stable id from file path", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess(GOOD_FFPROBE);

    const [t1] = await buildLibraryIndex(LIBRARY);
    const [t2] = await buildLibraryIndex(LIBRARY);
    expect(t1.id).toBe(t2.id);
    expect(t1.id).toHaveLength(32);
  });
});

describe("buildLibraryIndex — non-audio ignored (MFM-409)", () => {
  it("skips .jpg, .txt, .pdf files", async () => {
    const nonAudio = [".jpg", ".txt", ".pdf"].map((ext) =>
      path.join(LIBRARY, `file${ext}`),
    );
    mockDirWithFiles(nonAudio);

    expect(await buildLibraryIndex(LIBRARY)).toEqual([]);
  });

  it("skips file when ffprobe fails", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeError();

    expect(await buildLibraryIndex(LIBRARY)).toEqual([]);
  });
});

describe("buildLibraryIndex — health status (MFM-409)", () => {
  it("sets healthStatus from computeHealthStatus", async () => {
    mockDirWithFiles([FLAC_PATH]);
    mockFfprobeSuccess({
      ...GOOD_FFPROBE,
      format: {
        ...(GOOD_FFPROBE as { format: object }).format,
        tags: { title: "T", artist: "A", album: "B", genre: "Rock" },
      },
    });

    const [track] = await buildLibraryIndex(LIBRARY);
    expect(["complete", "warning", "alert", "critical"]).toContain(
      track.healthStatus,
    );
  });
});
