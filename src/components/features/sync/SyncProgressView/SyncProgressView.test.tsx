import { fireEvent, render, screen } from "@testing-library/react";
import { SyncProgressView } from "./index";

const startSync = jest.fn();
const clearOperation = jest.fn();

jest.mock("@/store/useOperationStore", () => ({
  useOperationStore: jest.fn(() => ({ startSync, clearOperation })),
}));

const onCancel = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SyncProgressView — renderizado", () => {
  it("renders the title", () => {
    render(<SyncProgressView progress={65} />);
    expect(
      screen.getByText("Organizando tu biblioteca..."),
    ).toBeInTheDocument();
  });

  it("renders the progress percentage", () => {
    render(<SyncProgressView progress={65} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("renders the general warning text", () => {
    render(<SyncProgressView progress={30} />);
    expect(
      screen.getByText(/no cierres la app ni apagues el equipo/i),
    ).toBeInTheDocument();
  });

  it("renders a status region accessible to screen readers", () => {
    render(<SyncProgressView progress={50} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("SyncProgressView — store", () => {
  it("calls startSync on mount", () => {
    render(<SyncProgressView progress={50} />);
    expect(startSync).toHaveBeenCalledTimes(1);
  });

  it("calls clearOperation on unmount", () => {
    const { unmount } = render(<SyncProgressView progress={50} />);
    unmount();
    expect(clearOperation).toHaveBeenCalledTimes(1);
  });
});

describe("SyncProgressView — advertencia de disco externo", () => {
  it("shows the external drive warning when isExternalDrive is true", () => {
    render(<SyncProgressView progress={40} isExternalDrive />);
    expect(
      screen.getByText(/no desconectes el almacenamiento externo/i),
    ).toBeInTheDocument();
  });

  it("hides the external drive warning by default", () => {
    render(<SyncProgressView progress={40} />);
    expect(
      screen.queryByText(/no desconectes el almacenamiento externo/i),
    ).not.toBeInTheDocument();
  });

  it("hides the external drive warning when isExternalDrive is false", () => {
    render(<SyncProgressView progress={40} isExternalDrive={false} />);
    expect(
      screen.queryByText(/no desconectes el almacenamiento externo/i),
    ).not.toBeInTheDocument();
  });
});

describe("SyncProgressView — botón cancelar", () => {
  it("renders the cancel button when onCancel is provided", () => {
    render(<SyncProgressView progress={50} onCancel={onCancel} />);
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("does not render the cancel button when onCancel is not provided", () => {
    render(<SyncProgressView progress={50} />);
    expect(
      screen.queryByRole("button", { name: /cancelar/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onCancel when the cancel button is clicked", () => {
    render(<SyncProgressView progress={50} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("SyncProgressView — beforeunload", () => {
  it("registers a beforeunload handler on mount", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    render(<SyncProgressView progress={50} />);
    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    addSpy.mockRestore();
  });

  it("removes the beforeunload handler on unmount", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<SyncProgressView progress={50} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
    removeSpy.mockRestore();
  });
});
