import path from "path";
import { buildDestPath, sanitizeName } from "./pathBuilder";
import type { MinimalMetadata } from "./validator";

const LIBRARY = "/library";

function meta(overrides: Partial<MinimalMetadata> = {}): MinimalMetadata {
  return {
    artist: "Queen",
    album: "A Night at the Opera",
    title: "Bohemian Rhapsody",
    year: 1975,
    trackNumber: 11,
    ...overrides,
  };
}

describe("buildDestPath — all fields present (MFM-433)", () => {
  it("artist+album+year+track+title → /Artist/Album [Year]/## - Title.ext", () => {
    const result = buildDestPath(LIBRARY, meta(), ".flac");
    expect(result).toBe(
      path.join(
        LIBRARY,
        "Queen",
        "A Night at the Opera [1975]",
        "11 - Bohemian Rhapsody.flac",
      ),
    );
  });
});

describe("buildDestPath — optional fields absent (MFM-433)", () => {
  it("no year → /Artist/Album/## - Title.ext", () => {
    const result = buildDestPath(LIBRARY, meta({ year: null }), ".flac");
    expect(result).toBe(
      path.join(
        LIBRARY,
        "Queen",
        "A Night at the Opera",
        "11 - Bohemian Rhapsody.flac",
      ),
    );
  });

  it("no track → /Artist/Album [Year]/Title.ext", () => {
    const result = buildDestPath(LIBRARY, meta({ trackNumber: null }), ".flac");
    expect(result).toBe(
      path.join(
        LIBRARY,
        "Queen",
        "A Night at the Opera [1975]",
        "Bohemian Rhapsody.flac",
      ),
    );
  });

  it("no year, no track → /Artist/Album/Title.ext", () => {
    const result = buildDestPath(
      LIBRARY,
      meta({ year: null, trackNumber: null }),
      ".flac",
    );
    expect(result).toBe(
      path.join(
        LIBRARY,
        "Queen",
        "A Night at the Opera",
        "Bohemian Rhapsody.flac",
      ),
    );
  });
});

describe("buildDestPath — track number padding (MFM-433)", () => {
  it("pads single-digit track numbers with leading zero", () => {
    const result = buildDestPath(LIBRARY, meta({ trackNumber: 3 }), ".mp3");
    expect(result).toContain("03 - ");
  });

  it("does not add extra padding for two-digit track numbers", () => {
    const result = buildDestPath(LIBRARY, meta({ trackNumber: 12 }), ".mp3");
    expect(result).toContain("12 - ");
  });
});

describe("sanitizeName — macOS/Linux (MFM-433)", () => {
  it("replaces : with _", () => {
    expect(sanitizeName("AC:DC", "darwin")).toBe("AC_DC");
  });

  it("replaces / with _", () => {
    expect(sanitizeName("Rock/Pop", "darwin")).toBe("Rock_Pop");
  });

  it("leaves normal characters unchanged", () => {
    expect(sanitizeName("Hello World", "darwin")).toBe("Hello World");
  });
});

describe("sanitizeName — Windows (MFM-433)", () => {
  it('replaces < > : " | ? * with _', () => {
    const input = 'file<>:"|?*name';
    const result = sanitizeName(input, "win32");
    expect(result).not.toMatch(/[<>:"|?*]/);
  });

  it("removes trailing dots and spaces", () => {
    expect(sanitizeName("album name...", "win32")).toBe("album name");
  });
});

describe("sanitizeName — edge cases (MFM-433)", () => {
  it("returns _ when name is empty after sanitization", () => {
    expect(sanitizeName(":", "darwin")).toBe("_");
  });

  it("truncates names longer than 255 chars", () => {
    const long = "a".repeat(300);
    expect(sanitizeName(long, "darwin")).toHaveLength(255);
  });
});
