import { renderHook } from "@testing-library/react";
import { useClickOutside } from "./index";

describe("useClickOutside", () => {
  let element1: HTMLDivElement;
  let element2: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    element1 = document.createElement("div");
    element2 = document.createElement("div");
    outsideElement = document.createElement("div");
    document.body.appendChild(element1);
    document.body.appendChild(element2);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should call onClickOutside when clicking outside all refs", () => {
    const onClickOutside = jest.fn();
    const refs = [
      { current: element1 },
      { current: element2 },
    ];

    renderHook(() => useClickOutside(refs, true, onClickOutside));

    outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).toHaveBeenCalledTimes(1);
  });

  it("should not call onClickOutside when clicking inside a ref", () => {
    const onClickOutside = jest.fn();
    const refs = [
      { current: element1 },
      { current: element2 },
    ];

    renderHook(() => useClickOutside(refs, true, onClickOutside));

    element1.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    element2.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it("should not call onClickOutside when isActive is false", () => {
    const onClickOutside = jest.fn();
    const refs = [
      { current: element1 },
      { current: element2 },
    ];

    renderHook(() => useClickOutside(refs, false, onClickOutside));

    outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).not.toHaveBeenCalled();
  });
});
