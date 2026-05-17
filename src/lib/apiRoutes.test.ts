import { API_ROUTES } from "./apiRoutes";

describe("API_ROUTES", () => {
  describe("fs.dialog", () => {
    it("returns the correct dialog endpoint path", () => {
      expect(API_ROUTES.fs.dialog).toBe("/api/fs/dialog");
    });

    it("starts with /api/", () => {
      expect(API_ROUTES.fs.dialog).toMatch(/^\/api\//);
    });
  });

  describe("fs.validate", () => {
    it("includes the encoded path as a query parameter", () => {
      const result = API_ROUTES.fs.validate("/Users/test/Downloads");
      expect(result).toContain("path=%2FUsers%2Ftest%2FDownloads");
    });

    it("starts with /api/fs", () => {
      const result = API_ROUTES.fs.validate("/any/path");
      expect(result).toMatch(/^\/api\/fs\?/);
    });

    it("URL-encodes spaces in the path", () => {
      const result = API_ROUTES.fs.validate("/Users/My Music/Downloads");
      expect(result).toContain("My+Music");
    });

    it("URL-encodes special characters", () => {
      const result = API_ROUTES.fs.validate("/path/with?question&mark");
      expect(result).not.toMatch(/\?path=.*[?&]/);
    });

    it("generates different URLs for different paths", () => {
      const a = API_ROUTES.fs.validate("/downloads");
      const b = API_ROUTES.fs.validate("/library");
      expect(a).not.toBe(b);
    });
  });
});
