import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useInbox } from "@/hooks/useInbox";
import { inboxApi } from "@/services/api";

// Mock the API module
vi.mock("@/services/api", () => ({
  inboxApi: {
    scan: vi.fn(),
    organize: vi.fn(),
  },
}));

describe("useInbox hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_initialize_with_default_state", () => {
    // Arrange & Act
    const { result } = renderHook(() => useInbox());

    // Assert
    expect(result.current.scanResults).toEqual([]);
    expect(result.current.isScanning).toBe(false);
    expect(result.current.isOrganizing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe("scanInbox", () => {
    it("should_scan_successfully_and_update_state", async () => {
      // Arrange
      const mockResults = [
        { path: "/inbox/song1.mp3", metadata: { title: "Song 1" } } as any, // Cast to any to bypass exact interface match in tests
      ];
      vi.mocked(inboxApi.scan).mockResolvedValue(mockResults);
      const { result } = renderHook(() => useInbox());

      // Act
      let scanPromise: Promise<any>;
      act(() => {
        scanPromise = result.current.scanInbox("/inbox", "/library");
      });

      // Assert initial loading state
      expect(result.current.isScanning).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await scanPromise;
      });

      // Assert final state
      expect(inboxApi.scan).toHaveBeenCalledWith("/inbox", "/library");
      expect(result.current.isScanning).toBe(false);
      expect(result.current.scanResults).toEqual(mockResults);
      expect(result.current.error).toBeNull();
    });

    it("should_throw_error_when_paths_are_missing", async () => {
      // Arrange
      const { result } = renderHook(() => useInbox());

      // Act & Assert for missing inbox
      await act(async () => {
        await expect(result.current.scanInbox("", "/library")).rejects.toThrow("Missing inbox or library path");
      });
      expect(result.current.error).toBe("Missing inbox or library path");

      // Act & Assert for missing library
      await act(async () => {
        await expect(result.current.scanInbox("/inbox", "")).rejects.toThrow("Missing inbox or library path");
      });
      expect(result.current.error).toBe("Missing inbox or library path");
    });

    it("should_handle_api_errors_correctly", async () => {
      // Arrange
      const errorMessage = "Network error";
      vi.mocked(inboxApi.scan).mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useInbox());

      // Act & Assert
      await act(async () => {
        await expect(result.current.scanInbox("/inbox", "/library")).rejects.toThrow(errorMessage);
      });
      
      expect(result.current.isScanning).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe("organize", () => {
    it("should_organize_successfully_and_clear_results", async () => {
      // Arrange
      const mockResults = [
        { path: "/inbox/song1.mp3", metadata: { title: "Song 1" } } as any,
      ];
      vi.mocked(inboxApi.scan).mockResolvedValue(mockResults);
      vi.mocked(inboxApi.organize).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useInbox());
      
      // Populate results first
      await act(async () => {
        await result.current.scanInbox("/inbox", "/library");
      });

      // Act
      let organizePromise: Promise<any>;
      act(() => {
        organizePromise = result.current.organize("/library");
      });

      expect(result.current.isOrganizing).toBe(true);

      await act(async () => {
        await organizePromise;
      });

      // Assert
      expect(inboxApi.organize).toHaveBeenCalledWith(mockResults, "/library");
      expect(result.current.isOrganizing).toBe(false);
      expect(result.current.scanResults).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("should_throw_error_when_no_files_to_organize", async () => {
      // Arrange
      const { result } = renderHook(() => useInbox());

      // Act & Assert
      await act(async () => {
        await expect(result.current.organize("/library")).rejects.toThrow("No files to organize");
      });
      expect(result.current.error).toBe("No files to organize");
    });

    it("should_throw_error_when_library_path_is_missing", async () => {
      // Arrange
      const mockResults = [{ path: "/inbox/song1.mp3", metadata: {} } as any];
      vi.mocked(inboxApi.scan).mockResolvedValue(mockResults);
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.scanInbox("/inbox", "/library");
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.organize("")).rejects.toThrow("Missing library path");
      });
      expect(result.current.error).toBe("Missing library path");
    });

    it("should_handle_api_errors_during_organize", async () => {
      // Arrange
      const mockResults = [{ path: "/inbox/song1.mp3", metadata: {} } as any];
      const errorMessage = "Failed to write file";
      
      vi.mocked(inboxApi.scan).mockResolvedValue(mockResults);
      vi.mocked(inboxApi.organize).mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.scanInbox("/inbox", "/library");
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.organize("/library")).rejects.toThrow(errorMessage);
      });
      
      expect(result.current.isOrganizing).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.scanResults).toEqual(mockResults); // Results shouldn't clear on error
    });
  });

  describe("clearResults and clearError", () => {
    it("should_clear_scan_results", async () => {
      // Arrange
      const mockResults = [{ path: "/inbox/song1.mp3", metadata: {} } as any];
      vi.mocked(inboxApi.scan).mockResolvedValue(mockResults);
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.scanInbox("/inbox", "/library");
      });

      expect(result.current.scanResults).toEqual(mockResults);

      // Act
      act(() => {
        result.current.clearResults();
      });

      // Assert
      expect(result.current.scanResults).toEqual([]);
    });

    it("should_clear_error", async () => {
      // Arrange
      const { result } = renderHook(() => useInbox());

      // Trigger an error
      await act(async () => {
        await expect(result.current.scanInbox("", "")).rejects.toThrow();
      });
      expect(result.current.error).not.toBeNull();

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });
});
