import { render, screen } from "@testing-library/react";
import { TabBar } from ".";
import { TAB_ITEMS, TAB_BAR_ARIA_LABEL } from "./constants";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/library"),
}));

import { usePathname } from "next/navigation";

const mockUsePathname = usePathname as jest.Mock;

beforeEach(() => {
  mockUsePathname.mockReturnValue("/library");
});

describe("TabBar — structure", () => {
  it("renders without crashing", () => {
    render(<TabBar />);
  });

  it("renders the nav landmark with the correct aria-label", () => {
    render(<TabBar />);
    expect(
      screen.getByRole("navigation", { name: TAB_BAR_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("renders all tab items", () => {
    render(<TabBar />);
    TAB_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("renders a link for each tab item", () => {
    render(<TabBar />);
    expect(screen.getAllByRole("link")).toHaveLength(TAB_ITEMS.length);
  });
});

describe("TabBar — active state", () => {
  it("marks the active route with aria-current=page", () => {
    mockUsePathname.mockReturnValue("/library");
    render(<TabBar />);
    expect(
      screen.getByRole("link", { name: /Biblioteca/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("does not mark inactive tabs with aria-current", () => {
    mockUsePathname.mockReturnValue("/library");
    render(<TabBar />);
    expect(
      screen.getByRole("link", { name: /Artistas/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks the correct tab active when on /artists", () => {
    mockUsePathname.mockReturnValue("/artists");
    render(<TabBar />);
    expect(
      screen.getByRole("link", { name: /Artistas/i }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /Biblioteca/i }),
    ).not.toHaveAttribute("aria-current");
  });
});
