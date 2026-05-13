import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("renders without errors", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with a placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<Input value="hello" onChange={jest.fn()} />);
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
  });

  it("calls onChange when the user types", () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "new value" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders with type password", () => {
    render(<Input type="password" data-testid="pwd" />);
    expect(screen.getByTestId("pwd")).toHaveAttribute("type", "password");
  });

  it("renders with type email", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("forwards native HTML attributes", () => {
    render(<Input aria-label="search" />);
    expect(screen.getByRole("textbox", { name: "search" })).toBeInTheDocument();
  });
});
