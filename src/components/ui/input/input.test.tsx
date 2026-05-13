import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  describe("rendering", () => {
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

    it("forwards native HTML attributes", () => {
      render(<Input aria-label="search" />);
      expect(screen.getByRole("textbox", { name: "search" })).toBeInTheDocument();
    });

    it("renders with type password", () => {
      render(<Input type="password" data-testid="pwd" />);
      expect(screen.getByTestId("pwd")).toHaveAttribute("type", "password");
    });

    it("renders with type email", () => {
      render(<Input type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
    });
  });

  describe("interaction", () => {
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
  });

  describe("validation states", () => {
    it("shows the error message when error prop is provided", () => {
      render(<Input error="Campo requerido" />);
      expect(screen.getByRole("alert")).toHaveTextContent("Campo requerido");
    });

    it("shows the warning message when warning prop is provided", () => {
      render(<Input warning="Valor inusual" />);
      expect(screen.getByRole("status")).toHaveTextContent("Valor inusual");
    });

    it("prioritizes error over warning when both are provided", () => {
      render(<Input error="Error" warning="Warning" />);
      expect(screen.getByRole("alert")).toHaveTextContent("Error");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("sets data-state to error when error prop is present", () => {
      render(<Input error="Campo requerido" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("data-state", "error");
    });

    it("sets data-state to warning when warning prop is present", () => {
      render(<Input warning="Valor inusual" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("data-state", "warning");
    });

    it("sets data-state to default when no validation props", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toHaveAttribute("data-state", "default");
    });
  });
});
