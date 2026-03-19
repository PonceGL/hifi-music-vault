import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/constants/app';
import type { SongMetadata } from '@/hooks/useMusicTable';
import type {
    RegenerateLibraryBody,
    SyncAppleMusicBody,
    ExportLibraryBody
} from './types';

/**
 * Respuesta del endpoint de library
 */
interface LibraryResponse {
    inventory: SongMetadata[];
}

/**
 * Respuesta de regeneración de base de datos
 */
interface RegenerateResponse {
    success: boolean;
    message: string;
    tracksProcessed?: number;
    playlistsGenerated?: number;
}

/**
 * Respuesta de sincronización con Apple Music
 */
interface SyncAppleMusicResponse {
    success: boolean;
    message: string;
}

/**
 * Respuesta de exportación
 */
interface ExportResponse {
    success: boolean;
    successCount?: number;
    failedCount?: number;
}

/**
 * Servicio para gestión de la Biblioteca
 * Maneja la obtención, regeneración, exportación y sincronización
 */
export const libraryApi = {
    /**
     * Obtiene el inventario completo de la biblioteca
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @returns Lista de canciones en la biblioteca
     */
    fetch: async (libraryPath: string): Promise<SongMetadata[]> => {
        const response = await apiClient.get<LibraryResponse>(API_ENDPOINTS.LIBRARY, {
            params: { libraryPath },
        });

        return response.inventory;
    },

    /**
     * Regenera la base de datos escaneando todos los archivos
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    regenerate: async (libraryPath: string): Promise<RegenerateResponse> => {
        const body: RegenerateLibraryBody = { libraryPath };
        return apiClient.post<RegenerateResponse>(API_ENDPOINTS.LIBRARY_REGENERATE, body);
    },

    /**
     * Sincroniza playlists con Apple Music
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    syncAppleMusic: async (libraryPath: string): Promise<SyncAppleMusicResponse> => {
        const body: SyncAppleMusicBody = { libraryPath };
        return apiClient.post<SyncAppleMusicResponse>(API_ENDPOINTS.LIBRARY_SYNC_APPLE_MUSIC, body);
    },

    /**
     * Exporta la biblioteca completa a otra ubicación
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @param destination - Ruta de destino
     * @param mode - 'copy' o 'move'
     * @param preserveStructure - Si mantener la estructura de carpetas
     */
    export: async (
        libraryPath: string,
        destination: string,
        mode: 'copy' | 'move',
        preserveStructure: boolean
    ): Promise<ExportResponse> => {
        const body: ExportLibraryBody = {
            libraryPath,
            destination,
            mode,
            preserveStructure,
        };
        return apiClient.post<ExportResponse>(API_ENDPOINTS.LIBRARY_EXPORT, body);
    },
};