import { act, renderHook } from "@testing-library/react";
import { useSidebar } from ".";

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
});

describe("useSidebar — initial state", () => {
  it("initializes as expanded when localStorage is empty", () => {
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isCollapsed).toBe(false);
  });

  it("reads collapsed state from localStorage on non-desktop", () => {
    localStorage.setItem("sidebar-collapsed", "true");
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isCollapsed).toBe(true);
  });

  it("ignores localStorage and stays expanded on desktop", () => {
    localStorage.setItem("sidebar-collapsed", "true");
    mockMatchMedia(true);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isCollapsed).toBe(false);
  });
});

describe("useSidebar — toggle", () => {
  it("collapses when toggled from expanded state", () => {
    const { result } = renderHook(() => useSidebar());
    act(() => result.current.toggle());
    expect(result.current.isCollapsed).toBe(true);
  });

  it("expands when toggled from collapsed state", () => {
    localStorage.setItem("sidebar-collapsed", "true");
    const { result } = renderHook(() => useSidebar());
    act(() => result.current.toggle());
    expect(result.current.isCollapsed).toBe(false);
  });

  it("persists collapsed state to localStorage", () => {
    const { result } = renderHook(() => useSidebar());
    act(() => result.current.toggle());
    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");
  });

});

describe("useSidebar — return shape", () => {
  it("returns isCollapsed boolean and toggle function", () => {
    const { result } = renderHook(() => useSidebar());
    expect(typeof result.current.isCollapsed).toBe("boolean");
    expect(typeof result.current.toggle).toBe("function");
  });
});
