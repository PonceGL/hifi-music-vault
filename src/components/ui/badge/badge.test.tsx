import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders without errors", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders its children", () => {
    render(<Badge>Featured</Badge>);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders the default variant without errors", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("renders the secondary variant without errors", () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("renders the destructive variant without errors", () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("renders the outline variant without errors", () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("forwards HTML attributes to the underlying element", () => {
    render(<Badge aria-label="status badge">Active</Badge>);
    expect(screen.getByLabelText("status badge")).toBeInTheDocument();
  });
});
