import { fireEvent, render, screen } from "@testing-library/react";
import { Topbar } from "./topbar";
import {
  APP_NAME,
  SEARCH_TRIGGER_ARIA_LABEL,
  SYNC_ARIA_LABEL,
  SETTINGS_MENU_ARIA_LABEL,
} from "./constants";

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "dark", setTheme: jest.fn() }),
}));

jest.mock("@/hooks/useSearchShortcut", () => ({
  useSearchShortcut: jest.fn(),
}));

describe("Topbar — structure", () => {
  it("renders without crashing", () => {
    render(<Topbar />);
  });

  it("displays the app name", () => {
    render(<Topbar />);
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
  });

  it("renders the search trigger button", () => {
    render(<Topbar />);
    expect(
      screen.getByRole("button", { name: SEARCH_TRIGGER_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("renders the sync button", () => {
    render(<Topbar />);
    expect(
      screen.getByRole("button", { name: SYNC_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("renders the settings menu trigger", () => {
    render(<Topbar />);
    expect(
      screen.getByRole("button", { name: SETTINGS_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });
});

describe("Topbar — callbacks", () => {
  it("calls onSearchOpen when search trigger is clicked", () => {
    const onSearchOpen = jest.fn();
    render(<Topbar onSearchOpen={onSearchOpen} />);
    fireEvent.click(screen.getByRole("button", { name: SEARCH_TRIGGER_ARIA_LABEL }));
    expect(onSearchOpen).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onSearchOpen is not provided and search trigger is clicked", () => {
    render(<Topbar />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: SEARCH_TRIGGER_ARIA_LABEL })),
    ).not.toThrow();
  });

  it("calls onSyncStart when sync button is clicked", () => {
    const onSyncStart = jest.fn();
    render(<Topbar onSyncStart={onSyncStart} />);
    fireEvent.click(screen.getByRole("button", { name: SYNC_ARIA_LABEL }));
    expect(onSyncStart).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onSyncStart is not provided and sync button is clicked", () => {
    render(<Topbar />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: SYNC_ARIA_LABEL })),
    ).not.toThrow();
  });
});

describe("Topbar — blocking", () => {
  it("applies opacity-40 when isBlocked is true", () => {
    const { container } = render(<Topbar isBlocked />);
    expect(container.firstChild).toHaveClass("opacity-40");
  });

  it("applies pointer-events-none when isBlocked is true", () => {
    const { container } = render(<Topbar isBlocked />);
    expect(container.firstChild).toHaveClass("pointer-events-none");
  });

  it("does not apply blocking classes when isBlocked is false", () => {
    const { container } = render(<Topbar isBlocked={false} />);
    expect(container.firstChild).not.toHaveClass("opacity-40");
    expect(container.firstChild).not.toHaveClass("pointer-events-none");
  });
});
