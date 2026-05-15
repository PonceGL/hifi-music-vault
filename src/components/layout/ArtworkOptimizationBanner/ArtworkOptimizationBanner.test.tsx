import { fireEvent, render, screen } from "@testing-library/react";
import { ArtworkOptimizationBanner } from ".";
import { BANNER_ARIA_LABEL, CANCEL_LABEL } from "./constants";

const BASE_PROPS = {
  isVisible: true,
  progress: 60,
  current: 30,
  total: 50,
  onCancel: jest.fn(),
};

describe("ArtworkOptimizationBanner — visibility", () => {
  it("renders without crashing", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} />);
  });

  it("is present in the DOM when isVisible=true", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} isVisible />);
    expect(screen.getByRole("status", { name: BANNER_ARIA_LABEL })).toBeInTheDocument();
  });

  it("is present in the DOM when isVisible=false (hidden via CSS, not removed)", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} isVisible={false} />);
    expect(
      screen.getByRole("status", { name: BANNER_ARIA_LABEL, hidden: true }),
    ).toBeInTheDocument();
  });

  it("sets aria-hidden=true on the container when isVisible=false", () => {
    const { container } = render(
      <ArtworkOptimizationBanner {...BASE_PROPS} isVisible={false} />,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("does not set aria-hidden when isVisible=true", () => {
    const { container } = render(
      <ArtworkOptimizationBanner {...BASE_PROPS} isVisible />,
    );
    expect(container.firstChild).not.toHaveAttribute("aria-hidden", "true");
  });
});

describe("ArtworkOptimizationBanner — content", () => {
  it("shows the current file number", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} current={30} total={50} />);
    expect(screen.getByText("(30/50)")).toBeInTheDocument();
  });

  it("shows the correct current and total when values change", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} current={48} total={50} />);
    expect(screen.getByText("(48/50)")).toBeInTheDocument();
  });

  it("renders the progress bar", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders the cancel button", () => {
    render(<ArtworkOptimizationBanner {...BASE_PROPS} />);
    expect(
      screen.getByRole("button", { name: CANCEL_LABEL }),
    ).toBeInTheDocument();
  });
});

describe("ArtworkOptimizationBanner — interactions", () => {
  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<ArtworkOptimizationBanner {...BASE_PROPS} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: CANCEL_LABEL }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("ArtworkOptimizationBanner — completed state", () => {
  it("remains in the DOM at progress=100 (parent controls visibility)", () => {
    render(
      <ArtworkOptimizationBanner {...BASE_PROPS} progress={100} isVisible />,
    );
    expect(screen.getByRole("status", { name: BANNER_ARIA_LABEL })).toBeInTheDocument();
  });

  it("applies aria-hidden when isVisible=false at progress=100", () => {
    const { container } = render(
      <ArtworkOptimizationBanner {...BASE_PROPS} progress={100} isVisible={false} />,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
