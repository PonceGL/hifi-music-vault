import { render } from "@testing-library/react";
import { TrackRowSkeleton } from "./track-row-skeleton";

describe("TrackRowSkeleton", () => {
  it("renders without errors", () => {
    const { container } = render(<TrackRowSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is hidden from the accessibility tree", () => {
    const { container } = render(<TrackRowSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the thumbnail placeholder", () => {
    const { container } = render(<TrackRowSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("accepts a className prop", () => {
    const { container } = render(<TrackRowSkeleton className="border-b" />);
    expect(container.firstChild).toHaveClass("border-b");
  });

  it("accepts a style prop for animation delay", () => {
    const { container } = render(
      <TrackRowSkeleton style={{ animationDelay: "100ms" }} />,
    );
    expect((container.firstChild as HTMLElement).style.animationDelay).toBe("100ms");
  });
});
