import { fireEvent, render, screen } from "@testing-library/react";
import { Sidebar } from ".";
import {
  NAV_ITEMS,
  SIDEBAR_NAV_ARIA_LABEL,
  TOGGLE_COLLAPSE_LABEL,
  TOGGLE_EXPAND_LABEL,
} from "./constants";

jest.mock("@/hooks/useSidebar", () => ({
  useSidebar: jest.fn(() => ({ isCollapsed: false, toggle: jest.fn() })),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/library"),
}));

import { useSidebar } from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";

const mockUseSidebar = useSidebar as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

beforeEach(() => {
  mockUseSidebar.mockReturnValue({ isCollapsed: false, toggle: jest.fn() });
  mockUsePathname.mockReturnValue("/library");
});

describe("Sidebar — structure", () => {
  it("renders without crashing", () => {
    render(<Sidebar />);
  });

  it("renders the nav landmark with correct label", () => {
    render(<Sidebar />);
    expect(screen.getByRole("navigation", { name: SIDEBAR_NAV_ARIA_LABEL })).toBeInTheDocument();
  });

  it("renders all nav items", () => {
    render(<Sidebar />);
    NAV_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("marks the current route item as active", () => {
    mockUsePathname.mockReturnValue("/library");
    render(<Sidebar />);
    const activeLink = screen.getByRole("link", { name: /Biblioteca/i });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does not mark other items as active", () => {
    mockUsePathname.mockReturnValue("/library");
    render(<Sidebar />);
    const artistsLink = screen.getByRole("link", { name: /Artistas/i });
    expect(artistsLink).not.toHaveAttribute("aria-current");
  });
});

describe("Sidebar — collapsed state", () => {
  it("shows collapse button label when expanded", () => {
    mockUseSidebar.mockReturnValue({ isCollapsed: false, toggle: jest.fn() });
    render(<Sidebar />);
    expect(
      screen.getByRole("button", { name: TOGGLE_COLLAPSE_LABEL }),
    ).toBeInTheDocument();
  });

  it("shows expand button label when collapsed", () => {
    mockUseSidebar.mockReturnValue({ isCollapsed: true, toggle: jest.fn() });
    render(<Sidebar />);
    expect(
      screen.getByRole("button", { name: TOGGLE_EXPAND_LABEL }),
    ).toBeInTheDocument();
  });

  it("hides nav labels when collapsed", () => {
    mockUseSidebar.mockReturnValue({ isCollapsed: true, toggle: jest.fn() });
    render(<Sidebar />);
    NAV_ITEMS.forEach((item) => {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    });
  });

  it("calls toggle when collapse button is clicked", () => {
    const toggle = jest.fn();
    mockUseSidebar.mockReturnValue({ isCollapsed: false, toggle });
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: TOGGLE_COLLAPSE_LABEL }));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

describe("Sidebar — stats footer", () => {
  it("shows track count and disk space when stats are provided", () => {
    render(<Sidebar stats={{ trackCount: 1284, diskSpaceLabel: "47.2 GB" }} />);
    expect(screen.getByText(/1284/)).toBeInTheDocument();
    expect(screen.getByText(/47.2 GB/)).toBeInTheDocument();
  });

  it("hides stats when sidebar is collapsed", () => {
    mockUseSidebar.mockReturnValue({ isCollapsed: true, toggle: jest.fn() });
    render(<Sidebar stats={{ trackCount: 1284, diskSpaceLabel: "47.2 GB" }} />);
    expect(screen.queryByText(/1284/)).not.toBeInTheDocument();
  });

  it("renders without stats when not provided", () => {
    render(<Sidebar />);
  });
});
