import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./index";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns initialValue when the key does not exist", () => {
    const { result } = renderHook(() =>
      useLocalStorage("missing-key", "default"),
    );
    expect(result.current[0]).toBe("default");
  });

  it("reads an existing value from localStorage on mount", () => {
    localStorage.setItem("theme", JSON.stringify("dark"));
    const { result } = renderHook(() => useLocalStorage("theme", "light"));
    expect(result.current[0]).toBe("dark");
  });

  it("falls back to initialValue when localStorage contains corrupted JSON", () => {
    localStorage.setItem("bad", "not-valid-json{{{");
    const { result } = renderHook(() => useLocalStorage("bad", 0));
    expect(result.current[0]).toBe(0);
  });

  it("setValue updates the returned state", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
  });

  it("setValue persists the new value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("name", "default"));

    act(() => {
      result.current[1]("updated");
    });

    expect(localStorage.getItem("name")).toBe(JSON.stringify("updated"));
  });

  it("removeValue resets state to initialValue", () => {
    const { result } = renderHook(() => useLocalStorage("key", "init"));

    act(() => {
      result.current[1]("stored");
    });
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("init");
  });

  it("removeValue deletes the key from localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("key", "init"));

    act(() => {
      result.current[1]("stored");
    });
    act(() => {
      result.current[2]();
    });

    expect(localStorage.getItem("key")).toBeNull();
  });

  it("works with complex object types", () => {
    type Config = { downloadsPath: string | null; libraryPath: string | null };
    const initial: Config = { downloadsPath: null, libraryPath: null };
    const updated: Config = {
      downloadsPath: "/downloads",
      libraryPath: "/music",
    };

    const { result } = renderHook(() =>
      useLocalStorage<Config>("config", initial),
    );

    act(() => {
      result.current[1](updated);
    });

    expect(result.current[0]).toEqual(updated);
    expect(localStorage.getItem("config")).toBe(JSON.stringify(updated));
  });

  it("each key is independent — changes to one do not affect another", () => {
    const { result: a } = renderHook(() => useLocalStorage("a", 0));
    const { result: b } = renderHook(() => useLocalStorage("b", 0));

    act(() => {
      a.current[1](1);
    });

    expect(a.current[0]).toBe(1);
    expect(b.current[0]).toBe(0);
  });
});
