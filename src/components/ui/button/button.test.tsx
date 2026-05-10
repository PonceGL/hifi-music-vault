import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders its text content", () => {
    render(<Button>Save changes</Button>);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Button disabled>Save changes</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("uses the primary variant by default", () => {
    render(<Button>Confirm</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "primary",
    );
  });

  it("applies the secondary variant when specified", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("applies the destructive variant when specified", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("forwards native button props", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
