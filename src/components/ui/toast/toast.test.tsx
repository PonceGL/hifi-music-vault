import { fireEvent, render, screen } from "@testing-library/react";
import { Toast } from "./toast";

const BASE_PROPS = {
  id: "toast-1",
  variant: "success" as const,
  title: "Archivo guardado",
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Toast", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<Toast {...BASE_PROPS} />);
      expect(screen.getByText("Archivo guardado")).toBeInTheDocument();
    });

    it("renders the description when provided", () => {
      render(
        <Toast {...BASE_PROPS} description="Se guardó en la biblioteca" />,
      );
      expect(
        screen.getByText("Se guardó en la biblioteca"),
      ).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<Toast {...BASE_PROPS} />);
      expect(screen.queryByText(/Se guardó/)).not.toBeInTheDocument();
    });

    it("renders the close button", () => {
      render(<Toast {...BASE_PROPS} />);
      expect(
        screen.getByRole("button", { name: /cerrar notificación/i }),
      ).toBeInTheDocument();
    });
  });

  describe("aria roles", () => {
    it("uses role=status for success", () => {
      render(<Toast {...BASE_PROPS} variant="success" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=status for info", () => {
      render(<Toast {...BASE_PROPS} variant="info" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=status for warning", () => {
      render(<Toast {...BASE_PROPS} variant="warning" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=alert for error", () => {
      render(<Toast {...BASE_PROPS} variant="error" />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("close button", () => {
    it("calls onClose with the toast id when close is clicked", () => {
      const onClose = jest.fn();
      render(<Toast {...BASE_PROPS} id="abc-123" onClose={onClose} />);
      fireEvent.click(
        screen.getByRole("button", { name: /cerrar notificación/i }),
      );
      expect(onClose).toHaveBeenCalledWith("abc-123");
    });

    it("calls onClose exactly once", () => {
      const onClose = jest.fn();
      render(<Toast {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(
        screen.getByRole("button", { name: /cerrar notificación/i }),
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
