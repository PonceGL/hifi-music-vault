import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useValidateFolderPath } from "./index";
import { validateFolderPath } from "@/lib/validateFolderPath";

jest.mock("@/lib/validateFolderPath", () => ({
  validateFolderPath: jest.fn(),
}));

const mockValidateFolderPath = validateFolderPath as jest.Mock;

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

const MOCK_RESULT = {
  path: "/Users/test/music",
  exists: true,
  isDirectory: true,
  isFile: false,
  hasPermissions: true,
};

describe("useValidateFolderPath", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in idle status", () => {
    const { result } = renderHook(() => useValidateFolderPath(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.isPending).toBe(false);
  });

  it("calls validateFolderPath with the given path", async () => {
    mockValidateFolderPath.mockResolvedValueOnce(MOCK_RESULT);

    const { result } = renderHook(() => useValidateFolderPath(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("/Users/test/music");
    });

    await waitFor(() => {
      expect(mockValidateFolderPath).toHaveBeenCalledTimes(1);
    });

    // TanStack Query v5 passes a mutation context as second arg — assert only on the path
    expect(mockValidateFolderPath.mock.calls[0][0]).toBe("/Users/test/music");
  });

  it("resolves with the value returned by validateFolderPath", async () => {
    mockValidateFolderPath.mockResolvedValueOnce(MOCK_RESULT);

    const { result } = renderHook(() => useValidateFolderPath(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("/Users/test/music");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(MOCK_RESULT);
  });

  it("resolves with the fallback result when validateFolderPath returns defaults (network error caught internally)", async () => {
    const fallback = {
      path: "/missing/path",
      exists: false,
      isDirectory: false,
      isFile: false,
      hasPermissions: false,
    };
    mockValidateFolderPath.mockResolvedValueOnce(fallback);

    const { result } = renderHook(() => useValidateFolderPath(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("/missing/path");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(fallback);
  });

  it("is in pending status while the mutation is running", async () => {
    let resolveFn!: (v: typeof MOCK_RESULT) => void;
    mockValidateFolderPath.mockReturnValueOnce(
      new Promise<typeof MOCK_RESULT>((resolve) => {
        resolveFn = resolve;
      }),
    );

    const { result } = renderHook(() => useValidateFolderPath(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      void result.current.mutateAsync("/Users/test/music");
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveFn(MOCK_RESULT);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
