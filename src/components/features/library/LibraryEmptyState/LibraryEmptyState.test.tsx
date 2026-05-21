import { fireEvent, render, screen } from "@testing-library/react";
import { LibraryEmptyState } from "./index";

const onSync = jest.fn();
const onChangeFolder = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LibraryEmptyState — variant A (primera sync)", () => {
  it("renders the title", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={5} />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Tu biblioteca está vacía",
    );
  });

  it("renders plural description when count > 1", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={247} />);
    expect(
      screen.getByText(
        "Tienes 247 archivos listos para organizar en tu carpeta de Descargas.",
      ),
    ).toBeInTheDocument();
  });

  it("renders singular description when count is 1", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={1} />);
    expect(
      screen.getByText(
        "Tienes 1 archivo listo para organizar en tu carpeta de Descargas.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the sync CTA button", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={5} />);
    expect(
      screen.getByRole("button", { name: /sincronizar ahora/i }),
    ).toBeInTheDocument();
  });

  it("calls onSync when the sync button is clicked", () => {
    render(
      <LibraryEmptyState variant="A" downloadsCount={5} onSync={onSync} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /sincronizar ahora/i }));
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it("renders the footer with change folder link", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={5} />);
    expect(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    ).toBeInTheDocument();
  });

  it("calls onChangeFolder when the change folder button is clicked", () => {
    render(
      <LibraryEmptyState
        variant="A"
        downloadsCount={5}
        onChangeFolder={onChangeFolder}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    );
    expect(onChangeFolder).toHaveBeenCalledTimes(1);
  });

  it("renders the footer label", () => {
    render(<LibraryEmptyState variant="A" downloadsCount={5} />);
    expect(
      screen.getByText(/tienes música en otra carpeta/i),
    ).toBeInTheDocument();
  });
});

describe("LibraryEmptyState — variant B (sincronización disponible)", () => {
  it("renders the title", () => {
    render(<LibraryEmptyState variant="B" downloadsCount={12} />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Sincronización disponible",
    );
  });

  it("renders plural description when count > 1", () => {
    render(<LibraryEmptyState variant="B" downloadsCount={12} />);
    expect(
      screen.getByText("Tienes 12 archivos nuevos en tu carpeta de Descargas."),
    ).toBeInTheDocument();
  });

  it("renders singular description when count is 1", () => {
    render(<LibraryEmptyState variant="B" downloadsCount={1} />);
    expect(
      screen.getByText("Tienes 1 archivo nuevo en tu carpeta de Descargas."),
    ).toBeInTheDocument();
  });

  it("renders the sync CTA button", () => {
    render(<LibraryEmptyState variant="B" downloadsCount={12} />);
    expect(
      screen.getByRole("button", { name: /sincronizar ahora/i }),
    ).toBeInTheDocument();
  });

  it("calls onSync when the sync button is clicked", () => {
    render(
      <LibraryEmptyState variant="B" downloadsCount={12} onSync={onSync} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /sincronizar ahora/i }));
    expect(onSync).toHaveBeenCalledTimes(1);
  });
});

describe("LibraryEmptyState — variant C (biblioteca al día)", () => {
  it("renders the title", () => {
    render(<LibraryEmptyState variant="C" />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Tu biblioteca está al día",
    );
  });

  it("renders the description", () => {
    render(<LibraryEmptyState variant="C" />);
    expect(
      screen.getByText("No hay archivos nuevos en tu carpeta de Descargas."),
    ).toBeInTheDocument();
  });

  it("renders the change folder button", () => {
    render(<LibraryEmptyState variant="C" />);
    expect(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    ).toBeInTheDocument();
  });

  it("calls onChangeFolder when the change folder button is clicked", () => {
    render(<LibraryEmptyState variant="C" onChangeFolder={onChangeFolder} />);
    fireEvent.click(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    );
    expect(onChangeFolder).toHaveBeenCalledTimes(1);
  });

  it("does not render a sync button", () => {
    render(<LibraryEmptyState variant="C" />);
    expect(
      screen.queryByRole("button", { name: /sincronizar ahora/i }),
    ).not.toBeInTheDocument();
  });
});

describe("LibraryEmptyState — variant D (ambas vacías)", () => {
  it("renders the title", () => {
    render(<LibraryEmptyState variant="D" />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Tu biblioteca está vacía",
    );
  });

  it("renders the description", () => {
    render(<LibraryEmptyState variant="D" />);
    expect(
      screen.getByText(
        "Agrega archivos a tu carpeta de Descargas para comenzar.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the downloads path when provided", () => {
    render(
      <LibraryEmptyState
        variant="D"
        downloadsPath="/Users/juan/Downloads/Música"
      />,
    );
    expect(
      screen.getByText("/Users/juan/Downloads/Música"),
    ).toBeInTheDocument();
  });

  it("does not render the downloads path when not provided", () => {
    render(<LibraryEmptyState variant="D" />);
    expect(screen.queryByText(/\/Users\//)).not.toBeInTheDocument();
  });

  it("renders the change folder button", () => {
    render(<LibraryEmptyState variant="D" />);
    expect(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    ).toBeInTheDocument();
  });

  it("calls onChangeFolder when the change folder button is clicked", () => {
    render(<LibraryEmptyState variant="D" onChangeFolder={onChangeFolder} />);
    fireEvent.click(
      screen.getByRole("button", { name: /cambiar carpeta de descargas/i }),
    );
    expect(onChangeFolder).toHaveBeenCalledTimes(1);
  });

  it("does not render a sync button", () => {
    render(<LibraryEmptyState variant="D" />);
    expect(
      screen.queryByRole("button", { name: /sincronizar ahora/i }),
    ).not.toBeInTheDocument();
  });
});
