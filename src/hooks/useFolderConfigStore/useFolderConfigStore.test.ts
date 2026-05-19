import { act, renderHook } from "@testing-library/react";
import { useFolderConfigStore } from "./index";

const COOKIE_NAME = "folder-configured";

function getCookieValue(): string | null {
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
}

function setCookie(config: {
  downloadsPath: string;
  libraryPath: string;
}): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(config))}; path=/`;
}

function clearCookie(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
}

describe("useFolderConfigStore", () => {
  beforeEach(() => {
    localStorage.clear();
    clearCookie();
    jest.clearAllMocks();
  });

  // ─── initial state ────────────────────────────────────────────────────────

  it("returns folderConfig as null when localStorage and cookie are both empty", () => {
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toBeNull();
  });

  it("returns folderConfig as null when only downloadsPath is set in localStorage", () => {
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: null }),
    );
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toBeNull();
  });

  it("returns the full config when both paths are present in localStorage", () => {
    const config = { downloadsPath: "/downloads", libraryPath: "/music" };
    localStorage.setItem("folder-config", JSON.stringify(config));
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toEqual(config);
  });

  // ─── localStorage reconciliation from cookie ──────────────────────────────

  it("restores folderConfig from cookie when localStorage is empty", () => {
    const config = { downloadsPath: "/downloads", libraryPath: "/music" };
    setCookie(config);

    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toEqual(config);
  });

  it("prefers localStorage over cookie when both are present", () => {
    const lsConfig = {
      downloadsPath: "/ls-downloads",
      libraryPath: "/ls-music",
    };
    const cookieConfig = {
      downloadsPath: "/cookie-downloads",
      libraryPath: "/cookie-music",
    };
    localStorage.setItem("folder-config", JSON.stringify(lsConfig));
    setCookie(cookieConfig);

    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toEqual(lsConfig);
  });

  it("returns null when cookie has only downloadsPath", () => {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: null }),
    )}; path=/`;

    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toBeNull();
  });

  // ─── saveFolderConfig ─────────────────────────────────────────────────────

  it("saveFolderConfig persists to localStorage and updates state", () => {
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.saveFolderConfig({
        downloadsPath: "/downloads",
        libraryPath: "/music",
      });
    });

    expect(result.current.folderConfig).toEqual({
      downloadsPath: "/downloads",
      libraryPath: "/music",
    });
    expect(localStorage.getItem("folder-config")).toBe(
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: "/music" }),
    );
  });

  it("saveFolderConfig writes JSON-encoded config to cookie", () => {
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.saveFolderConfig({
        downloadsPath: "/downloads",
        libraryPath: "/music",
      });
    });

    const raw = getCookieValue();
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({
      downloadsPath: "/downloads",
      libraryPath: "/music",
    });
  });

  // ─── clearFolderConfig ────────────────────────────────────────────────────

  it("clearFolderConfig removes the key from localStorage and resets to null", () => {
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: "/music" }),
    );
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.clearFolderConfig();
    });

    expect(result.current.folderConfig).toBeNull();
    expect(localStorage.getItem("folder-config")).toBeNull();
  });

  it("clearFolderConfig clears the cookie", () => {
    setCookie({ downloadsPath: "/downloads", libraryPath: "/music" });
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.clearFolderConfig();
    });

    expect(getCookieValue()).toBeNull();
  });

  it("clearFolderConfig does not affect any other localStorage key", () => {
    localStorage.setItem("other-key", "other-value");
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/d", libraryPath: "/l" }),
    );
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.clearFolderConfig();
    });

    expect(localStorage.getItem("other-key")).toBe("other-value");
  });
});
