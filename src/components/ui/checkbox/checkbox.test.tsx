import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders without errors", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("reflects checked state when checked prop is true", () => {
    render(<Checkbox checked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("calls onCheckedChange when clicked", () => {
    const onCheckedChange = jest.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("does not call onCheckedChange when disabled", () => {
    const onCheckedChange = jest.fn();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("forwards aria attributes", () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(
      screen.getByRole("checkbox", { name: "Accept terms" }),
    ).toBeInTheDocument();
  });
});
