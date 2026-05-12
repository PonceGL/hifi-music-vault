import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders without errors", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders as a div element", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton").tagName).toBe("DIV");
  });

  it("accepts and forwards additional HTML attributes", () => {
    render(<Skeleton data-testid="skeleton" aria-label="Loading..." />);
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });

  it("accepts an id attribute", () => {
    render(<Skeleton id="skeleton-id" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute("id", "skeleton-id");
  });
});
