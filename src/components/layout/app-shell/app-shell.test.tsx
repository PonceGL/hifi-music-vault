import { render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";
import { DETAIL_PANEL_ARIA_LABEL, SIDEBAR_ARIA_LABEL, MAIN_CONTENT_LABEL } from "./constants";

const DEFAULT_PROPS = {
  sidebar: <nav data-testid="sidebar-slot">Sidebar</nav>,
  topbar: <div data-testid="topbar-slot">Topbar</div>,
  tabBar: <div data-testid="tabbar-slot">TabBar</div>,
};

function renderShell(
  props: Partial<React.ComponentProps<typeof AppShell>> = {},
) {
  return render(
    <AppShell {...DEFAULT_PROPS} {...props}>
      <div data-testid="main-content">Content</div>
    </AppShell>,
  );
}

describe("AppShell — structure", () => {
  it("renders without crashing", () => {
    renderShell();
  });

  it("renders the sidebar slot", () => {
    renderShell();
    expect(screen.getByTestId("sidebar-slot")).toBeInTheDocument();
  });

  it("renders the topbar slot", () => {
    renderShell();
    expect(screen.getByTestId("topbar-slot")).toBeInTheDocument();
  });

  it("renders the tab bar slot", () => {
    renderShell();
    expect(screen.getByTestId("tabbar-slot")).toBeInTheDocument();
  });

  it("renders children in the main content area", () => {
    renderShell();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  it("labels the sidebar region correctly", () => {
    renderShell();
    expect(screen.getByRole("complementary", { name: SIDEBAR_ARIA_LABEL })).toBeInTheDocument();
  });

  it("labels the main content region correctly", () => {
    renderShell();
    expect(screen.getByRole("main", { name: MAIN_CONTENT_LABEL })).toBeInTheDocument();
  });
});

describe("AppShell — detail panel", () => {
  it("does not render the detail panel when not provided", () => {
    renderShell();
    expect(
      screen.queryByRole("complementary", { name: DETAIL_PANEL_ARIA_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("renders the detail panel when provided", () => {
    renderShell({
      detailPanel: <div data-testid="detail-content">Detail</div>,
    });
    expect(
      screen.getByRole("complementary", { name: DETAIL_PANEL_ARIA_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("detail-content")).toBeInTheDocument();
  });
});

describe("AppShell — artwork banner", () => {
  it("does not render the banner slot when not provided", () => {
    renderShell();
    expect(screen.queryByTestId("artwork-banner")).not.toBeInTheDocument();
  });

  it("renders the artwork banner when provided", () => {
    renderShell({
      artworkBanner: <div data-testid="artwork-banner">Banner</div>,
    });
    expect(screen.getByTestId("artwork-banner")).toBeInTheDocument();
  });
});

describe("AppShell — shell blocking", () => {
  it("marks sidebar and topbar as shell-blockable", () => {
    renderShell();
    const blockable = document.querySelectorAll("[data-shell-blockable]");
    expect(blockable).toHaveLength(2);
  });

  it("does not apply blocking classes when isBlocked is false", () => {
    renderShell({ isBlocked: false });
    const sidebar = screen.getByRole("complementary", { name: SIDEBAR_ARIA_LABEL });
    expect(sidebar).not.toHaveClass("opacity-40");
    expect(sidebar).not.toHaveClass("pointer-events-none");
  });

  it("applies opacity-40 to sidebar and topbar when isBlocked is true", () => {
    renderShell({ isBlocked: true });
    const sidebar = screen.getByRole("complementary", { name: SIDEBAR_ARIA_LABEL });
    const topbar = screen.getByRole("banner");
    expect(sidebar).toHaveClass("opacity-40");
    expect(topbar).toHaveClass("opacity-40");
  });

  it("applies pointer-events-none to sidebar and topbar when isBlocked is true", () => {
    renderShell({ isBlocked: true });
    const sidebar = screen.getByRole("complementary", { name: SIDEBAR_ARIA_LABEL });
    const topbar = screen.getByRole("banner");
    expect(sidebar).toHaveClass("pointer-events-none");
    expect(topbar).toHaveClass("pointer-events-none");
  });
});
