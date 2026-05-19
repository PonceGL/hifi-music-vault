import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  describe("rendering", () => {
    it("renders without errors (no value = indeterminate)", () => {
      render(<Progress />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders with value 0", () => {
      render(<Progress value={0} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders with value 100", () => {
      render(<Progress value={100} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders with an intermediate value", () => {
      render(<Progress value={75} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("aria attributes", () => {
    it("sets aria-valuenow for determinate mode", () => {
      render(<Progress value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "50",
      );
    });

    it("sets aria-valuemin to 0", () => {
      render(<Progress value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemin",
        "0",
      );
    });

    it("sets aria-valuemax to 100", () => {
      render(<Progress value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemax",
        "100",
      );
    });

    it("forwards aria-label for accessibility", () => {
      render(<Progress value={50} aria-label="Upload progress" />);
      expect(
        screen.getByRole("progressbar", { name: "Upload progress" }),
      ).toBeInTheDocument();
    });
  });

  describe("determinate mode", () => {
    it("sets data-mode to determinate when value is provided", () => {
      render(<Progress value={40} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "data-mode",
        "determinate",
      );
    });

    it("shows the percentage text when value is provided", () => {
      render(<Progress value={65} />);
      expect(screen.getByText("65%")).toBeInTheDocument();
    });

    it("clamps value above 100 to 100%", () => {
      render(<Progress value={120} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("clamps negative value to 0%", () => {
      render(<Progress value={-10} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  describe("indeterminate mode", () => {
    it("sets data-mode to indeterminate when value is undefined", () => {
      render(<Progress />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "data-mode",
        "indeterminate",
      );
    });

    it("does not show percentage text in indeterminate mode", () => {
      render(<Progress />);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("renders without errors with size=sm", () => {
      render(<Progress value={50} size="sm" />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders without errors with size=md (default)", () => {
      render(<Progress value={50} size="md" />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("showPercentage prop", () => {
    it("hides percentage text when showPercentage=false", () => {
      render(<Progress value={60} showPercentage={false} />);
      expect(screen.queryByText("60%")).not.toBeInTheDocument();
    });

    it("shows percentage text when showPercentage=true (default)", () => {
      render(<Progress value={60} showPercentage />);
      expect(screen.getByText("60%")).toBeInTheDocument();
    });
  });
});
