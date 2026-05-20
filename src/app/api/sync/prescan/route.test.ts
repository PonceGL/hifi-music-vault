/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prescanServer } from "@/app/api/sync/prescan/prescan.server";
import { BadRequestError } from "@/lib/httpErrors";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import type { PrescanResponseDto } from "@/app/api/sync/prescan/dtos/prescan.dto";

jest.mock("@/app/api/sync/prescan/prescan.server", () => ({
  prescanServer: { prescan: jest.fn() },
}));

const mockPrescan = prescanServer.prescan as jest.Mock;

const CONFIG = { downloadsPath: "/downloads", libraryPath: "/library" };

const MOCK_PRESCAN: PrescanResponseDto = {
  toMove: 5,
  ignored: { duplicates: 2, missingMetadata: 1 },
  tagFolders: ["Rock"],
  depthExceededCount: 0,
  longPathWarnings: 0,
};

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/sync/prescan", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/sync/prescan — auth (MFM-442)", () => {
  it("returns 400 when cookie is absent", async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });
});

describe("POST /api/sync/prescan — success (MFM-442)", () => {
  it("returns 200 with prescan data", async () => {
    mockPrescan.mockResolvedValue(MOCK_PRESCAN);

    const res = await POST(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(MOCK_PRESCAN);
  });

  it("calls prescanServer with both paths from cookie", async () => {
    mockPrescan.mockResolvedValue(MOCK_PRESCAN);

    await POST(makeRequest(withConfig(CONFIG)));

    expect(mockPrescan).toHaveBeenCalledWith(
      CONFIG.downloadsPath,
      CONFIG.libraryPath,
    );
  });
});

describe("POST /api/sync/prescan — service errors (MFM-442)", () => {
  it("returns 400 when service throws BadRequestError", async () => {
    mockPrescan.mockRejectedValue(new BadRequestError("folder missing"));

    const res = await POST(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(400);
  });

  it("returns 500 for unexpected errors", async () => {
    mockPrescan.mockRejectedValue(new Error("disk error"));

    const res = await POST(makeRequest(withConfig(CONFIG)));
    expect(res.status).toBe(500);
  });
});
