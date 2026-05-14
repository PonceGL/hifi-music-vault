import { renderHook } from "@testing-library/react";
import { useMenuPosition } from "./index";

describe("useMenuPosition", () => {
  let triggerElement: HTMLElement;
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    triggerElement = document.createElement("div");
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 1000 });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: originalInnerHeight });
  });

  it("should return empty object if not open", () => {
    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useMenuPosition(triggerRef, false, false, 2));
    expect(result.current).toEqual({});
  });

  it("should return empty object if mobile", () => {
    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useMenuPosition(triggerRef, true, true, 2));
    expect(result.current).toEqual({});
  });

  it("should calculate position opening downward and rightward by default", () => {
    triggerElement.getBoundingClientRect = jest.fn(() => ({
      bottom: 100,
      top: 50,
      left: 100,
      right: 150,
      width: 50,
      height: 50,
      x: 100,
      y: 50,
      toJSON: () => {},
    }));

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useMenuPosition(triggerRef, true, false, 2));
    expect(result.current).toEqual({
      top: 104, // 100 + 4
      bottom: undefined,
      left: 100,
      right: undefined,
    });
  });

  it("should calculate position opening upward when near bottom edge", () => {
    triggerElement.getBoundingClientRect = jest.fn(() => ({
      bottom: 950,
      top: 900,
      left: 100,
      right: 150,
      width: 50,
      height: 50,
      x: 100,
      y: 900,
      toJSON: () => {},
    }));

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useMenuPosition(triggerRef, true, false, 5)); // 5 items = approx 200px + padding
    expect(result.current).toEqual({
      top: undefined,
      bottom: 104, // 1000 - 900 + 4
      left: 100,
      right: undefined,
    });
  });

  it("should calculate position opening leftward when near right edge", () => {
    triggerElement.getBoundingClientRect = jest.fn(() => ({
      bottom: 100,
      top: 50,
      left: 900,
      right: 950,
      width: 50,
      height: 50,
      x: 900,
      y: 50,
      toJSON: () => {},
    }));

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useMenuPosition(triggerRef, true, false, 2));
    expect(result.current).toEqual({
      top: 104,
      bottom: undefined,
      left: undefined,
      right: 50, // 1000 - 950
    });
  });
});
