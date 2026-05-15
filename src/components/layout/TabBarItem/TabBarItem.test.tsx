import { render, screen } from "@testing-library/react";
import { Library } from "lucide-react";
import { TabBarItem } from ".";

const BASE_PROPS = {
  icon: Library,
  label: "Biblioteca",
  href: "/library",
  isActive: false,
};

describe("TabBarItem", () => {
  it("renders without crashing", () => {
    render(<TabBarItem {...BASE_PROPS} />);
  });

  it("renders the label text", () => {
    render(<TabBarItem {...BASE_PROPS} />);
    expect(screen.getByText("Biblioteca")).toBeInTheDocument();
  });

  it("renders a link pointing to the correct href", () => {
    render(<TabBarItem {...BASE_PROPS} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/library");
  });

  it("does not set aria-current when inactive", () => {
    render(<TabBarItem {...BASE_PROPS} isActive={false} />);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("sets aria-current=page when active", () => {
    render(<TabBarItem {...BASE_PROPS} isActive={true} />);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});
