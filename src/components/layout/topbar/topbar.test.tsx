import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Topbar } from "./topbar";
import {
  APP_NAME,
  SEARCH_TRIGGER_ARIA_LABEL,
  SYNC_MENU_ARIA_LABEL,
  SYNC_NOW_LABEL,
  REVALIDATE_LABEL,
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

  it("renders the settings menu trigger", () => {
    render(<Topbar />);
    expect(
      screen.getByRole("button", { name: SETTINGS_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });
});

describe("Topbar — search callbacks", () => {
  it("calls onSearchOpen when search trigger is clicked", () => {
    const onSearchOpen = jest.fn();
    render(<Topbar onSearchOpen={onSearchOpen} />);
    fireEvent.click(
      screen.getByRole("button", { name: SEARCH_TRIGGER_ARIA_LABEL }),
    );
    expect(onSearchOpen).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onSearchOpen is not provided and search trigger is clicked", () => {
    render(<Topbar />);
    expect(() =>
      fireEvent.click(
        screen.getByRole("button", { name: SEARCH_TRIGGER_ARIA_LABEL }),
      ),
    ).not.toThrow();
  });
});

describe("Topbar — sync menu visibility (MFM-506)", () => {
  it("does not render the sync menu trigger by default", () => {
    render(<Topbar />);
    expect(
      screen.queryByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("does not render the sync menu trigger when hasLibrary is false", () => {
    render(<Topbar hasLibrary={false} />);
    expect(
      screen.queryByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("renders the sync menu trigger when hasLibrary is true", () => {
    render(<Topbar hasLibrary />);
    expect(
      screen.getByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });
});

describe("Topbar — sync menu options (MFM-507)", () => {
  it("shows Sincronizar ahora option when sync menu is opened", async () => {
    const user = userEvent.setup();
    render(<Topbar hasLibrary />);
    await user.click(
      screen.getByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    );
    expect(screen.getByText(SYNC_NOW_LABEL)).toBeInTheDocument();
  });

  it("shows Forzar re-validación option when sync menu is opened", async () => {
    const user = userEvent.setup();
    render(<Topbar hasLibrary />);
    await user.click(
      screen.getByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    );
    expect(screen.getByText(REVALIDATE_LABEL)).toBeInTheDocument();
  });

  it("calls onSyncStart when Sincronizar ahora is clicked", async () => {
    const user = userEvent.setup();
    const onSyncStart = jest.fn();
    render(<Topbar hasLibrary onSyncStart={onSyncStart} />);
    await user.click(
      screen.getByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    );
    await user.click(screen.getByText(SYNC_NOW_LABEL));
    expect(onSyncStart).toHaveBeenCalledTimes(1);
  });

  it("calls onRevalidate when Forzar re-validación is clicked", async () => {
    const user = userEvent.setup();
    const onRevalidate = jest.fn();
    render(<Topbar hasLibrary onRevalidate={onRevalidate} />);
    await user.click(
      screen.getByRole("button", { name: SYNC_MENU_ARIA_LABEL }),
    );
    await user.click(screen.getByText(REVALIDATE_LABEL));
    expect(onRevalidate).toHaveBeenCalledTimes(1);
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
