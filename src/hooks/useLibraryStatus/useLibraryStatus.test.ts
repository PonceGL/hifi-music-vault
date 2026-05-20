import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLibraryStatus } from "./index";
import { fetchLibraryStatus } from "@/lib/libraryStatus";

jest.mock("@/lib/libraryStatus", () => ({
  fetchLibraryStatus: jest.fn(),
}));

const mockFetchLibraryStatus = fetchLibraryStatus as jest.Mock;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const DOWNLOADS_EMPTY = { count: 0, byFormat: {} };
const DOWNLOADS_WITH_FILES = { count: 12, byFormat: { flac: 10, mp3: 2 } };
const LIBRARY_EMPTY = { count: 0, byFormat: {} };
const LIBRARY_WITH_FILES = { count: 247, byFormat: { flac: 247 } };

describe("useLibraryStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns undefined status while loading", () => {
    mockFetchLibraryStatus.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.status).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });

  it("returns status A when downloads has files and library is empty", async () => {
    mockFetchLibraryStatus.mockResolvedValueOnce({
      downloads: DOWNLOADS_WITH_FILES,
      library: LIBRARY_EMPTY,
    });

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe("A");
    expect(result.current.isError).toBe(false);
  });

  it("returns status B when both downloads and library have files", async () => {
    mockFetchLibraryStatus.mockResolvedValueOnce({
      downloads: DOWNLOADS_WITH_FILES,
      library: LIBRARY_WITH_FILES,
    });

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe("B");
  });

  it("returns status C when downloads is empty and library has files", async () => {
    mockFetchLibraryStatus.mockResolvedValueOnce({
      downloads: DOWNLOADS_EMPTY,
      library: LIBRARY_WITH_FILES,
    });

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe("C");
  });

  it("returns status D when both folders are empty", async () => {
    mockFetchLibraryStatus.mockResolvedValueOnce({
      downloads: DOWNLOADS_EMPTY,
      library: LIBRARY_EMPTY,
    });

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe("D");
  });

  it("exposes isError and error when the fetch fails", async () => {
    const apiError = {
      message: "Network error",
      status: null,
      code: "NETWORK_ERROR",
      source: "internal",
    };
    mockFetchLibraryStatus.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.status).toBeUndefined();
    expect(result.current.error).toEqual(apiError);
  });

  it("fetches automatically on mount", async () => {
    mockFetchLibraryStatus.mockResolvedValueOnce({
      downloads: DOWNLOADS_WITH_FILES,
      library: LIBRARY_WITH_FILES,
    });

    renderHook(() => useLibraryStatus(), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(mockFetchLibraryStatus).toHaveBeenCalledTimes(1);
    });
  });

  it("exposes raw data alongside the derived status", async () => {
    const rawData = {
      downloads: DOWNLOADS_WITH_FILES,
      library: LIBRARY_EMPTY,
    };
    mockFetchLibraryStatus.mockResolvedValueOnce(rawData);

    const { result } = renderHook(() => useLibraryStatus(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(rawData);
  });
});
