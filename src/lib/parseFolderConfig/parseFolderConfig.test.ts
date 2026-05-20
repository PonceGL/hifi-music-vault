/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { parseFolderConfigCookie } from "./index";
import { BadRequestError } from "@/lib/httpErrors";
import { COOKIE_KEYS } from "@/constants/cookieKeys";

const DOWNLOADS = "/downloads";
const LIBRARY = "/library";
const VALID_CONFIG = { downloadsPath: DOWNLOADS, libraryPath: LIBRARY };

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

describe("parseFolderConfigCookie — missing cookie", () => {
  it("throws BadRequestError when cookie is absent", () => {
    expect(() => parseFolderConfigCookie(makeRequest())).toThrow(
      BadRequestError,
    );
  });

  it("error message mentions folder configuration", () => {
    expect(() => parseFolderConfigCookie(makeRequest())).toThrow(
      /carpetas no encontrada/i,
    );
  });
});

describe("parseFolderConfigCookie — malformed cookie", () => {
  it("throws BadRequestError when cookie value is not valid JSON", () => {
    const req = makeRequest(`${COOKIE_KEYS.folderConfigured}=not-valid-json`);
    expect(() => parseFolderConfigCookie(req)).toThrow(BadRequestError);
  });
});

describe("parseFolderConfigCookie — invalid paths", () => {
  it("throws BadRequestError when downloadsPath is empty", () => {
    expect(() =>
      parseFolderConfigCookie(
        makeRequest(withConfig({ downloadsPath: "", libraryPath: LIBRARY })),
      ),
    ).toThrow(BadRequestError);
  });

  it("throws BadRequestError when libraryPath is empty", () => {
    expect(() =>
      parseFolderConfigCookie(
        makeRequest(withConfig({ downloadsPath: DOWNLOADS, libraryPath: "" })),
      ),
    ).toThrow(BadRequestError);
  });

  it("throws BadRequestError when both paths are null", () => {
    expect(() =>
      parseFolderConfigCookie(
        makeRequest(withConfig({ downloadsPath: null, libraryPath: null })),
      ),
    ).toThrow(BadRequestError);
  });
});

describe("parseFolderConfigCookie — valid config", () => {
  it("returns downloadsPath and libraryPath as strings", () => {
    const result = parseFolderConfigCookie(
      makeRequest(withConfig(VALID_CONFIG)),
    );
    expect(result.downloadsPath).toBe(DOWNLOADS);
    expect(result.libraryPath).toBe(LIBRARY);
  });

  it("returns object with only the two path keys", () => {
    const result = parseFolderConfigCookie(
      makeRequest(withConfig(VALID_CONFIG)),
    );
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(["downloadsPath", "libraryPath"]),
    );
  });
});
