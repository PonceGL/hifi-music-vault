/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const BASE = "http://localhost:3000";

function makeRequest(pathname: string, cookieConfig?: object): NextRequest {
  const url = `${BASE}${pathname}`;
  const req = new NextRequest(url);
  if (cookieConfig) {
    req.cookies.set(
      "folder-configured",
      encodeURIComponent(JSON.stringify(cookieConfig)),
    );
  }
  return req;
}

const VALID_CONFIG = {
  downloadsPath: "/Users/test/Downloads",
  libraryPath: "/Users/test/Music",
};

describe("proxy", () => {
  // ─── /onboarding ──────────────────────────────────────────────────────────

  describe("/onboarding", () => {
    it("allows access when not configured", () => {
      const res = proxy(makeRequest("/onboarding"));
      expect(res.status).not.toBe(307);
    });

    it("redirects to Library when already configured", () => {
      const res = proxy(makeRequest("/onboarding", VALID_CONFIG));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${BASE}/`);
    });
  });

  // ─── protected routes ─────────────────────────────────────────────────────

  describe("protected routes", () => {
    it("redirects to /onboarding when not configured", () => {
      const res = proxy(makeRequest("/"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${BASE}/onboarding`);
    });

    it("allows access when configured", () => {
      const res = proxy(makeRequest("/", VALID_CONFIG));
      expect(res.status).not.toBe(307);
    });

    it("redirects /artists to /onboarding when not configured", () => {
      const res = proxy(makeRequest("/artists"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${BASE}/onboarding`);
    });

    it("allows /artists when configured", () => {
      const res = proxy(makeRequest("/artists", VALID_CONFIG));
      expect(res.status).not.toBe(307);
    });

    it("allows /settings when configured", () => {
      const res = proxy(makeRequest("/settings", VALID_CONFIG));
      expect(res.status).not.toBe(307);
    });
  });

  // ─── invalid / corrupt cookie ──────────────────────────────────────────────

  describe("invalid cookie", () => {
    it("treats a corrupt cookie as not configured", () => {
      const req = new NextRequest(`${BASE}/`);
      req.cookies.set("folder-configured", "not-valid-json{{{");
      const res = proxy(req);
      expect(res.status).toBe(307);
    });

    it("treats a cookie with only downloadsPath as not configured", () => {
      const res = proxy(
        makeRequest("/", { downloadsPath: "/path", libraryPath: "" }),
      );
      expect(res.status).toBe(307);
    });

    it("treats a cookie with only libraryPath as not configured", () => {
      const res = proxy(
        makeRequest("/", { downloadsPath: "", libraryPath: "/path" }),
      );
      expect(res.status).toBe(307);
    });

    it("redirects /onboarding to Library even with only a partial valid cookie if both paths are present", () => {
      const res = proxy(makeRequest("/onboarding", VALID_CONFIG));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${BASE}/`);
    });
  });
});
