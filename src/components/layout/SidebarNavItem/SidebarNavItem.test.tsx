import { render, screen } from "@testing-library/react";
import { Library } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNavItem } from ".";

const BASE_PROPS = {
  icon: Library,
  label: "Biblioteca",
  href: "/library",
  isActive: false,
  isCollapsed: false,
};

function renderItem(
  props: Partial<typeof BASE_PROPS> = {},
): ReturnType<typeof render> {
  return render(
    <TooltipProvider>
      <SidebarNavItem {...BASE_PROPS} {...props} />
    </TooltipProvider>,
  );
}

describe("SidebarNavItem — expanded", () => {
  it("renders without crashing", () => {
    renderItem();
  });

  it("renders the label when expanded", () => {
    renderItem({ isCollapsed: false });
    expect(screen.getByText("Biblioteca")).toBeInTheDocument();
  });

  it("renders a link pointing to the correct href", () => {
    renderItem();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/library");
  });

  it("does not set aria-current when inactive", () => {
    renderItem({ isActive: false });
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("sets aria-current=page when active", () => {
    renderItem({ isActive: true });
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});

describe("SidebarNavItem — collapsed", () => {
  it("does not render the label text when collapsed", () => {
    renderItem({ isCollapsed: true });
    expect(screen.queryByText("Biblioteca")).not.toBeInTheDocument();
  });

  it("still renders the link when collapsed", () => {
    renderItem({ isCollapsed: true });
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("still marks active with aria-current when collapsed", () => {
    renderItem({ isCollapsed: true, isActive: true });
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});
