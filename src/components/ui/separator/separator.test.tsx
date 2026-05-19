import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renders without errors (decorative by default)", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toBeInTheDocument();
  });

  it("has no separator role when decorative (default)", () => {
    render(<Separator />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("has separator role when decorative is false", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("has horizontal orientation by default", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("renders with vertical orientation", () => {
    render(<Separator orientation="vertical" decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});
