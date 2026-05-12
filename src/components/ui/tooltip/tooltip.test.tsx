import { render, screen } from "@testing-library/react";
import { Tooltip } from "./tooltip";
import { TooltipContent } from "./tooltip-content";
import { TooltipProvider } from "./tooltip-provider";
import { TooltipTrigger } from "./tooltip-trigger";

function TestTooltipOpen() {
  return (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TestTooltipClosed() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("renders the trigger without errors", () => {
    render(<TestTooltipClosed />);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("tooltip content is not visible by default (closed)", () => {
    render(<TestTooltipClosed />);
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("shows tooltip content when open prop is true", () => {
    render(<TestTooltipOpen />);
    expect(screen.getAllByText("Tooltip text").length).toBeGreaterThan(0);
  });

  it("TooltipContent renders its text inside an open tooltip", () => {
    render(<TestTooltipOpen />);
    expect(screen.getAllByText("Tooltip text")[0]).toBeInTheDocument();
  });
});
