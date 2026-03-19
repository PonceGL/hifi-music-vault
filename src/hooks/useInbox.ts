import { useState, useCallback } from 'react';
import { inboxApi } from '@/services/api';
import type { ScanResult } from '@/hooks/useMusicTable';

/**
 * Estado del hook useInbox
 */
interface UseInboxState {
    scanResults: ScanResult[];
    isScanning: boolean;
    isOrganizing: boolean;
    error: string | null;
}

/**
 * Valores retornados por useInbox
 */
interface UseInboxReturn extends UseInboxState {
    scanInbox: (inboxPath: string, libraryPath: string) => Promise<ScanResult[]>;
    organize: (libraryPath: string) => Promise<void>;
    clearResults: () => void;
    clearError: () => void;
}

/**
 * Hook para gestionar el estado y operaciones del Inbox
 * 
 * Responsabilidades:
 * - Escanear carpeta de inbox
 * - Organizar archivos (moverlos a library)
 * - Gestionar estados de loading y errores
 * 
 * @example
 * ```tsx
 * const { scanResults, isScanning, scanInbox, organize } = useInbox();
 * 
 * // Escanear inbox
 * await scanInbox('/downloads', '/library');
 * 
 * // Organizar archivos
 * await organize('/library');
 * ```
 */
export function useInbox(): UseInboxReturn {
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isOrganizing, setIsOrganizing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Escanea la carpeta de inbox
     * @returns Array de resultados del scan
     */
    const scanInbox = useCallback(async (inboxPath: string, libraryPath: string): Promise<ScanResult[]> => {
        if (!inboxPath || !libraryPath) {
            const errorMsg = 'Missing inbox or library path';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setIsScanning(true);
        setError(null);

        try {
            const results = await inboxApi.scan(inboxPath, libraryPath);
            setScanResults(results);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsScanning(false);
        }
    }, []);

    /**
     * Organiza los archivos escaneados (los mueve a la biblioteca)
     */
    const organize = useCallback(async (libraryPath: string): Promise<void> => {
        if (scanResults.length === 0) {
            const errorMsg = 'No files to organize';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        if (!libraryPath) {
            const errorMsg = 'Missing library path';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setIsOrganizing(true);
        setError(null);

        try {
            await inboxApi.organize(scanResults, libraryPath);
            // Clear results after successful organization
            setScanResults([]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setIsOrganizing(false);
        }
    }, [scanResults]);

    /**
     * Limpia los resultados del scan
     */
    const clearResults = useCallback(() => {
        setScanResults([]);
    }, []);

    /**
     * Limpia el error actual
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        scanResults,
        isScanning,
        isOrganizing,
        error,
        scanInbox,
        organize,
        clearResults,
        clearError,
    };
}