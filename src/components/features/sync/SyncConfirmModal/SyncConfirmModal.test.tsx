import { fireEvent, render, screen } from "@testing-library/react";
import { SyncConfirmModal } from "./index";
import type { PrescanResponseDto } from "@/app/api/sync/prescan/dtos/prescan.dto";

const DOWNLOADS_PATH = "/Users/juan/Downloads/Música";
const LIBRARY_PATH = "/Users/juan/Music/Biblioteca";

const HAPPY_PRESCAN: PrescanResponseDto = {
  toMove: 235,
  ignored: { duplicates: 12, missingMetadata: 4 },
  tagFolders: ["Rock", "Favoritos"],
  depthExceededCount: 0,
  longPathWarnings: 0,
};

const EMPTY_PRESCAN: PrescanResponseDto = {
  toMove: 0,
  ignored: { duplicates: 0, missingMetadata: 0 },
  tagFolders: [],
  depthExceededCount: 0,
  longPathWarnings: 0,
};

const ALL_DUPLICATES_PRESCAN: PrescanResponseDto = {
  toMove: 0,
  ignored: { duplicates: 247, missingMetadata: 0 },
  tagFolders: [],
  depthExceededCount: 0,
  longPathWarnings: 0,
};

const WITH_WARNINGS_PRESCAN: PrescanResponseDto = {
  toMove: 230,
  ignored: { duplicates: 8, missingMetadata: 2 },
  tagFolders: ["Jazz"],
  depthExceededCount: 3,
  longPathWarnings: 2,
};

const onConfirm = jest.fn();
const onCancel = jest.fn();

const DEFAULT_PROPS = {
  isOpen: true,
  downloadsPath: DOWNLOADS_PATH,
  libraryPath: LIBRARY_PATH,
  onConfirm,
  onCancel,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyncConfirmModal — estructura", () => {
  it("renders the title", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.getByRole("heading", { name: /iniciar sincronización/i }),
    ).toBeInTheDocument();
  });

  it("renders the downloads path", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText(DOWNLOADS_PATH)).toBeInTheDocument();
  });

  it("renders the library path", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText(LIBRARY_PATH)).toBeInTheDocument();
  });

  it("renders the toMove count", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText("235 archivos de audio")).toBeInTheDocument();
  });

  it("renders singular file label when toMove is 1", () => {
    render(
      <SyncConfirmModal
        {...DEFAULT_PROPS}
        prescan={{ ...HAPPY_PRESCAN, toMove: 1 }}
      />,
    );
    expect(screen.getByText("1 archivo de audio")).toBeInTheDocument();
  });
});

describe("SyncConfirmModal — stats condicionales", () => {
  it("renders duplicates count when > 0", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("does not render duplicates row when count is 0", () => {
    render(
      <SyncConfirmModal
        {...DEFAULT_PROPS}
        prescan={{
          ...HAPPY_PRESCAN,
          ignored: { duplicates: 0, missingMetadata: 4 },
        }}
      />,
    );
    expect(
      screen.queryByText(/ignorados \(ya existen en biblioteca\)/i),
    ).not.toBeInTheDocument();
  });

  it("renders missingMetadata count when > 0", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("does not render missingMetadata row when count is 0", () => {
    render(
      <SyncConfirmModal
        {...DEFAULT_PROPS}
        prescan={{
          ...HAPPY_PRESCAN,
          ignored: { duplicates: 12, missingMetadata: 0 },
        }}
      />,
    );
    expect(
      screen.queryByText(/sin metadatos requeridos/i),
    ).not.toBeInTheDocument();
  });

  it("renders tag folders when present", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(screen.getByText("[Rock]")).toBeInTheDocument();
    expect(screen.getByText("[Favoritos]")).toBeInTheDocument();
  });

  it("does not render tag folders row when empty", () => {
    render(
      <SyncConfirmModal
        {...DEFAULT_PROPS}
        prescan={{ ...HAPPY_PRESCAN, tagFolders: [] }}
      />,
    );
    expect(
      screen.queryByText(/carpetas \[tag\] detectadas/i),
    ).not.toBeInTheDocument();
  });
});

describe("SyncConfirmModal — advertencias", () => {
  it("renders depth exceeded warning when count > 0", () => {
    render(
      <SyncConfirmModal {...DEFAULT_PROPS} prescan={WITH_WARNINGS_PRESCAN} />,
    );
    expect(screen.getByText(/límite de profundidad/i)).toBeInTheDocument();
  });

  it("renders singular depth warning when count is 1", () => {
    render(
      <SyncConfirmModal
        {...DEFAULT_PROPS}
        prescan={{ ...WITH_WARNINGS_PRESCAN, depthExceededCount: 1 }}
      />,
    );
    expect(screen.getByText(/1 archivo supera el límite/i)).toBeInTheDocument();
  });

  it("renders plural depth warning with count", () => {
    render(
      <SyncConfirmModal {...DEFAULT_PROPS} prescan={WITH_WARNINGS_PRESCAN} />,
    );
    expect(
      screen.getByText(/3 archivos superan el límite/i),
    ).toBeInTheDocument();
  });

  it("renders long path warning when count > 0", () => {
    render(
      <SyncConfirmModal {...DEFAULT_PROPS} prescan={WITH_WARNINGS_PRESCAN} />,
    );
    expect(screen.getByText(/rutas demasiado largas/i)).toBeInTheDocument();
  });

  it("does not render warnings when counts are 0", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.queryByText(/límite de profundidad/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/rutas demasiado largas/i),
    ).not.toBeInTheDocument();
  });
});

describe("SyncConfirmModal — botones", () => {
  it("renders the cancel button with autoFocus", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    const cancelBtn = screen.getByRole("button", { name: /cancelar/i });
    expect(cancelBtn).toBeInTheDocument();
  });

  it("calls onCancel when the cancel button is clicked", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders the confirm button", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.getByRole("button", { name: /sí, sincronizar/i }),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    fireEvent.click(screen.getByRole("button", { name: /sí, sincronizar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables the confirm button when toMove is 0 (no files)", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={EMPTY_PRESCAN} />);
    expect(
      screen.getByRole("button", { name: /sí, sincronizar/i }),
    ).toBeDisabled();
  });

  it("disables the confirm button when all are duplicates", () => {
    render(
      <SyncConfirmModal {...DEFAULT_PROPS} prescan={ALL_DUPLICATES_PRESCAN} />,
    );
    expect(
      screen.getByRole("button", { name: /sí, sincronizar/i }),
    ).toBeDisabled();
  });

  it("enables the confirm button when toMove > 0", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.getByRole("button", { name: /sí, sincronizar/i }),
    ).not.toBeDisabled();
  });
});

describe("SyncConfirmModal — estado bloqueante", () => {
  it("shows blocking message when no files found", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={EMPTY_PRESCAN} />);
    expect(
      screen.getByText(/no se encontraron archivos de audio/i),
    ).toBeInTheDocument();
  });

  it("shows blocking message when all are duplicates", () => {
    render(
      <SyncConfirmModal {...DEFAULT_PROPS} prescan={ALL_DUPLICATES_PRESCAN} />,
    );
    expect(
      screen.getByText(/no hay archivos nuevos para sincronizar/i),
    ).toBeInTheDocument();
  });

  it("does not show blocking message in the happy path", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.queryByText(/no se encontraron archivos/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/no hay archivos nuevos/i),
    ).not.toBeInTheDocument();
  });

  it("shows the irreversible notice when not blocked", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={HAPPY_PRESCAN} />);
    expect(
      screen.getByText(/esta acción no se puede deshacer desde la app/i),
    ).toBeInTheDocument();
  });

  it("hides the irreversible notice when blocked", () => {
    render(<SyncConfirmModal {...DEFAULT_PROPS} prescan={EMPTY_PRESCAN} />);
    expect(
      screen.queryByText(/esta acción no se puede deshacer desde la app/i),
    ).not.toBeInTheDocument();
  });
});
