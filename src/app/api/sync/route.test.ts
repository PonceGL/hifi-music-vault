/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { runSync } from "@/server/sync/sync";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import type { SyncResult } from "@/types/sync";

jest.mock("@/server/sync/sync", () => ({
  runSync: jest.fn(),
}));

const mockRunSync = runSync as jest.Mock;

const CONFIG = { downloadsPath: "/downloads", libraryPath: "/library" };

const SYNC_RESULT: SyncResult = {
  moved: 10,
  duplicatesSkipped: 2,
  withWarnings: 1,
  errors: 0,
  playlistsUpdated: ["Rock"],
};

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/sync", {
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

async function collectStream(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const decoder = new TextDecoder();
  let result = "";
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }
  return result;
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/sync — auth (MFM-442)", () => {
  it("returns 400 when cookie is absent", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });
});

describe("GET /api/sync — SSE headers (MFM-442)", () => {
  it("returns SSE content-type header", async () => {
    mockRunSync.mockResolvedValue(SYNC_RESULT);

    const res = await GET(makeRequest(withConfig(CONFIG)));

    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("returns no-cache header", async () => {
    mockRunSync.mockResolvedValue(SYNC_RESULT);

    const res = await GET(makeRequest(withConfig(CONFIG)));

    expect(res.headers.get("Cache-Control")).toBe("no-cache");
  });
});

describe("GET /api/sync — SSE stream (MFM-442)", () => {
  it("emits complete event with sync result", async () => {
    mockRunSync.mockResolvedValue(SYNC_RESULT);

    const res = await GET(makeRequest(withConfig(CONFIG)));
    const raw = await collectStream(res.body as ReadableStream<Uint8Array>);

    expect(raw).toContain('"type":"complete"');
    expect(raw).toContain('"moved":10');
  });

  it("calls runSync with paths from cookie", async () => {
    mockRunSync.mockResolvedValue(SYNC_RESULT);

    await GET(makeRequest(withConfig(CONFIG)));

    expect(mockRunSync).toHaveBeenCalledWith(
      expect.objectContaining({
        downloadsPath: CONFIG.downloadsPath,
        libraryPath: CONFIG.libraryPath,
      }),
    );
  });

  it("emits error event when runSync throws", async () => {
    mockRunSync.mockRejectedValue(new Error("disk failure"));

    const res = await GET(makeRequest(withConfig(CONFIG)));
    const raw = await collectStream(res.body as ReadableStream<Uint8Array>);

    expect(raw).toContain('"type":"error"');
    expect(raw).toContain("disk failure");
  });

  it("emits progress event via onProgress callback", async () => {
    mockRunSync.mockImplementation(
      async ({ onProgress }: { onProgress: (p: object) => void }) => {
        onProgress({
          phase: "scanning",
          current: 0,
          total: 10,
          currentFile: null,
          percentage: 0,
        });
        return SYNC_RESULT;
      },
    );

    const res = await GET(makeRequest(withConfig(CONFIG)));
    const raw = await collectStream(res.body as ReadableStream<Uint8Array>);

    expect(raw).toContain('"type":"progress"');
    expect(raw).toContain('"phase":"scanning"');
  });
});
