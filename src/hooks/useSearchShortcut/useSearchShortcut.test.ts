import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useSearchShortcut } from ".";

describe("useSearchShortcut", () => {
  it("does not throw when onActivate is not provided", () => {
    expect(() => renderHook(() => useSearchShortcut())).not.toThrow();
  });

  it("calls onActivate when Cmd+K is pressed (Meta key)", () => {
    const onActivate = jest.fn();
    renderHook(() => useSearchShortcut(onActivate));

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("calls onActivate when Ctrl+K is pressed", () => {
    const onActivate = jest.fn();
    renderHook(() => useSearchShortcut(onActivate));

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("does not call onActivate for other keys with Meta", () => {
    const onActivate = jest.fn();
    renderHook(() => useSearchShortcut(onActivate));

    fireEvent.keyDown(document, { key: "p", metaKey: true });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not call onActivate for k without modifier key", () => {
    const onActivate = jest.fn();
    renderHook(() => useSearchShortcut(onActivate));

    fireEvent.keyDown(document, { key: "k" });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("removes the event listener on unmount", () => {
    const onActivate = jest.fn();
    const { unmount } = renderHook(() => useSearchShortcut(onActivate));

    unmount();
    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not register a listener when onActivate is undefined", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    renderHook(() => useSearchShortcut(undefined));

    expect(addSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));
    addSpy.mockRestore();
  });
});
