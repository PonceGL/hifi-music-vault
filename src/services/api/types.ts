/**
 * Tipos específicos para request bodies de la API
 * 
 * Estos tipos documentan exactamente qué datos espera cada endpoint,
 * mejorando la type-safety y facilitando el testing.
 */

import type { ScanResult } from '@/hooks/useMusicTable';

/**
 * Body para scan de inbox
 */
export interface ScanRequestBody {
    inboxPath: string;
    libraryPath: string;
}

/**
 * Body para organizar archivos
 */
export interface OrganizeRequestBody {
    results: ScanResult[];
    libraryPath: string;
}

/**
 * Body para regenerar base de datos
 */
export interface RegenerateLibraryBody {
    libraryPath: string;
}

/**
 * Body para sincronizar con Apple Music
 */
export interface SyncAppleMusicBody {
    libraryPath: string;
}

/**
 * Body para exportar biblioteca
 */
export interface ExportLibraryBody {
    libraryPath: string;
    destination: string;
    mode: 'copy' | 'move';
    preserveStructure: boolean;
}

/**
 * Body para agregar tracks a playlist
 */
export interface AddTracksToPlaylistBody {
    libraryPath: string;
    name: string;
    tracks: string[];
}

/**
 * Body para remover track de playlist
 */
export interface RemoveTrackFromPlaylistBody {
    libraryPath: string;
    trackPath: string;
}

/**
 * Body para exportar playlist
 */
export interface ExportPlaylistBody {
    libraryPath: string;
    destination: string;
    mode: 'copy' | 'move';
    preserveStructure: boolean;
}

/**
 * Body para guardar configuración
 */
export interface SaveConfigBody {
    inboxPath: string;
    libraryPath: string;
}

/**
 * Body para revelar archivo en explorador
 */
export interface RevealFileBody {
    path: string;
}

/**
 * Type union de todos los posibles request bodies
 * Útil para validaciones genéricas
 */
export type ApiRequestBody =
    | ScanRequestBody
    | OrganizeRequestBody
    | RegenerateLibraryBody
    | SyncAppleMusicBody
    | ExportLibraryBody
    | AddTracksToPlaylistBody
    | RemoveTrackFromPlaylistBody
    | ExportPlaylistBody
    | SaveConfigBody
    | RevealFileBody;