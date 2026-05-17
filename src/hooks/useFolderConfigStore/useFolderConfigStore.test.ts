import { act, renderHook } from "@testing-library/react";
import { useFolderConfigStore } from "./index";

describe("useFolderConfigStore", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns folderConfig as null when localStorage is empty", () => {
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toBeNull();
  });

  it("returns folderConfig as null when only downloadsPath is set", () => {
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: null })
    );
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toBeNull();
  });

  it("returns the full config when both paths are present", () => {
    const config = { downloadsPath: "/downloads", libraryPath: "/music" };
    localStorage.setItem("folder-config", JSON.stringify(config));
    const { result } = renderHook(() => useFolderConfigStore());
    expect(result.current.folderConfig).toEqual(config);
  });

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
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: "/music" })
    );
  });

  it("clearFolderConfig removes the key from localStorage and resets to null", () => {
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/downloads", libraryPath: "/music" })
    );
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.clearFolderConfig();
    });

    expect(result.current.folderConfig).toBeNull();
    expect(localStorage.getItem("folder-config")).toBeNull();
  });

  it("clearFolderConfig does not affect any other localStorage key", () => {
    localStorage.setItem("other-key", "other-value");
    localStorage.setItem(
      "folder-config",
      JSON.stringify({ downloadsPath: "/d", libraryPath: "/l" })
    );
    const { result } = renderHook(() => useFolderConfigStore());

    act(() => {
      result.current.clearFolderConfig();
    });

    expect(localStorage.getItem("other-key")).toBe("other-value");
  });
});
