import { render, screen } from "@testing-library/react";
import { ScrollArea } from "./scroll-area";
import { ScrollBar } from "./scroll-bar";

describe("ScrollArea", () => {
  it("renders without errors", () => {
    render(<ScrollArea data-testid="scroll-area" />);
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
  });

  it("renders its children", () => {
    render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <ScrollArea>
        <p>Item 1</p>
        <p>Item 2</p>
        <p>Item 3</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});

describe("ScrollBar", () => {
  it("renders within ScrollArea without errors (vertical by default)", () => {
    expect(() =>
      render(
        <ScrollArea>
          <ScrollBar />
        </ScrollArea>,
      ),
    ).not.toThrow();
  });

  it("renders with horizontal orientation without errors", () => {
    expect(() =>
      render(
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>,
      ),
    ).not.toThrow();
  });
});
