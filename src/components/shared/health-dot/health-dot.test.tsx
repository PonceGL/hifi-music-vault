import { render, screen } from "@testing-library/react";
import { HealthDot } from "./health-dot";

describe("HealthDot", () => {
  describe("rendering", () => {
    it("renders without crashing for all HealthStatus values", () => {
      const statuses = ["complete", "warning", "alert", "critical"] as const;
      statuses.forEach((status) => {
        const { unmount } = render(<HealthDot status={status} />);
        unmount();
      });
    });

    it("renders a visible element in the DOM", () => {
      render(<HealthDot status="complete" />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });
  });

  describe("aria-label", () => {
    it("has aria-label 'Salud: completo' for complete status", () => {
      render(<HealthDot status="complete" />);
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        "Salud: completo",
      );
    });

    it("has aria-label 'Salud: falta: género' for warning status", () => {
      render(<HealthDot status="warning" />);
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        "Salud: falta: género",
      );
    });

    it("has aria-label 'Salud: falta: álbum' for alert status", () => {
      render(<HealthDot status="alert" />);
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        "Salud: falta: álbum",
      );
    });

    it("has aria-label 'Salud: archivo corrupto' for critical status", () => {
      render(<HealthDot status="critical" />);
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        "Salud: archivo corrupto",
      );
    });
  });

  describe("sizes", () => {
    it("uses standard size by default", () => {
      render(<HealthDot status="complete" />);
      const dot = screen.getByRole("img");
      expect(dot).toHaveStyle({ width: "8px", height: "8px" });
    });

    it("applies large size when specified", () => {
      render(<HealthDot status="complete" size="large" />);
      const dot = screen.getByRole("img");
      expect(dot).toHaveStyle({ width: "10px", height: "10px" });
    });
  });
});
