import { useState, useCallback } from 'react';
import { libraryApi, utilsApi } from '@/services/api';
import type { ScanResult, SongMetadata } from '@/hooks/useMusicTable';

/**
 * Estado del hook useLibrary
 */
interface UseLibraryState {
    libraryFiles: ScanResult[];
    isLoadingLibrary: boolean;
    isRegenerating: boolean;
    isSyncingAppleMusic: boolean;
    error: string | null;
}

/**
 * Valores retornados por useLibrary
 */
interface UseLibraryReturn extends UseLibraryState {
    fetchLibrary: (libraryPath: string) => Promise<ScanResult[]>;
    regenerateDatabase: (libraryPath: string) => Promise<void>;
    syncAppleMusic: (libraryPath: string) => Promise<void>;
    exportLibrary: (
        libraryPath: string,
        destination: string,
        mode: 'copy' | 'move',
        preserveStructure: boolean
    ) => Promise<void>;
    revealFile: (filePath: string) => Promise<void>;
    clearError: () => void;
}

/**
 * Hook para gestionar el estado y operaciones de la Biblioteca
 * 
 * Responsabilidades:
 * - Cargar inventario de la biblioteca
 * - Regenerar base de datos
 * - Sincronizar con Apple Music
 * - Exportar biblioteca
 * - Revelar archivos en el explorador
 * 
 * @example
 * ```tsx
 * const { libraryFiles, isLoadingLibrary, fetchLibrary, regenerateDatabase } = useLibrary();
 * 
 * // Cargar biblioteca
 * await fetchLibrary('/library');
 * 
 * // Regenerar DB
 * await regenerateDatabase('/library');
 * ```
 */
export function useLibrary(): UseLibraryReturn {
    const [libraryFiles, setLibraryFiles] = useState<ScanResult[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSyncingAppleMusic, setIsSyncingAppleMusic] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtiene el inventario de la biblioteca
     * @returns Array de archivos en la biblioteca
     */
    const fetchLibrary = useCallback(async (libraryPath: string): Promise<ScanResult[]> => {
        if (!libraryPath) {
            const errorMsg = 'Missing library path';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setIsLoadingLibrary(true);
        setError(null);

        try {
            const inventory = await libraryApi.fetch(libraryPath);

            // Adapt SongMetadata to ScanResult for consistency
            const adapted: ScanResult[] = inventory.map((song: SongMetadata) => ({
                file: song.absPath,
                metadata: song,
                proposedPath: song.absPath,
                playlists: song.playlists || [],
            }));

            setLibraryFiles(adapted);
            return adapted;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoadingLibrary(false);
        }
    }, []);

    /**
     * Regenera la base de datos escaneando todos los archivos
     */
    const regenerateDatabase = useCallback(async (libraryPath: string): Promise<void> => {
        if (!libraryPath) {
            const errorMsg = 'Missing library path';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setIsRegenerating(true);
        setError(null);

        try {
            const result = await libraryApi.regenerate(libraryPath);
            console.log('Regenerate Result:', result);

            // Refresh library after regeneration
            await fetchLibrary(libraryPath);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsRegenerating(false);
        }
    }, [fetchLibrary]);

    /**
     * Sincroniza playlists con Apple Music
     */
    const syncAppleMusic = useCallback(async (libraryPath: string): Promise<void> => {
        if (!libraryPath) {
            const errorMsg = 'Missing library path';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setIsSyncingAppleMusic(true);
        setError(null);

        try {
            const result = await libraryApi.syncAppleMusic(libraryPath);
            console.log('Apple Music Sync Result:', result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsSyncingAppleMusic(false);
        }
    }, []);

    /**
     * Exporta la biblioteca a otra ubicación
     */
    const exportLibrary = useCallback(async (
        libraryPath: string,
        destination: string,
        mode: 'copy' | 'move',
        preserveStructure: boolean
    ): Promise<void> => {
        if (!libraryPath || !destination) {
            const errorMsg = 'Missing library path or destination';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setError(null);

        try {
            const result = await libraryApi.export(libraryPath, destination, mode, preserveStructure);
            console.log('Export Result:', result);

            // If moved, refresh library
            if (mode === 'move') {
                await fetchLibrary(libraryPath);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, [fetchLibrary]);

    /**
     * Revela un archivo en el explorador del sistema
     */
    const revealFile = useCallback(async (filePath: string): Promise<void> => {
        try {
            await utilsApi.reveal(filePath);
        } catch (err) {
            console.error('Failed to reveal file:', err);
            // No seteamos error en el estado para esta operación
            // ya que es secundaria y no debe bloquear la UI
        }
    }, []);

    /**
     * Limpia el error actual
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        libraryFiles,
        isLoadingLibrary,
        isRegenerating,
        isSyncingAppleMusic,
        error,
        fetchLibrary,
        regenerateDatabase,
        syncAppleMusic,
        exportLibrary,
        revealFile,
        clearError,
    };
}