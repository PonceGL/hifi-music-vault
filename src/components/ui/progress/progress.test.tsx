import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  it("renders without errors", () => {
    render(<Progress />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has the progressbar role for accessibility", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders with value 0 without errors", () => {
    render(<Progress value={0} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders with value 100 without errors", () => {
    render(<Progress value={100} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders with an intermediate value without errors", () => {
    render(<Progress value={75} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("forwards aria-label for accessibility", () => {
    render(<Progress value={50} aria-label="Upload progress" />);
    expect(screen.getByRole("progressbar", { name: "Upload progress" })).toBeInTheDocument();
  });
});
