/**
 * Constantes compartidas para el frontend
 * Centraliza magic strings y valores de configuración
 */

import { Library, ListMusic, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Modos de vista disponibles en la aplicación
 * @deprecated Estos serán eliminados cuando InboxPage esté completamente separada
 */
export const VIEW_MODES = {
    INBOX: "inbox",
    LIBRARY: "library",
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

/**
 * Rutas principales de la aplicación
 */
export const ROUTES = {
    HOME: "/",
    INBOX: "/inbox",
    LIBRARY: "/library",
    PLAYLISTS: "/playlists",
    PLAYLIST_DETAIL: "/playlists/:name",
    TRACK_DETAIL: "/track/:trackPath",
    SETTINGS: "/settings",
} as const;

/**
 * Configuración de navegación
 * Define los elementos que aparecen en el menú principal
 */
export interface NavItem {
    name: string;
    path: string;
    icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
    { name: "Biblioteca", path: ROUTES.HOME, icon: Library },
    { name: "Playlists", path: ROUTES.PLAYLISTS, icon: ListMusic },
    { name: "Ajustes", path: ROUTES.SETTINGS, icon: Settings },
];

/**
 * URL base de la API
 * Obtiene el valor desde variables de entorno o usa localhost por defecto
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
    // Inbox
    SCAN: "/api/scan",
    ORGANIZE: "/api/organize",

    // Library
    LIBRARY: "/api/library",
    LIBRARY_EXPORT: "/api/library/export",
    LIBRARY_REGENERATE: "/api/library/regenerate",
    LIBRARY_SYNC_APPLE_MUSIC: "/api/library/sync-apple-music",

    // Playlists
    PLAYLISTS: "/api/playlists",
    PLAYLIST_DETAIL: (name: string) => `/api/playlists/${encodeURIComponent(name)}`,
    PLAYLIST_TRACKS: (name: string) => `/api/playlists/${encodeURIComponent(name)}/tracks`,
    PLAYLIST_EXPORT: (name: string) => `/api/playlists/${encodeURIComponent(name)}/export`,

    // Tracks
    TRACK_METADATA: "/api/tracks/metadata",
    TRACK_COVER: "/api/tracks/cover",
    TRACK_PLAYLISTS: "/api/tracks/playlists",

    // Utilities
    BROWSE: "/api/browse",
    CONFIG: "/api/config",
    REVEAL: "/api/reveal",

    // MusicBrainz
    MUSICBRAINZ_SEARCH: "/api/musicbrainz/search",
    MUSICBRAINZ_LOOKUP: "/api/musicbrainz/lookup",
} as const;

/**
 * Mensajes de error comunes del frontend
 */
export const ERROR_MESSAGES = {
    MISSING_CONFIG: "Missing inbox or library path configuration",
    SCAN_FAILED: "Failed to scan inbox",
    ORGANIZE_FAILED: "Failed to organize files",
    LIBRARY_FETCH_FAILED: "Failed to fetch library",
    PLAYLIST_CREATE_FAILED: "Failed to create playlist",
    PLAYLIST_DELETE_FAILED: "Failed to delete playlist",
    NETWORK_ERROR: "Network error. Please check your connection.",
} as const;

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
    ORGANIZE_COMPLETE: "Files organized successfully",
    PLAYLIST_CREATED: "Playlist created successfully",
    PLAYLIST_DELETED: "Playlist deleted successfully",
    EXPORT_COMPLETE: "Export completed successfully",
} as const;

/**
 * Configuración de UI
 */
export const UI_CONFIG = {
    MAX_TOOLBAR_ACTIONS: 3, // Máximo de acciones visibles en toolbar mobile
    DEBOUNCE_DELAY: 300, // ms para debounce en búsquedas
    TOAST_DURATION: 3000, // ms para notificaciones
} as const;