import { act, renderHook } from "@testing-library/react";
import { useFolderConfig } from "./index";
import { validateFolderPath } from "@/lib/validateFolderPath";
import { ONBOARDING_STRINGS } from "@/components/features/onboarding/constants";

jest.mock("@/lib/validateFolderPath", () => ({
  validateFolderPath: jest.fn(),
}));

const mockValidateFolderPath = validateFolderPath as jest.Mock;

const messages = ONBOARDING_STRINGS.validation;

describe("useFolderConfig", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with both fields idle", () => {
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));
    expect(result.current.downloads.state).toBe("idle");
    expect(result.current.library.state).toBe("idle");
    expect(result.current.bothValid).toBe(false);
  });

  it("sets loading state immediately on folder select", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    void act(() => {
      void result.current.handleDownloadsSelect("/downloads");
    });

    expect(result.current.downloads.state).toBe("loading");
  });

  it("sets valid state after successful API validation", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });

    expect(result.current.downloads.state).toBe("valid");
    expect(result.current.downloads.path).toBe("/downloads");
    expect(result.current.downloads.message).toBe(messages.validSuccess);
  });

  it("sets error when API returns invalid", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: true,
      hasPermissions: false,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleDownloadsSelect("/no-access");
    });

    expect(result.current.downloads.state).toBe("error");
    expect(result.current.downloads.message).toBe(
      messages.noWritePermissionError,
    );
  });

  it("sets error when API returns not found", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: false,
      isDirectory: false,
      hasPermissions: false,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleDownloadsSelect("/not-exists");
    });

    expect(result.current.downloads.state).toBe("error");
    expect(result.current.downloads.message).toBe(messages.notFoundError);
  });

  it("sets error when API returns not a directory", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: false,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleDownloadsSelect("/file.txt");
    });

    expect(result.current.downloads.state).toBe("error");
    expect(result.current.downloads.message).toBe(messages.notADirectoryError);
  });

  it("returns sameFolderError when both paths are identical", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

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
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleDownloadsSelect("/downloads");
    });

    await act(async () => {
      await result.current.handleLibrarySelect("/downloads/library");
    });

    expect(result.current.library.state).toBe("error");
    expect(result.current.library.message).toBe(
      messages.libraryInsideDownloadsError,
    );
  });

  it("returns downloadsInsideLibraryError when downloads is inside library", async () => {
    mockValidateFolderPath.mockResolvedValueOnce({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    await act(async () => {
      await result.current.handleLibrarySelect("/library");
    });

    await act(async () => {
      await result.current.handleDownloadsSelect("/library/downloads");
    });

    expect(result.current.downloads.state).toBe("error");
    expect(result.current.downloads.message).toBe(
      messages.downloadsInsideLibraryError,
    );
  });

  it("bothValid is true only when both fields are valid", async () => {
    mockValidateFolderPath.mockResolvedValue({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

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
    mockValidateFolderPath.mockResolvedValue({
      exists: true,
      isDirectory: true,
      hasPermissions: true,
    });
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

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
    const { result } = renderHook(() => useFolderConfig(onSubmit, messages));

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
