import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOpenFolderDialog } from "./index";
import { openFolderDialog } from "@/lib/openFolderDialog";

jest.mock("@/lib/openFolderDialog", () => ({
  openFolderDialog: jest.fn(),
}));

const mockOpenFolderDialog = openFolderDialog as jest.Mock;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useOpenFolderDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in idle status", () => {
    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.isPending).toBe(false);
  });

  it("calls openFolderDialog with the given prompt", async () => {
    mockOpenFolderDialog.mockResolvedValueOnce("/Users/test/music");

    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("Select your library folder");
    });

    await waitFor(() => {
      expect(mockOpenFolderDialog).toHaveBeenCalledTimes(1);
    });

    // TanStack Query v5 passes a mutation context as second arg — assert only on the prompt
    expect(mockOpenFolderDialog.mock.calls[0][0]).toBe(
      "Select your library folder",
    );
  });

  it("calls openFolderDialog with undefined when no prompt is passed", async () => {
    mockOpenFolderDialog.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync(undefined);
    });

    await waitFor(() => {
      expect(mockOpenFolderDialog).toHaveBeenCalledTimes(1);
    });

    expect(mockOpenFolderDialog.mock.calls[0][0]).toBeUndefined();
  });

  it("resolves with the path returned by openFolderDialog", async () => {
    mockOpenFolderDialog.mockResolvedValueOnce("/Users/test/music");

    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("Select a folder");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("/Users/test/music");
  });

  it("resolves with null when user cancels the dialog", async () => {
    mockOpenFolderDialog.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("Select a folder");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it("is in pending status while the dialog is open", async () => {
    let resolveFn!: (v: string | null) => void;
    mockOpenFolderDialog.mockReturnValueOnce(
      new Promise<string | null>((resolve) => {
        resolveFn = resolve;
      }),
    );

    const { result } = renderHook(() => useOpenFolderDialog(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("Select a folder");
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveFn("/Users/test/music");
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
