import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/constants/app';
import type { SaveConfigBody, RevealFileBody } from './types';

/**
 * Configuración de la aplicación
 */
export interface AppConfig {
    inboxPath: string;
    libraryPath: string;
    updatedAt?: string;
}

/**
 * Respuesta de configuración
 */
interface ConfigResponse {
    config: AppConfig | null;
}

/**
 * Entrada de directorio
 */
export interface DirectoryEntry {
    name: string;
    path: string;
    type: 'directory';
}

/**
 * Respuesta de navegación de directorios
 */
interface BrowseResponse {
    currentPath: string;
    parentPath: string;
    directories: DirectoryEntry[];
}

/**
 * Respuesta de reveal
 */
interface RevealResponse {
    success: boolean;
}

/**
 * Servicio para utilidades varias
 * Maneja configuración, navegación de archivos, y operaciones del sistema
 */
export const utilsApi = {
    /**
     * Obtiene la configuración guardada
     * @returns Configuración de la aplicación o null si no existe
     */
    getConfig: async (): Promise<AppConfig | null> => {
        const response = await apiClient.get<ConfigResponse>(API_ENDPOINTS.CONFIG);
        return response.config;
    },

    /**
     * Guarda la configuración de la aplicación
     * @param inboxPath - Ruta de la carpeta de descargas
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    saveConfig: async (inboxPath: string, libraryPath: string): Promise<AppConfig> => {
        const body: SaveConfigBody = { inboxPath, libraryPath };
        return apiClient.post<AppConfig>(API_ENDPOINTS.CONFIG, body);
    },

    /**
     * Navega directorios del sistema
     * @param path - Ruta a explorar (opcional, usa '/' por defecto)
     * @returns Información del directorio actual y subdirectorios
     */
    browse: async (path?: string): Promise<BrowseResponse> => {
        return apiClient.get<BrowseResponse>(API_ENDPOINTS.BROWSE, {
            params: path ? { path } : undefined,
        });
    },

    /**
     * Revela un archivo en el explorador de archivos del sistema
     * @param path - Ruta del archivo o carpeta a revelar
     */
    reveal: async (path: string): Promise<void> => {
        const body: RevealFileBody = { path };
        await apiClient.post<RevealResponse>(API_ENDPOINTS.REVEAL, body);
    },
};