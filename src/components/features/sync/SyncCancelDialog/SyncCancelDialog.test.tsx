import { fireEvent, render, screen } from "@testing-library/react";
import { SyncCancelDialog } from "./index";

const onContinue = jest.fn();
const onConfirmCancel = jest.fn();

const DEFAULT_PROPS = {
  isOpen: true,
  movedCount: 143,
  onContinue,
  onConfirmCancel,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyncCancelDialog — renderizado", () => {
  it("renders the title", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    expect(
      screen.getByRole("heading", { name: /cancelar sincronización/i }),
    ).toBeInTheDocument();
  });

  it("renders the moved count (plural)", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} movedCount={143} />);
    expect(
      screen.getByText("143 archivos ya fueron movidos a la Biblioteca."),
    ).toBeInTheDocument();
  });

  it("renders the moved count (singular)", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} movedCount={1} />);
    expect(
      screen.getByText("1 archivo ya fue movido a la Biblioteca."),
    ).toBeInTheDocument();
  });

  it("renders the irreversible notice", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    expect(
      screen.getByText("Esta acción no se puede revertir."),
    ).toBeInTheDocument();
  });

  it("renders the pending files notice", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    expect(
      screen.getByText("Los archivos pendientes permanecerán en Descargas."),
    ).toBeInTheDocument();
  });
});

describe("SyncCancelDialog — botones", () => {
  it("renders the continue button", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    expect(
      screen.getByRole("button", { name: /seguir sincronizando/i }),
    ).toBeInTheDocument();
  });

  it("calls onContinue when the continue button is clicked", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    fireEvent.click(
      screen.getByRole("button", { name: /seguir sincronizando/i }),
    );
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("renders the confirm cancel button", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    expect(
      screen.getByRole("button", { name: /cancelar de todas formas/i }),
    ).toBeInTheDocument();
  });

  it("calls onConfirmCancel when the confirm cancel button is clicked", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    fireEvent.click(
      screen.getByRole("button", { name: /cancelar de todas formas/i }),
    );
    expect(onConfirmCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onContinue when confirm cancel is clicked", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} />);
    fireEvent.click(
      screen.getByRole("button", { name: /cancelar de todas formas/i }),
    );
    expect(onContinue).not.toHaveBeenCalled();
  });
});

describe("SyncCancelDialog — visibilidad", () => {
  it("does not render when isOpen is false", () => {
    render(<SyncCancelDialog {...DEFAULT_PROPS} isOpen={false} />);
    expect(
      screen.queryByRole("heading", { name: /cancelar sincronización/i }),
    ).not.toBeInTheDocument();
  });
});
