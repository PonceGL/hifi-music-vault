import { renderHook } from "@testing-library/react";
import { useEscapeKey } from "./index";

describe("useEscapeKey", () => {
  it("should call onEscape when Escape key is pressed and isActive is true", () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("should not call onEscape when Escape key is pressed but isActive is false", () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeKey(false, onEscape));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("should not call onEscape when other keys are pressed", () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Space" }));

    expect(onEscape).not.toHaveBeenCalled();
  });
});
