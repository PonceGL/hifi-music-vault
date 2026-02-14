/**
 * Constantes compartidas para servicios de organización y sincronización de música
 * Centraliza magic strings y valores de configuración para evitar duplicación
 */

/**
 * Constantes relacionadas con archivos y directorios
 */
export const FILE_CONSTANTS = {
  LIBRARY_DB_FILE: "library_db.json",
  PLAYLISTS_DIR: "Playlists",
  TEMP_SYNC_SCRIPT: "temp_sync_script.js",
} as const;

/**
 * Constantes relacionadas con extensiones de archivos
 */
export const FILE_EXTENSIONS = {
  PLAYLIST_PRIMARY: ".m3u8",
  PLAYLIST_LEGACY: ".m3u",
  FLAC: ".flac",
  MP3: ".mp3",
  M4A: ".m4a",
  WAV: ".wav",
  OGG: ".ogg",
} as const;

/**
 * Constantes relacionadas con playlists
 */
export const PLAYLIST_CONSTANTS = {
  MASTER_PLAYLIST_NAME: "00_Master_Library",
  MASTER_PLAYLIST_PREFIX: "00_Master",
  GENRE_PLAYLIST_PREFIX: "Genre_",
  PLAYLIST_HEADER: "#EXTM3U\n",
} as const;

/**
 * Constantes relacionadas con metadatos por defecto
 */
export const METADATA_DEFAULTS = {
  UNKNOWN_ARTIST: "Unknown Artist",
  UNKNOWN_ALBUM: "Unknown Album",
  UNKNOWN: "Unknown",
  DEFAULT_GENRE: "Otros",
  DEFAULT_TRACK_NO: "00",
} as const;

/**
 * Constantes relacionadas con Apple Music
 */
export const APPLE_MUSIC_CONSTANTS = {
  APP_NAME: "Music",
  OSASCRIPT_LANGUAGE: "JavaScript",
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  LIBRARY_DB_NOT_FOUND: "No se encontró library_db.json",
  PLAYLIST_NOT_FOUND: (name: string) => `Playlist ${name} not found`,
  CANNOT_MODIFY_MASTER: "Cannot modify the Master Library playlist",
  CANNOT_DELETE_MASTER: "Cannot delete the Master Library playlist",
  CANNOT_EXPORT_MASTER: "Cannot export/move the Master Library playlist",
} as const;

/**
 * Mensajes de log comunes
 */
export const LOG_MESSAGES = {
  NO_PLAYLISTS_TO_SYNC: "No hay canciones con playlists asignadas para sincronizar.",
  SYNC_STARTED: (count: number) => `Encontradas ${count} canciones con asignación de playlists. Iniciando sincronización...`,
  SYNC_COMPLETED: "✅ Sincronización con Apple Music terminada.",
  SYNC_ERROR: "❌ Error durante la sincronización con Apple Music:",
  APPLE_MUSIC_LOG_PREFIX: "[AppleMusic Log]:",
} as const;
