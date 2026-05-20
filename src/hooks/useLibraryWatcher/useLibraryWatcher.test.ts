import { renderHook, waitFor } from "@testing-library/react";
import { useLibraryWatcher } from "./index";
import { useRevalidation } from "@/hooks/useRevalidation";

jest.mock("@/hooks/useRevalidation", () => ({
  useRevalidation: jest.fn(),
}));

const mockUseRevalidation = useRevalidation as jest.Mock;
const mockRevalidate = jest.fn();

function makeMockFetch(events: object[], ok = true) {
  let index = 0;

  const mockReader = {
    read: jest.fn().mockImplementation(async () => {
      if (index < events.length) {
        const chunk = `data: ${JSON.stringify(events[index++])}\n\n`;
        return { done: false, value: Buffer.from(chunk) };
      }
      return { done: true, value: undefined };
    }),
    cancel: jest.fn(),
  };

  return jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    body: { getReader: () => mockReader },
  });
}

describe("useLibraryWatcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRevalidate.mockResolvedValue(undefined);
    mockUseRevalidation.mockReturnValue({ revalidate: mockRevalidate });
    global.fetch = jest.fn();
  });

  it("opens SSE connection to /api/library/watch on mount", async () => {
    global.fetch = makeMockFetch([]);

    renderHook(() => useLibraryWatcher());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("/api/library/watch");
  });

  it("calls revalidate when a file-added event is received", async () => {
    global.fetch = makeMockFetch([
      { type: "file-added", path: "/library/Artist/Album/01 - Track.flac" },
    ]);

    renderHook(() => useLibraryWatcher());

    await waitFor(() => {
      expect(mockRevalidate).toHaveBeenCalledTimes(1);
    });
  });

  it("calls revalidate when a file-removed event is received", async () => {
    global.fetch = makeMockFetch([
      { type: "file-removed", path: "/library/Artist/Album/01 - Track.flac" },
    ]);

    renderHook(() => useLibraryWatcher());

    await waitFor(() => {
      expect(mockRevalidate).toHaveBeenCalledTimes(1);
    });
  });

  it("calls revalidate once per event when multiple events are received", async () => {
    global.fetch = makeMockFetch([
      { type: "file-added", path: "/library/A/01.flac" },
      { type: "file-removed", path: "/library/B/02.flac" },
    ]);

    renderHook(() => useLibraryWatcher());

    await waitFor(() => {
      expect(mockRevalidate).toHaveBeenCalledTimes(2);
    });
  });

  it("aborts the SSE connection on unmount", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");
    global.fetch = makeMockFetch([]);

    const { unmount } = renderHook(() => useLibraryWatcher());

    unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);
    abortSpy.mockRestore();
  });

  it("does not call revalidate on malformed SSE data", async () => {
    global.fetch = makeMockFetch([]);
    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: Buffer.from("data: not-valid-json\n\n"),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: jest.fn(),
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    renderHook(() => useLibraryWatcher());

    await waitFor(() => expect(mockReader.read).toHaveBeenCalledTimes(2));

    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
