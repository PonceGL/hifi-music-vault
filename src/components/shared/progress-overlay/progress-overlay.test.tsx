import { fireEvent, render, screen } from "@testing-library/react";
import { ProgressOverlay } from "./progress-overlay";
import { CANCEL_LABEL, PAUSE_LABEL } from "./constants";

const BASE_PROPS = {
  label: "Sincronizando biblioteca",
  progress: 45,
};

function renderWithShell(
  props: Partial<React.ComponentProps<typeof ProgressOverlay>> = {},
) {
  const merged = { isActive: true, ...BASE_PROPS, ...props };
  return render(
    <div>
      <aside data-shell-blockable data-testid="sidebar" />
      <header data-shell-blockable data-testid="topbar" />
      <ProgressOverlay {...merged} />
    </div>,
  );
}

describe("ProgressOverlay — shell blocking", () => {
  it("does not add pointer-events-none when isActive is false", () => {
    renderWithShell({ isActive: false });
    expect(screen.getByTestId("sidebar")).not.toHaveClass("pointer-events-none");
    expect(screen.getByTestId("topbar")).not.toHaveClass("pointer-events-none");
  });

  it("adds pointer-events-none to shell elements when isActive is true", () => {
    renderWithShell({ isActive: true });
    expect(screen.getByTestId("sidebar")).toHaveClass("pointer-events-none");
    expect(screen.getByTestId("topbar")).toHaveClass("pointer-events-none");
  });

  it("adds opacity-40 to shell elements when isActive is true", () => {
    renderWithShell({ isActive: true });
    expect(screen.getByTestId("sidebar")).toHaveClass("opacity-40");
    expect(screen.getByTestId("topbar")).toHaveClass("opacity-40");
  });

  it("removes blocking classes when isActive transitions from true to false", () => {
    const { rerender } = renderWithShell({ isActive: true });
    rerender(
      <div>
        <aside data-shell-blockable data-testid="sidebar" />
        <header data-shell-blockable data-testid="topbar" />
        <ProgressOverlay {...BASE_PROPS} isActive={false} />
      </div>,
    );
    expect(screen.getByTestId("sidebar")).not.toHaveClass("pointer-events-none");
    expect(screen.getByTestId("topbar")).not.toHaveClass("pointer-events-none");
  });
});

describe("ProgressOverlay — visibility", () => {
  it("is hidden when isActive is false", () => {
    renderWithShell({ isActive: false });
    const status = screen.getByRole("status", { hidden: true });
    expect(status).toHaveAttribute("aria-hidden", "true");
    expect(status.className).toContain("hidden");
  });

  it("is visible when isActive is true", () => {
    renderWithShell({ isActive: true });
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-hidden", "false");
  });
});

describe("ProgressOverlay — content", () => {
  it("renders the label", () => {
    renderWithShell({ isActive: true });
    expect(screen.getByText("Sincronizando biblioteca")).toBeInTheDocument();
  });

  it("renders the sublabel with font-mono when provided", () => {
    renderWithShell({ isActive: true, sublabel: "Moviendo 14 de 247 archivos" });
    const sublabel = screen.getByText("Moviendo 14 de 247 archivos");
    expect(sublabel).toBeInTheDocument();
    expect(sublabel.className).toContain("font-mono");
  });

  it("does not render sublabel when not provided", () => {
    renderWithShell({ isActive: true });
    expect(screen.queryByText(/Moviendo/)).not.toBeInTheDocument();
  });

  it("renders progress bar when active", () => {
    renderWithShell({ isActive: true, progress: 45 });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

describe("ProgressOverlay — actions", () => {
  it("renders the cancel button when onCancel is provided", () => {
    renderWithShell({ isActive: true, onCancel: jest.fn() });
    expect(screen.getByRole("button", { name: CANCEL_LABEL })).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    renderWithShell({ isActive: true, onCancel });
    fireEvent.click(screen.getByRole("button", { name: CANCEL_LABEL }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render cancel button when onCancel is not provided", () => {
    renderWithShell({ isActive: true });
    expect(screen.queryByRole("button", { name: CANCEL_LABEL })).not.toBeInTheDocument();
  });

  it("renders pause button when onPause is provided", () => {
    renderWithShell({ isActive: true, onPause: jest.fn() });
    expect(screen.getByRole("button", { name: PAUSE_LABEL })).toBeInTheDocument();
  });

  it("calls onPause when pause button is clicked", () => {
    const onPause = jest.fn();
    renderWithShell({ isActive: true, onPause });
    fireEvent.click(screen.getByRole("button", { name: PAUSE_LABEL }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("does not render pause button when onPause is not provided", () => {
    renderWithShell({ isActive: true });
    expect(screen.queryByRole("button", { name: PAUSE_LABEL })).not.toBeInTheDocument();
  });
});
