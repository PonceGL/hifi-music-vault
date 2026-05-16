import { act, renderHook } from "@testing-library/react";
import { useOnboarding } from "./index";

describe("useOnboarding", () => {
  beforeEach(() => {
    jest.useFakeTimers();
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
});
