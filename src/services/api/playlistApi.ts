import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/constants/app';
import type { SongMetadata } from '@/hooks/useMusicTable';
import type {
    AddTracksToPlaylistBody,
    RemoveTrackFromPlaylistBody,
    ExportPlaylistBody
} from './types';

/**
 * Información de una playlist
 */
export interface Playlist {
    name: string;
    count: number;
    path: string;
}

/**
 * Respuesta de listado de playlists
 */
interface PlaylistsResponse {
    playlists: Playlist[];
}

/**
 * Respuesta de detalles de playlist
 */
interface PlaylistDetailResponse {
    tracks: SongMetadata[];
}

/**
 * Respuesta de operaciones exitosas
 */
interface SuccessResponse {
    success: boolean;
}

/**
 * Respuesta de exportación de playlist
 */
interface ExportPlaylistResponse {
    success: boolean;
    successCount?: number;
    failedCount?: number;
}

/**
 * Servicio para gestión de Playlists
 * Maneja CRUD de playlists y operaciones relacionadas
 */
export const playlistApi = {
    /**
     * Obtiene la lista de todas las playlists
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @returns Lista de playlists con nombre, cantidad de tracks y ruta
     */
    list: async (libraryPath: string): Promise<Playlist[]> => {
        const response = await apiClient.get<PlaylistsResponse>(API_ENDPOINTS.PLAYLISTS, {
            params: { libraryPath },
        });

        return response.playlists;
    },

    /**
     * Obtiene los detalles de una playlist específica
     * @param name - Nombre de la playlist
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @returns Lista de tracks en la playlist
     */
    getDetails: async (name: string, libraryPath: string): Promise<SongMetadata[]> => {
        const response = await apiClient.get<PlaylistDetailResponse>(
            API_ENDPOINTS.PLAYLIST_DETAIL(name),
            { params: { libraryPath } }
        );

        return response.tracks;
    },

    /**
     * Crea una nueva playlist o agrega tracks a una existente
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @param name - Nombre de la playlist
     * @param tracks - Array de rutas de archivos a agregar
     */
    addTracks: async (libraryPath: string, name: string, tracks: string[]): Promise<void> => {
        const body: AddTracksToPlaylistBody = { libraryPath, name, tracks };
        await apiClient.post<SuccessResponse>(API_ENDPOINTS.PLAYLISTS, body);
    },

    /**
     * Elimina un track de una playlist
     * @param name - Nombre de la playlist
     * @param trackPath - Ruta del track a eliminar
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    removeTrack: async (name: string, trackPath: string, libraryPath: string): Promise<void> => {
        const body: RemoveTrackFromPlaylistBody = { libraryPath, trackPath };
        await apiClient.delete<SuccessResponse>(
            API_ENDPOINTS.PLAYLIST_TRACKS(name),
            body
        );
    },

    /**
     * Elimina una playlist completa
     * @param name - Nombre de la playlist
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    delete: async (name: string, libraryPath: string): Promise<void> => {
        await apiClient.delete<SuccessResponse>(API_ENDPOINTS.PLAYLIST_DETAIL(name), {
            params: { libraryPath },
        });
    },

    /**
     * Exporta una playlist a otra ubicación
     * @param name - Nombre de la playlist
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @param destination - Ruta de destino
     * @param mode - 'copy' o 'move'
     * @param preserveStructure - Si mantener la estructura de carpetas
     */
    export: async (
        name: string,
        libraryPath: string,
        destination: string,
        mode: 'copy' | 'move',
        preserveStructure: boolean
    ): Promise<ExportPlaylistResponse> => {
        const body: ExportPlaylistBody = {
            libraryPath,
            destination,
            mode,
            preserveStructure,
        };
        return apiClient.post<ExportPlaylistResponse>(API_ENDPOINTS.PLAYLIST_EXPORT(name), body);
    },
};