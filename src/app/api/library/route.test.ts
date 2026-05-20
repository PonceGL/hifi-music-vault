/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { libraryServer } from "@/app/api/library/library.server";
import { BadRequestError } from "@/lib/httpErrors";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import type { LibraryResponseDto } from "@/app/api/library/dtos/library.dto";

jest.mock("@/app/api/library/library.server", () => ({
  libraryServer: { getLibrary: jest.fn() },
}));

const mockGetLibrary = libraryServer.getLibrary as jest.Mock;

const LIBRARY = "/library";
const CONFIG = { downloadsPath: "/downloads", libraryPath: LIBRARY };

const EMPTY_RESPONSE: LibraryResponseDto = {
  tracks: [],
  total: 0,
  page: 1,
};

function makeRequest(url: string, cookie?: string): NextRequest {
  return new NextRequest(url, {
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

const BASE_URL = "http://localhost/api/library";

beforeEach(() => jest.clearAllMocks());

describe("GET /api/library — missing cookie (MFM-422)", () => {
  it("returns 400 when cookie is absent", async () => {
    const res = await GET(makeRequest(BASE_URL));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/library — success (MFM-422)", () => {
  it("returns 200 with library data", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    const res = await GET(makeRequest(BASE_URL, withConfig(CONFIG)));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(EMPTY_RESPONSE);
  });

  it("passes libraryPath from cookie to libraryServer", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    await GET(makeRequest(BASE_URL, withConfig(CONFIG)));

    expect(mockGetLibrary).toHaveBeenCalledWith(
      LIBRARY,
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it("passes page and limit query params to libraryServer", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    await GET(makeRequest(`${BASE_URL}?page=2&limit=10`, withConfig(CONFIG)));

    expect(mockGetLibrary).toHaveBeenCalledWith(
      LIBRARY,
      expect.objectContaining({ page: 2, limit: 10 }),
    );
  });

  it("passes format filter to libraryServer", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    await GET(makeRequest(`${BASE_URL}?format=flac`, withConfig(CONFIG)));

    expect(mockGetLibrary).toHaveBeenCalledWith(
      LIBRARY,
      expect.objectContaining({ format: "flac" }),
    );
  });

  it("passes health filter to libraryServer", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    await GET(makeRequest(`${BASE_URL}?health=warning`, withConfig(CONFIG)));

    expect(mockGetLibrary).toHaveBeenCalledWith(
      LIBRARY,
      expect.objectContaining({ health: "warning" }),
    );
  });
});

describe("GET /api/library — validation errors (MFM-422)", () => {
  it("returns 400 for invalid page param", async () => {
    mockGetLibrary.mockResolvedValue(EMPTY_RESPONSE);

    const res = await GET(
      makeRequest(`${BASE_URL}?page=-1`, withConfig(CONFIG)),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid format param", async () => {
    const res = await GET(
      makeRequest(`${BASE_URL}?format=unknown`, withConfig(CONFIG)),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/library — service errors (MFM-422)", () => {
  it("returns 400 when service throws BadRequestError", async () => {
    mockGetLibrary.mockRejectedValue(new BadRequestError("Library not found"));

    const res = await GET(makeRequest(BASE_URL, withConfig(CONFIG)));
    expect(res.status).toBe(400);
  });

  it("returns 500 for unexpected errors", async () => {
    mockGetLibrary.mockRejectedValue(new Error("disk failure"));

    const res = await GET(makeRequest(BASE_URL, withConfig(CONFIG)));
    expect(res.status).toBe(500);
  });
});
