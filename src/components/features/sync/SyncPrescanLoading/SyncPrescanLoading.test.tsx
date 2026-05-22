import { render, screen } from "@testing-library/react";
import { SyncPrescanLoading } from "./index";

const DOWNLOADS_PATH = "/Users/juan/Downloads/Música";

describe("SyncPrescanLoading", () => {
  describe("when open", () => {
    it("renders the title", () => {
      render(<SyncPrescanLoading isOpen downloadsPath={DOWNLOADS_PATH} />);
      expect(
        screen.getByRole("heading", { name: /analizando archivos/i }),
      ).toBeInTheDocument();
    });

    it("renders the downloads path", () => {
      render(<SyncPrescanLoading isOpen downloadsPath={DOWNLOADS_PATH} />);
      expect(screen.getByText(DOWNLOADS_PATH)).toBeInTheDocument();
    });

    it("renders a spinner with aria-hidden", () => {
      render(<SyncPrescanLoading isOpen downloadsPath={DOWNLOADS_PATH} />);
      const svg = document.querySelector("svg[aria-hidden='true']");
      expect(svg).toBeInTheDocument();
    });

    it("renders a status region accessible to screen readers", () => {
      render(<SyncPrescanLoading isOpen downloadsPath={DOWNLOADS_PATH} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("when closed", () => {
    it("does not render the title", () => {
      render(
        <SyncPrescanLoading isOpen={false} downloadsPath={DOWNLOADS_PATH} />,
      );
      expect(
        screen.queryByRole("heading", { name: /analizando archivos/i }),
      ).not.toBeInTheDocument();
    });
  });
});
