import type { SyncCriticalErrorKind } from "@/types/sync";

export const SYNC_ERROR_STRINGS = {
  title: "Sincronización interrumpida",
  statusTitle: "Estado al momento del error:",
  status: {
    moved: "archivos movidos con éxito (seguros)",
    pending: "archivos pendientes (intactos en Descargas)",
    inProcess: "archivo en proceso (puede estar incompleto)",
  },
  incompleteNote:
    'El archivo incompleto ha sido marcado en Salud como "Verificación requerida".',
  closeLabel: "Cerrar",
} as const;

export const SYNC_ERROR_RETRY_LABEL: Record<SyncCriticalErrorKind, string> = {
  disk_full: "Liberar espacio y reintentar",
  disk_disconnected: "Reconectar disco y reintentar",
  permission_denied: "Corregir permisos y reintentar",
};

export const SYNC_ERROR_MESSAGE_LABEL: Record<SyncCriticalErrorKind, string> = {
  disk_full: "No hay espacio suficiente en disco",
  disk_disconnected: "Disco externo desconectado",
  permission_denied: "Sin permisos de escritura",
};
