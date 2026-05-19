import { storage } from "./localStorageAdapter";

describe("LocalStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("returns null when the key does not exist", () => {
      expect(storage.get("missing")).toBeNull();
    });

    it("returns the parsed value when the key exists", () => {
      localStorage.setItem("key", JSON.stringify({ name: "test" }));
      expect(storage.get<{ name: string }>("key")).toEqual({ name: "test" });
    });

    it("returns null when JSON is corrupted — never throws", () => {
      localStorage.setItem("bad", "not-json{{{");
      expect(storage.get("bad")).toBeNull();
    });

    it("handles primitive string values", () => {
      storage.set("theme", "dark");
      expect(storage.get<string>("theme")).toBe("dark");
    });

    it("handles numeric values", () => {
      storage.set("count", 42);
      expect(storage.get<number>("count")).toBe(42);
    });
  });

  describe("set", () => {
    it("stores the value serialized as JSON", () => {
      storage.set("config", { path: "/home" });
      expect(localStorage.getItem("config")).toBe(
        JSON.stringify({ path: "/home" }),
      );
    });

    it("overwrites an existing value", () => {
      storage.set("key", "first");
      storage.set("key", "second");
      expect(storage.get<string>("key")).toBe("second");
    });

    it("stores complex nested objects correctly", () => {
      const value = { downloadsPath: "/downloads", libraryPath: "/music" };
      storage.set("folder-config", value);
      expect(storage.get("folder-config")).toEqual(value);
    });
  });

  describe("remove", () => {
    it("removes an existing key", () => {
      storage.set("key", "value");
      storage.remove("key");
      expect(storage.get("key")).toBeNull();
    });

    it("does not throw when removing a non-existent key", () => {
      expect(() => storage.remove("nonexistent")).not.toThrow();
    });
  });

  describe("clear", () => {
    it("removes all stored keys", () => {
      storage.set("a", 1);
      storage.set("b", 2);
      storage.clear();
      expect(storage.get("a")).toBeNull();
      expect(storage.get("b")).toBeNull();
    });
  });
});
