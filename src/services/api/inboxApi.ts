import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/constants/app';
import type { ScanResult } from '@/hooks/useMusicTable';
import type { ScanRequestBody, OrganizeRequestBody } from './types';

/**
 * Respuesta del endpoint de scan
 */
interface ScanResponse {
    success: boolean;
    results: ScanResult[];
}

/**
 * Respuesta del endpoint de organize
 */
interface OrganizeResponse {
    success: boolean;
    message: string;
}

/**
 * Servicio para gestión del Inbox
 * Maneja el escaneo y organización de archivos
 */
export const inboxApi = {
    /**
     * Escanea la carpeta de inbox y retorna vista previa de archivos a organizar
     * @param inboxPath - Ruta de la carpeta de descargas
     * @param libraryPath - Ruta de la carpeta de biblioteca
     * @returns Lista de archivos encontrados con metadata y ruta propuesta
     */
    scan: async (inboxPath: string, libraryPath: string): Promise<ScanResult[]> => {
        const body: ScanRequestBody = { inboxPath, libraryPath };
        const response = await apiClient.post<ScanResponse>(API_ENDPOINTS.SCAN, body);

        return response.results;
    },

    /**
     * Ejecuta la organización de archivos (mueve archivos a la biblioteca)
     * @param results - Resultados del scan con rutas propuestas
     * @param libraryPath - Ruta de la carpeta de biblioteca
     */
    organize: async (results: ScanResult[], libraryPath: string): Promise<void> => {
        const body: OrganizeRequestBody = { results, libraryPath };
        await apiClient.post<OrganizeResponse>(API_ENDPOINTS.ORGANIZE, body);
    },
};