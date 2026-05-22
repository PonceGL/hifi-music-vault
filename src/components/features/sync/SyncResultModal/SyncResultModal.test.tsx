import { fireEvent, render, screen } from "@testing-library/react";
import { SyncResultModal } from "./index";
import type { SyncResult } from "@/types/sync";

const onGoToLibrary = jest.fn();

const HAPPY_RESULT: SyncResult = {
  moved: 231,
  duplicatesSkipped: 0,
  missingMetadataSkipped: 0,
  withWarnings: 0,
  errors: 0,
  playlistsUpdated: [],
};

const FULL_RESULT: SyncResult = {
  moved: 231,
  duplicatesSkipped: 12,
  missingMetadataSkipped: 4,
  withWarnings: 0,
  errors: 0,
  playlistsUpdated: ["Rock", "Favoritos"],
};

const FAILED_RESULT: SyncResult = {
  moved: 0,
  duplicatesSkipped: 0,
  missingMetadataSkipped: 0,
  withWarnings: 0,
  errors: 8,
  playlistsUpdated: [],
};

const DEFAULT_PROPS = {
  isOpen: true,
  onGoToLibrary,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyncResultModal — título", () => {
  it("shows 'completada' title by default", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(
      screen.getByRole("heading", { name: /sincronización completada/i }),
    ).toBeInTheDocument();
  });

  it("shows 'cancelada' title when wasCancelled is true", () => {
    render(
      <SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} wasCancelled />,
    );
    expect(
      screen.getByRole("heading", { name: /sincronización cancelada/i }),
    ).toBeInTheDocument();
  });
});

describe("SyncResultModal — contadores", () => {
  it("renders the moved count", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(screen.getByText("231")).toBeInTheDocument();
  });

  it("renders the ignored total (duplicates + missing metadata)", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FULL_RESULT} />);
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("renders ignored as 0 when both counts are 0", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the error count", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FAILED_RESULT} />);
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders stat labels: Movidos, Ignorados, Errores", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(screen.getByText("Movidos")).toBeInTheDocument();
    expect(screen.getByText("Ignorados")).toBeInTheDocument();
    expect(screen.getByText("Errores")).toBeInTheDocument();
  });
});

describe("SyncResultModal — desglose de ignorados", () => {
  it("shows breakdown when duplicatesSkipped > 0", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FULL_RESULT} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/ya existían en biblioteca/i)).toBeInTheDocument();
  });

  it("shows breakdown when missingMetadataSkipped > 0", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FULL_RESULT} />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(
      screen.getByText(/no se importaron — metadatos incompletos/i),
    ).toBeInTheDocument();
  });

  it("hides breakdown when both ignored counts are 0", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(
      screen.queryByText(/ya existían en biblioteca/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/metadatos incompletos/i),
    ).not.toBeInTheDocument();
  });

  it("shows only duplicates row when missingMetadataSkipped is 0", () => {
    render(
      <SyncResultModal
        {...DEFAULT_PROPS}
        result={{ ...FULL_RESULT, missingMetadataSkipped: 0 }}
      />,
    );
    expect(screen.getByText(/ya existían en biblioteca/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/metadatos incompletos/i),
    ).not.toBeInTheDocument();
  });
});

describe("SyncResultModal — playlists actualizadas", () => {
  it("shows playlists when playlistsUpdated is non-empty", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FULL_RESULT} />);
    expect(screen.getByText(/rock/i)).toBeInTheDocument();
    expect(screen.getByText(/favoritos/i)).toBeInTheDocument();
  });

  it("does not show playlists section when playlistsUpdated is empty", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(
      screen.queryByText(/playlists actualizadas/i),
    ).not.toBeInTheDocument();
  });

  it("joins multiple playlists with a separator", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={FULL_RESULT} />);
    expect(screen.getByText(/rock · favoritos/i)).toBeInTheDocument();
  });
});

describe("SyncResultModal — CTA", () => {
  it("renders the go-to-library button", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    expect(
      screen.getByRole("button", { name: /ir a biblioteca/i }),
    ).toBeInTheDocument();
  });

  it("calls onGoToLibrary when the CTA button is clicked", () => {
    render(<SyncResultModal {...DEFAULT_PROPS} result={HAPPY_RESULT} />);
    fireEvent.click(screen.getByRole("button", { name: /ir a biblioteca/i }));
    expect(onGoToLibrary).toHaveBeenCalledTimes(1);
  });
});

describe("SyncResultModal — visibilidad", () => {
  it("does not render when isOpen is false", () => {
    render(
      <SyncResultModal
        {...DEFAULT_PROPS}
        isOpen={false}
        result={HAPPY_RESULT}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /sincronización/i }),
    ).not.toBeInTheDocument();
  });
});
