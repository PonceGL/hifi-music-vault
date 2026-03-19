/**
 * Servicios API del Frontend
 * 
 * Capa de abstracción para todas las llamadas HTTP a la API.
 * Organizado por dominio para facilitar el mantenimiento.
 * 
 * Uso:
 * ```ts
 * import { inboxApi, libraryApi, playlistApi } from '@/services/api';
 * 
 * const results = await inboxApi.scan(inboxPath, libraryPath);
 * const tracks = await libraryApi.fetch(libraryPath);
 * ```
 */

export { apiClient, ApiError } from './client';
export { inboxApi } from './inboxApi';
export { libraryApi } from './libraryApi';
export { playlistApi } from './playlistApi';
export { utilsApi } from './utilsApi';

// Re-export tipos útiles
export type { Playlist } from './playlistApi';
export type { AppConfig, DirectoryEntry } from './utilsApi';

// Re-export tipos de request bodies para testing
export type {
    ScanRequestBody,
    OrganizeRequestBody,
    RegenerateLibraryBody,
    SyncAppleMusicBody,
    ExportLibraryBody,
    AddTracksToPlaylistBody,
    RemoveTrackFromPlaylistBody,
    ExportPlaylistBody,
    SaveConfigBody,
    RevealFileBody,
    ApiRequestBody,
} from './types';