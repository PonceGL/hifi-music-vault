import { render } from "@testing-library/react";
import { TrackCardSkeleton } from "./track-card-skeleton";

describe("TrackCardSkeleton", () => {
  it("renders without errors", () => {
    const { container } = render(<TrackCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is hidden from the accessibility tree", () => {
    const { container } = render(<TrackCardSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the artwork placeholder block", () => {
    const { container } = render(<TrackCardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders the info section with skeleton bars", () => {
    const { container } = render(<TrackCardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("accepts a className prop", () => {
    const { container } = render(<TrackCardSkeleton className="opacity-50" />);
    expect(container.firstChild).toHaveClass("opacity-50");
  });

  it("accepts a style prop for animation delay", () => {
    const { container } = render(
      <TrackCardSkeleton style={{ animationDelay: "150ms" }} />,
    );
    expect((container.firstChild as HTMLElement).style.animationDelay).toBe("150ms");
  });
});
