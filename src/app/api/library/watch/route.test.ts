/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { libraryWatcher } from "@/server/fs/watcher";
import { COOKIE_KEYS } from "@/constants/cookieKeys";

jest.mock("@/server/fs/watcher", () => ({
  libraryWatcher: {
    watch: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));

const mockWatch = libraryWatcher.watch as jest.Mock;
const mockSubscribe = libraryWatcher.subscribe as jest.Mock;

const CONFIG = { downloadsPath: "/downloads", libraryPath: "/library" };

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/library/watch", {
    method: "GET",
    headers: cookie ? { cookie } : {},
  });
}

function withConfig(config: object): string {
  return `${COOKIE_KEYS.folderConfigured}=${encodeURIComponent(JSON.stringify(config))}`;
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/library/watch — auth (MFM-448)", () => {
  it("returns 400 when the folder config cookie is absent", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("does not start the watcher when cookie is absent", async () => {
    await GET(makeRequest());
    expect(mockWatch).not.toHaveBeenCalled();
  });
});

describe("GET /api/library/watch — success (MFM-448)", () => {
  it("returns a streaming response with SSE headers", async () => {
    const res = await GET(makeRequest(withConfig(CONFIG)));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
    expect(res.headers.get("Connection")).toBe("keep-alive");
  });

  it("starts the watcher with the library path from the cookie", async () => {
    await GET(makeRequest(withConfig(CONFIG)));

    expect(mockWatch).toHaveBeenCalledWith(CONFIG.libraryPath);
  });

  it("subscribes to the watcher for the SSE stream", async () => {
    await GET(makeRequest(withConfig(CONFIG)));

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("GET /api/library/watch — SSE event encoding (MFM-448)", () => {
  it("encodes watch events as SSE data lines", async () => {
    let capturedListener: ((event: unknown) => void) | undefined;
    mockSubscribe.mockImplementation((listener: (event: unknown) => void) => {
      capturedListener = listener;
      return jest.fn();
    });

    const res = await GET(makeRequest(withConfig(CONFIG)));
    const reader = res.body?.getReader();

    if (!reader || !capturedListener) {
      throw new Error("Stream or listener not available");
    }

    capturedListener({ type: "file-added", path: "/library/track.flac" });

    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);

    expect(text).toBe(
      `data: ${JSON.stringify({ type: "file-added", path: "/library/track.flac" })}\n\n`,
    );

    await reader.cancel();
  });
});
