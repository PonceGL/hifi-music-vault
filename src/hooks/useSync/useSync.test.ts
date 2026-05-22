import { act, renderHook, waitFor } from "@testing-library/react";
import { useSync } from "./index";
import { apiClient } from "@/lib/apiClient";
import { useOperationStore } from "@/store";

jest.mock("@/lib/apiClient", () => ({
  apiClient: jest.fn(),
  OperationBusyError: class extends Error {},
}));

jest.mock("@/store", () => ({
  useOperationStore: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mock;
const mockUseOperationStore = useOperationStore as unknown as jest.Mock;

const mockStartSync = jest.fn();
const mockClearOperation = jest.fn();

// Builds a mock fetch that streams SSE events through a fake reader.
// Uses Buffer.from() (Node.js) instead of TextEncoder to avoid jsdom limitations.
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

const PRESCAN_DATA = {
  toMove: 10,
  ignored: { duplicates: 2, missingMetadata: 1 },
  tagFolders: [],
  depthExceededCount: 0,
  longPathWarnings: 0,
};

const SYNC_RESULT = {
  moved: 8,
  duplicatesSkipped: 2,
  missingMetadataSkipped: 0,
  withWarnings: 0,
  errors: 0,
  playlistsUpdated: [],
};

describe("useSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockUseOperationStore.mockReturnValue({
      startSync: mockStartSync,
      clearOperation: mockClearOperation,
    });
  });

  it("starts in idle phase with all state null", () => {
    const { result } = renderHook(() => useSync());

    expect(result.current.phase).toBe("idle");
    expect(result.current.prescanData).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  describe("startPrescan()", () => {
    it("transitions idle → prescanning → confirming on success", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: PRESCAN_DATA }),
      });

      const { result } = renderHook(() => useSync());

      act(() => {
        void result.current.startPrescan();
      });
      expect(result.current.phase).toBe("prescanning");

      await waitFor(() => expect(result.current.phase).toBe("confirming"));
      expect(result.current.prescanData).toEqual(PRESCAN_DATA);
      expect(mockStartSync).toHaveBeenCalledTimes(1);
    });

    it("transitions prescanning → error when API returns non-ok status", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 500 });

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.startPrescan();
      });

      expect(result.current.phase).toBe("error");
      expect(result.current.error).toContain("500");
      expect(mockStartSync).not.toHaveBeenCalled();
    });

    it("transitions prescanning → error on network failure", async () => {
      mockApiClient.mockRejectedValueOnce(new Error("Network failure"));

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.startPrescan();
      });

      expect(result.current.phase).toBe("error");
      expect(result.current.error).toBe("Network failure");
    });

    it("resets previous error before retrying prescan", async () => {
      mockApiClient
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: PRESCAN_DATA }),
        });

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.startPrescan();
      });
      expect(result.current.phase).toBe("error");

      await act(async () => {
        await result.current.startPrescan();
      });

      expect(result.current.phase).toBe("confirming");
      expect(result.current.error).toBeNull();
    });
  });

  describe("confirmSync()", () => {
    async function reachConfirming(result: ReturnType<typeof useSync>) {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: PRESCAN_DATA }),
      });
      await act(async () => {
        await result.startPrescan();
      });
    }

    it("transitions confirming → running → completed on SSE complete event", async () => {
      const { result } = renderHook(() => useSync());
      await reachConfirming(result.current);

      global.fetch = makeMockFetch([{ type: "complete", data: SYNC_RESULT }]);

      act(() => {
        result.current.confirmSync();
      });
      expect(result.current.phase).toBe("running");

      await waitFor(() => expect(result.current.phase).toBe("completed"));
      expect(result.current.result).toEqual(SYNC_RESULT);
      expect(mockClearOperation).toHaveBeenCalledTimes(1);
    });

    it("updates progress state on SSE progress events", async () => {
      const { result } = renderHook(() => useSync());
      await reachConfirming(result.current);

      const progressEvent = {
        phase: "moving",
        current: 5,
        total: 10,
        currentFile: "track.flac",
        percentage: 50,
      };
      global.fetch = makeMockFetch([
        { type: "progress", data: progressEvent },
        { type: "complete", data: SYNC_RESULT },
      ]);

      act(() => {
        result.current.confirmSync();
      });

      await waitFor(() => expect(result.current.phase).toBe("completed"));
      expect(result.current.progress).toEqual(progressEvent);
    });

    it("transitions running → error on SSE error event", async () => {
      const { result } = renderHook(() => useSync());
      await reachConfirming(result.current);

      global.fetch = makeMockFetch([
        { type: "error", data: { message: "Disk full" } },
      ]);

      act(() => {
        result.current.confirmSync();
      });

      await waitFor(() => expect(result.current.phase).toBe("error"));
      expect(result.current.error).toBe("Disk full");
      expect(mockClearOperation).toHaveBeenCalledTimes(1);
    });

    it("is a no-op when not in confirming phase", () => {
      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.confirmSync();
      });

      expect(result.current.phase).toBe("idle");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("cancelSync()", () => {
    it("clears operationInProgress and transitions to cancelled", () => {
      const { result } = renderHook(() => useSync());

      act(() => {
        result.current.cancelSync();
      });

      expect(result.current.phase).toBe("cancelled");
      expect(mockClearOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe("dismiss()", () => {
    it("resets all state back to idle", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: PRESCAN_DATA }),
      });

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.startPrescan();
      });
      expect(result.current.phase).toBe("confirming");

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.phase).toBe("idle");
      expect(result.current.prescanData).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
