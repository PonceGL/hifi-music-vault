jest.mock("child_process");

import { execFile } from "child_process";
import { validateMinimalMetadata } from "./validator";

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;
const FILE = "/downloads/track.flac";

function mockFfprobe(tags: Record<string, string>): void {
  mockExecFile.mockImplementation((...args: unknown[]) => {
    const cb = args[args.length - 1] as (
      err: null,
      r: { stdout: string; stderr: string },
    ) => void;
    cb(null, {
      stdout: JSON.stringify({ format: { tags } }),
      stderr: "",
    });
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

beforeEach(() => jest.clearAllMocks());

describe("validateMinimalMetadata — required fields (MFM-431)", () => {
  it("returns valid=true when artist, album and title are all present", async () => {
    mockFfprobe({ title: "Song", artist: "Artist", album: "Album" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(true);
    expect(r.metadata).not.toBeNull();
  });

  it("returns valid=false when title is missing", async () => {
    mockFfprobe({ artist: "Artist", album: "Album" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(false);
    expect(r.metadata).toBeNull();
  });

  it("returns valid=false when artist is missing", async () => {
    mockFfprobe({ title: "Song", album: "Album" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(false);
  });

  it("returns valid=false when album is missing", async () => {
    mockFfprobe({ title: "Song", artist: "Artist" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(false);
  });

  it("returns valid=false when all required fields are missing", async () => {
    mockFfprobe({});
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(false);
  });
});

describe("validateMinimalMetadata — optional fields (MFM-431)", () => {
  it("includes year when date tag is present", async () => {
    mockFfprobe({ title: "T", artist: "A", album: "B", date: "1975" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.metadata?.year).toBe(1975);
  });

  it("includes trackNumber when track tag is present", async () => {
    mockFfprobe({ title: "T", artist: "A", album: "B", track: "11/12" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.metadata?.trackNumber).toBe(11);
  });

  it("sets year to null when date tag is absent", async () => {
    mockFfprobe({ title: "T", artist: "A", album: "B" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.metadata?.year).toBeNull();
  });

  it("sets trackNumber to null when track tag is absent", async () => {
    mockFfprobe({ title: "T", artist: "A", album: "B" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.metadata?.trackNumber).toBeNull();
  });

  it("reads uppercase TAG keys (TITLE, ARTIST, ALBUM)", async () => {
    mockFfprobe({ TITLE: "T", ARTIST: "A", ALBUM: "B" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(true);
    expect(r.metadata?.title).toBe("T");
  });
});

describe("validateMinimalMetadata — ffprobe failure (MFM-431)", () => {
  it("returns valid=false when ffprobe fails", async () => {
    mockFfprobeError();
    const r = await validateMinimalMetadata(FILE);
    expect(r.valid).toBe(false);
    expect(r.metadata).toBeNull();
  });

  it("returns the filePath in the result", async () => {
    mockFfprobe({ title: "T", artist: "A", album: "B" });
    const r = await validateMinimalMetadata(FILE);
    expect(r.filePath).toBe(FILE);
  });
});
