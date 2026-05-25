import { fireEvent, render, screen } from "@testing-library/react";
import { SyncErrorModal } from "./index";
import type { SyncCriticalError } from "@/types/sync";

const onRetry = jest.fn();
const onClose = jest.fn();

const DISK_FULL_ERROR: SyncCriticalError = {
  kind: "disk_full",
  message: "No hay espacio suficiente en disco",
  affectedPath: "/Users/juan/Music/Biblioteca",
  moved: 143,
  pending: 88,
  inProcess: 1,
};

const DISK_DISCONNECTED_ERROR: SyncCriticalError = {
  kind: "disk_disconnected",
  message: "Disco externo desconectado",
  affectedPath: "/Volumes/MusicDisk/Biblioteca",
  moved: 67,
  pending: 164,
  inProcess: 1,
};

const PERMISSION_DENIED_ERROR: SyncCriticalError = {
  kind: "permission_denied",
  message: "Sin permisos de escritura",
  affectedPath: "/Users/juan/Music/Biblioteca",
  moved: 0,
  pending: 231,
  inProcess: 0,
};

const DEFAULT_PROPS = {
  isOpen: true,
  onRetry,
  onClose,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyncErrorModal — título", () => {
  it("renders the interruption title", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(
      screen.getByRole("heading", { name: /sincronización interrumpida/i }),
    ).toBeInTheDocument();
  });
});

describe("SyncErrorModal — tipo de error", () => {
  it("shows disk_full message", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(
      screen.getByText(/no hay espacio suficiente en disco/i),
    ).toBeInTheDocument();
  });

  it("shows disk_disconnected message", () => {
    render(
      <SyncErrorModal {...DEFAULT_PROPS} error={DISK_DISCONNECTED_ERROR} />,
    );
    expect(screen.getByText(/disco externo desconectado/i)).toBeInTheDocument();
  });

  it("shows permission_denied message", () => {
    render(
      <SyncErrorModal {...DEFAULT_PROPS} error={PERMISSION_DENIED_ERROR} />,
    );
    expect(screen.getByText(/sin permisos de escritura/i)).toBeInTheDocument();
  });

  it("renders the affected path", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(
      screen.getByText("/Users/juan/Music/Biblioteca"),
    ).toBeInTheDocument();
  });
});

describe("SyncErrorModal — tabla de estado de archivos", () => {
  it("renders moved count", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(screen.getByText("143")).toBeInTheDocument();
    expect(screen.getByText(/archivos movidos con éxito/i)).toBeInTheDocument();
  });

  it("renders pending count", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText(/archivos pendientes/i)).toBeInTheDocument();
  });

  it("renders inProcess count", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByText(/archivo en proceso.*puede estar incompleto/i),
    ).toBeInTheDocument();
  });
});

describe("SyncErrorModal — nota de archivo incompleto", () => {
  it("shows incomplete note when inProcess > 0", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(screen.getByText(/verificación requerida/i)).toBeInTheDocument();
  });

  it("hides incomplete note when inProcess is 0", () => {
    render(
      <SyncErrorModal {...DEFAULT_PROPS} error={PERMISSION_DENIED_ERROR} />,
    );
    expect(
      screen.queryByText(/verificación requerida/i),
    ).not.toBeInTheDocument();
  });
});

describe("SyncErrorModal — botón retry", () => {
  it("shows 'Liberar espacio y reintentar' for disk_full", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(
      screen.getByRole("button", { name: /liberar espacio y reintentar/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Reconectar disco y reintentar' for disk_disconnected", () => {
    render(
      <SyncErrorModal {...DEFAULT_PROPS} error={DISK_DISCONNECTED_ERROR} />,
    );
    expect(
      screen.getByRole("button", { name: /reconectar disco y reintentar/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Corregir permisos y reintentar' for permission_denied", () => {
    render(
      <SyncErrorModal {...DEFAULT_PROPS} error={PERMISSION_DENIED_ERROR} />,
    );
    expect(
      screen.getByRole("button", { name: /corregir permisos y reintentar/i }),
    ).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    fireEvent.click(
      screen.getByRole("button", { name: /liberar espacio y reintentar/i }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("SyncErrorModal — botón cerrar", () => {
  it("renders the close button", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    expect(screen.getByRole("button", { name: /cerrar/i })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<SyncErrorModal {...DEFAULT_PROPS} error={DISK_FULL_ERROR} />);
    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("SyncErrorModal — visibilidad", () => {
  it("does not render when isOpen is false", () => {
    render(
      <SyncErrorModal
        {...DEFAULT_PROPS}
        isOpen={false}
        error={DISK_FULL_ERROR}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /sincronización interrumpida/i }),
    ).not.toBeInTheDocument();
  });
});
