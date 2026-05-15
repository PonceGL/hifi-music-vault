import { render } from "@testing-library/react";
import { Toaster } from "./toaster";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("Toaster", () => {
  it("renders without errors", () => {
    expect(() => render(<Toaster />)).not.toThrow();
  });

  it("renders with theme dark without errors", () => {
    expect(() => render(<Toaster theme="dark" />)).not.toThrow();
  });

  it("renders with theme light without errors", () => {
    expect(() => render(<Toaster theme="light" />)).not.toThrow();
  });

  it("renders with theme system without errors", () => {
    expect(() => render(<Toaster theme="system" />)).not.toThrow();
  });
});
