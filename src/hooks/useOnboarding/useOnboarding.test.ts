import { act, renderHook } from "@testing-library/react";
import { useOnboarding } from "./index";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("useOnboarding", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts at step 0 with isTransitioning false", () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.step).toBe(0);
    expect(result.current.isTransitioning).toBe(false);
  });

  it("goNext advances step from 0 to 1 and sets isTransitioning", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.isTransitioning).toBe(true);
  });

  it("isTransitioning returns to false after 300ms", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goNext();
    });
    expect(result.current.isTransitioning).toBe(true);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.isTransitioning).toBe(false);
  });

  it("goBack moves step from 1 to 0", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goNext();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => {
      result.current.goBack();
    });

    expect(result.current.step).toBe(0);
    expect(result.current.isTransitioning).toBe(true);
  });

  it("goNext does nothing when already at step 1", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goNext();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(1);
  });

  it("goBack does nothing when already at step 0", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.step).toBe(0);
    expect(result.current.isTransitioning).toBe(false);
  });

  it("complete saves config to localStorage and redirects to /", () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.complete({
        downloadsPath: "/downloads",
        libraryPath: "/library",
      });
    });

    const stored = JSON.parse(localStorage.getItem("folder-config") ?? "{}");
    expect(stored.downloadsPath).toBe("/downloads");
    expect(stored.libraryPath).toBe("/library");
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
