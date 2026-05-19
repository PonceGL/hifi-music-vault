/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { statusServer } from "@/app/api/library/status/status.server";
import { BadRequestError } from "@/lib/httpErrors";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import type { StatusResponseDto } from "@/app/api/library/status/dtos/status.dto";

jest.mock("@/app/api/library/status/status.server", () => ({
  statusServer: { getStatus: jest.fn() },
}));

const mockGetStatus = statusServer.getStatus as jest.Mock;

const DOWNLOADS = "/downloads";
const LIBRARY = "/library";
const CONFIG = { downloadsPath: DOWNLOADS, libraryPath: LIBRARY };

const MOCK_STATUS: StatusResponseDto = {
  downloads: { count: 3, byFormat: { mp3: 2, flac: 1 } },
  library: { count: 10, byFormat: { flac: 10 } },
};

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/library/status", {
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/library/status — missing cookie (MFM-417)", () => {
  it("returns 400 when cookie is absent", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns success: false when cookie is absent", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

describe("GET /api/library/status — invalid config (MFM-417)", () => {
  it("returns 400 when downloadsPath is empty", async () => {
    const res = await GET(
      makeRequest(withConfig({ downloadsPath: "", libraryPath: LIBRARY })),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when libraryPath is empty", async () => {
    const res = await GET(
      makeRequest(withConfig({ downloadsPath: DOWNLOADS, libraryPath: "" })),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/library/status — success (MFM-417)", () => {
  it("returns 200 with status data", async () => {
    mockGetStatus.mockResolvedValue(MOCK_STATUS);

    const res = await GET(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(MOCK_STATUS);
  });

  it("calls statusServer.getStatus with the paths from cookie", async () => {
    mockGetStatus.mockResolvedValue(MOCK_STATUS);

    await GET(makeRequest(withConfig(CONFIG)));

    expect(mockGetStatus).toHaveBeenCalledWith(DOWNLOADS, LIBRARY);
  });
});

describe("GET /api/library/status — service errors (MFM-417)", () => {
  it("returns 400 when statusServer throws BadRequestError", async () => {
    mockGetStatus.mockRejectedValue(
      new BadRequestError("Carpeta no disponible"),
    );

    const res = await GET(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 500 for unexpected errors", async () => {
    mockGetStatus.mockRejectedValue(new Error("disk failure"));

    const res = await GET(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(500);
  });
});
