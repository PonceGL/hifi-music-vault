import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";
import { DEFAULT_CANCEL_LABEL, DEFAULT_CONFIRM_LABEL } from "./constants";

const BASE_PROPS = {
  isOpen: true,
  title: "¿Eliminar pista?",
  description: "Esta acción no se puede deshacer.",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ConfirmDialog", () => {
  describe("rendering", () => {
    it("renders the title when open", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      expect(screen.getByText("¿Eliminar pista?")).toBeInTheDocument();
    });

    it("renders the description when open", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      expect(
        screen.getByText("Esta acción no se puede deshacer."),
      ).toBeInTheDocument();
    });

    it("renders default cancel label", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      expect(
        screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL }),
      ).toBeInTheDocument();
    });

    it("renders default confirm label", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      expect(
        screen.getByRole("button", { name: DEFAULT_CONFIRM_LABEL }),
      ).toBeInTheDocument();
    });

    it("renders custom labels when provided", () => {
      render(
        <ConfirmDialog
          {...BASE_PROPS}
          cancelLabel="Volver"
          confirmLabel="Sí, eliminar"
        />,
      );
      expect(
        screen.getByRole("button", { name: "Volver" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sí, eliminar" }),
      ).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(<ConfirmDialog {...BASE_PROPS} isOpen={false} />);
      expect(screen.queryByText("¿Eliminar pista?")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onCancel when cancel button is clicked", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      fireEvent.click(
        screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL }),
      );
      expect(BASE_PROPS.onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when confirm button is clicked", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      fireEvent.click(
        screen.getByRole("button", { name: DEFAULT_CONFIRM_LABEL }),
      );
      expect(BASE_PROPS.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when cancel is clicked", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      fireEvent.click(
        screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL }),
      );
      expect(BASE_PROPS.onConfirm).not.toHaveBeenCalled();
    });

    it("does not call onCancel when confirm is clicked", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      fireEvent.click(
        screen.getByRole("button", { name: DEFAULT_CONFIRM_LABEL }),
      );
      expect(BASE_PROPS.onCancel).not.toHaveBeenCalled();
    });
  });

  describe("autoFocus on cancel", () => {
    it("cancel button receives focus when dialog opens", () => {
      render(<ConfirmDialog {...BASE_PROPS} />);
      const cancelButton = screen.getByRole("button", {
        name: DEFAULT_CANCEL_LABEL,
      });
      expect(cancelButton).toHaveFocus();
    });
  });
});
