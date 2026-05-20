import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRevalidation } from "./index";
import { useOperationStore } from "@/store";
import { internalHttpClient } from "@/lib/http";

jest.mock("@/store", () => ({
  useOperationStore: jest.fn(),
}));

jest.mock("@/lib/http", () => ({
  internalHttpClient: { get: jest.fn() },
}));

const mockUseOperationStore = useOperationStore as unknown as jest.Mock;
const mockGet = internalHttpClient.get as jest.Mock;

const mockStartRevalidation = jest.fn();
const mockClearOperation = jest.fn();

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useRevalidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOperationStore.mockReturnValue({
      startRevalidation: mockStartRevalidation,
      clearOperation: mockClearOperation,
    });
  });

  it("starts with isRevalidating false", () => {
    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isRevalidating).toBe(false);
  });

  it("sets operationInProgress to revalidation and calls GET /api/library", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.revalidate();
    });

    expect(mockStartRevalidation).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("sets isRevalidating to true while running, false when done", async () => {
    let resolveGet!: () => void;
    mockGet.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveGet = resolve;
      }),
    );

    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.revalidate();
    });

    await waitFor(() => expect(result.current.isRevalidating).toBe(true));

    await act(async () => {
      resolveGet();
    });

    await waitFor(() => expect(result.current.isRevalidating).toBe(false));
  });

  it("clears operationInProgress when done (success)", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });

    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.revalidate();
    });

    expect(mockClearOperation).toHaveBeenCalledTimes(1);
  });

  it("clears operationInProgress even on error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.revalidate();
    });

    expect(mockClearOperation).toHaveBeenCalledTimes(1);
    expect(result.current.isRevalidating).toBe(false);
  });

  it("is a no-op when already revalidating", async () => {
    let resolveGet!: () => void;
    mockGet.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveGet = resolve;
      }),
    );

    const { result } = renderHook(() => useRevalidation(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.revalidate();
    });

    await waitFor(() => expect(result.current.isRevalidating).toBe(true));

    await act(async () => {
      await result.current.revalidate();
    });

    expect(mockGet).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveGet();
    });
  });
});
