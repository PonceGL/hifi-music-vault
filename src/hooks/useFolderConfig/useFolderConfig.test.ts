import { act, renderHook } from "@testing-library/react";
import { useFolderConfig } from "./index";

jest.mock("@/lib/validate-folder-path", () => ({
  validateFolderPath: jest.fn(),
}));

import { validateFolderPath } from "@/lib/validate-folder-path";
const mockValidateFolderPath = validateFolderPath as jest.Mock;

const messages = {
  sameFolderError: "Las carpetas no pueden ser la misma ruta",
  libraryInsideDownloadsError:
    "La Biblioteca no puede ser una subcarpeta de Descargas",
  noWritePermissionError: "Sin permisos de escritura",
  validSuccess: "Carpeta válida",
};

describe("useFolderConfig", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with both fields idle", () => {
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );
    expect(result.current.downloads.state).toBe("idle");
    expect(result.current.library.state).toBe("idle");
    expect(result.current.bothValid).toBe(false);
  });

  it("sets loading state immediately on folder select", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      valid: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    void act(() => {
      void result.current.handleDownloadsSelect("/downloads");
    });

    expect(result.current.downloads.state).toBe("loading");
  });

  it("sets valid state after successful API validation", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      valid: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });

    expect(result.current.downloads.state).toBe("valid");
    expect(result.current.downloads.path).toBe("/downloads");
    expect(result.current.downloads.message).toBe(messages.validSuccess);
  });

  it("sets error when API returns invalid", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      valid: false,
      writable: false,
    });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/no-access");
    });

    expect(result.current.downloads.state).toBe("error");
    expect(result.current.downloads.message).toBe(messages.noWritePermissionError);
  });

  it("returns sameFolderError when both paths are identical", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      valid: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/music");
    });

    await act(async () => {
      await result.current.handleLibrarySelect("/music");
    });

    expect(result.current.library.state).toBe("error");
    expect(result.current.library.message).toBe(messages.sameFolderError);
  });

  it("returns libraryInsideDownloadsError when library is inside downloads", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      valid: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });

    await act(async () => {
      await result.current.handleLibrarySelect("/downloads/library");
    });

    expect(result.current.library.state).toBe("error");
    expect(result.current.library.message).toBe(
      messages.libraryInsideDownloadsError
    );
  });

  it("bothValid is true only when both fields are valid", async () => {
    mockValidateFolderPath.mockResolvedValue({ valid: true, writable: true });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });
    expect(result.current.bothValid).toBe(false);

    await act(async () => {
      await result.current.handleLibrarySelect("/library");
    });
    expect(result.current.bothValid).toBe(true);
  });

  it("handleSubmit calls onSubmit with both paths when bothValid", async () => {
    mockValidateFolderPath.mockResolvedValue({ valid: true, writable: true });
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });
    await act(async () => {
      await result.current.handleLibrarySelect("/library");
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      downloadsPath: "/downloads",
      libraryPath: "/library",
    });
  });

  it("handleSubmit does nothing when not bothValid", () => {
    const { result } = renderHook(() =>
      useFolderConfig(onSubmit, messages)
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
