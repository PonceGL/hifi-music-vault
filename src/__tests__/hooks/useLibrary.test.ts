import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLibrary } from '@/hooks/useLibrary';
import { libraryApi, utilsApi } from '@/services/api';
import type { SongMetadata } from '@/hooks/useMusicTable';

vi.mock('@/services/api', () => ({
  libraryApi: {
    fetch: vi.fn(),
    regenerate: vi.fn(),
    syncAppleMusic: vi.fn(),
    export: vi.fn(),
  },
  utilsApi: {
    reveal: vi.fn(),
  },
}));

describe('useLibrary hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock console.log/error to keep test output clean
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should_initialize_with_default_state', () => {
        const { result } = renderHook(() => useLibrary());

        expect(result.current.libraryFiles).toEqual([]);
        expect(result.current.isLoadingLibrary).toBe(false);
        expect(result.current.isRegenerating).toBe(false);
        expect(result.current.isSyncingAppleMusic).toBe(false);
        expect(result.current.error).toBeNull();
    });

    describe('fetchLibrary', () => {
        it('should_fetch_successfully_and_update_state', async () => {
            const mockInventory: SongMetadata[] = [
                { absPath: '/lib/song1.mp3', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', durationMs: 1000 } as unknown as SongMetadata
            ];
            vi.mocked(libraryApi.fetch).mockResolvedValue(mockInventory);
            
            const { result } = renderHook(() => useLibrary());

            let fetchPromise: Promise<any>;
            act(() => {
                fetchPromise = result.current.fetchLibrary('/lib');
            });

            expect(result.current.isLoadingLibrary).toBe(true);
            expect(result.current.error).toBeNull();

            await act(async () => {
                await fetchPromise;
            });

            expect(libraryApi.fetch).toHaveBeenCalledWith('/lib');
            expect(result.current.isLoadingLibrary).toBe(false);
            expect(result.current.libraryFiles).toHaveLength(1);
            expect(result.current.libraryFiles[0].file).toBe('/lib/song1.mp3');
            expect(result.current.libraryFiles[0].metadata).toEqual(mockInventory[0]);
            expect(result.current.error).toBeNull();
        });

        it('should_throw_error_when_library_path_is_missing', async () => {
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.fetchLibrary('')).rejects.toThrow('Missing library path');
            });
            expect(result.current.error).toBe('Missing library path');
        });

        it('should_handle_api_errors_correctly', async () => {
            const errorMessage = 'Network error';
            vi.mocked(libraryApi.fetch).mockRejectedValue(new Error(errorMessage));
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.fetchLibrary('/lib')).rejects.toThrow(errorMessage);
            });
            
            expect(result.current.isLoadingLibrary).toBe(false);
            expect(result.current.error).toBe(errorMessage);
        });
    });

    describe('regenerateDatabase', () => {
        it('should_regenerate_successfully_and_fetch_library', async () => {
            vi.mocked(libraryApi.regenerate).mockResolvedValue({ success: true } as any);
            vi.mocked(libraryApi.fetch).mockResolvedValue([]);
            
            const { result } = renderHook(() => useLibrary());

            let regenPromise: Promise<any>;
            act(() => {
                regenPromise = result.current.regenerateDatabase('/lib');
            });

            expect(result.current.isRegenerating).toBe(true);

            await act(async () => {
                await regenPromise;
            });

            expect(libraryApi.regenerate).toHaveBeenCalledWith('/lib');
            expect(libraryApi.fetch).toHaveBeenCalledWith('/lib');
            expect(result.current.isRegenerating).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should_throw_error_when_library_path_is_missing', async () => {
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.regenerateDatabase('')).rejects.toThrow('Missing library path');
            });
            expect(result.current.error).toBe('Missing library path');
        });

        it('should_handle_api_errors_correctly', async () => {
            const errorMessage = 'Database error';
            vi.mocked(libraryApi.regenerate).mockRejectedValue(new Error(errorMessage));
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.regenerateDatabase('/lib')).rejects.toThrow(errorMessage);
            });
            
            expect(result.current.isRegenerating).toBe(false);
            expect(result.current.error).toBe(errorMessage);
        });
    });

    describe('syncAppleMusic', () => {
        it('should_sync_successfully', async () => {
            vi.mocked(libraryApi.syncAppleMusic).mockResolvedValue({ success: true } as any);
            
            const { result } = renderHook(() => useLibrary());

            let syncPromise: Promise<any>;
            act(() => {
                syncPromise = result.current.syncAppleMusic('/lib');
            });

            expect(result.current.isSyncingAppleMusic).toBe(true);

            await act(async () => {
                await syncPromise;
            });

            expect(libraryApi.syncAppleMusic).toHaveBeenCalledWith('/lib');
            expect(result.current.isSyncingAppleMusic).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should_throw_error_when_library_path_is_missing', async () => {
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.syncAppleMusic('')).rejects.toThrow('Missing library path');
            });
            expect(result.current.error).toBe('Missing library path');
        });

        it('should_handle_api_errors_correctly', async () => {
            const errorMessage = 'Sync failed';
            vi.mocked(libraryApi.syncAppleMusic).mockRejectedValue(new Error(errorMessage));
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.syncAppleMusic('/lib')).rejects.toThrow(errorMessage);
            });
            
            expect(result.current.isSyncingAppleMusic).toBe(false);
            expect(result.current.error).toBe(errorMessage);
        });
    });

    describe('exportLibrary', () => {
        it('should_export_successfully_and_fetch_if_move_mode', async () => {
            vi.mocked(libraryApi.export).mockResolvedValue({ success: true } as any);
            vi.mocked(libraryApi.fetch).mockResolvedValue([]);
            
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await result.current.exportLibrary('/lib', '/dest', 'move', true);
            });

            expect(libraryApi.export).toHaveBeenCalledWith('/lib', '/dest', 'move', true);
            expect(libraryApi.fetch).toHaveBeenCalledWith('/lib');
            expect(result.current.error).toBeNull();
        });

        it('should_export_successfully_without_fetch_if_copy_mode', async () => {
            vi.mocked(libraryApi.export).mockResolvedValue({ success: true } as any);
            
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await result.current.exportLibrary('/lib', '/dest', 'copy', false);
            });

            expect(libraryApi.export).toHaveBeenCalledWith('/lib', '/dest', 'copy', false);
            expect(libraryApi.fetch).not.toHaveBeenCalled();
            expect(result.current.error).toBeNull();
        });

        it('should_throw_error_when_paths_are_missing', async () => {
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.exportLibrary('', '/dest', 'copy', false)).rejects.toThrow('Missing library path or destination');
            });
            expect(result.current.error).toBe('Missing library path or destination');

            await act(async () => {
                await expect(result.current.exportLibrary('/lib', '', 'copy', false)).rejects.toThrow('Missing library path or destination');
            });
        });

        it('should_handle_api_errors_correctly', async () => {
            const errorMessage = 'Export failed';
            vi.mocked(libraryApi.export).mockRejectedValue(new Error(errorMessage));
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.exportLibrary('/lib', '/dest', 'copy', false)).rejects.toThrow(errorMessage);
            });
            
            expect(result.current.error).toBe(errorMessage);
        });
    });

    describe('revealFile', () => {
        it('should_reveal_file_successfully', async () => {
            vi.mocked(utilsApi.reveal).mockResolvedValue(undefined);
            
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await result.current.revealFile('/lib/song1.mp3');
            });

            expect(utilsApi.reveal).toHaveBeenCalledWith('/lib/song1.mp3');
            expect(result.current.error).toBeNull(); // Shouldn't set error
        });

        it('should_handle_errors_silently', async () => {
            vi.mocked(utilsApi.reveal).mockRejectedValue(new Error('Reveal failed'));
            
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await result.current.revealFile('/lib/song1.mp3');
            });

            expect(utilsApi.reveal).toHaveBeenCalledWith('/lib/song1.mp3');
            expect(result.current.error).toBeNull(); // Should catch silently without setting error state
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('clearError', () => {
        it('should_clear_error', async () => {
            const { result } = renderHook(() => useLibrary());

            await act(async () => {
                await expect(result.current.fetchLibrary('')).rejects.toThrow();
            });
            expect(result.current.error).not.toBeNull();

            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBeNull();
        });
    });
});
