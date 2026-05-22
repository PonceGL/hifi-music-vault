export const SYNC_CONFIRM_STRINGS = {
  title: "¿Iniciar sincronización?",
  pathsLabel: "Se procesarán archivos de:",
  stats: {
    toMove: "A mover:",
    filesSingular: "archivo de audio",
    filesPlural: "archivos de audio",
    duplicates: "Ignorados (ya existen en biblioteca):",
    missingMetadata: "Sin metadatos requeridos:",
    tagFolders: "Carpetas [Tag] detectadas:",
  },
  warnings: {
    depthExceeded: {
      prefixSingular:
        "1 archivo supera el límite de profundidad (5 niveles) y será ignorado.",
      prefix:
        "archivos superan el límite de profundidad (5 niveles) y serán ignorados.",
    },
    longPaths: {
      prefixSingular:
        "1 archivo generaría una ruta demasiado larga. Se truncará el nombre del álbum automáticamente.",
      prefix:
        "archivos generarían rutas demasiado largas. Se truncará el nombre del álbum automáticamente.",
    },
  },
  blocking: {
    noFiles: "No se encontraron archivos de audio en tu carpeta de Descargas.",
    allDuplicates:
      "No hay archivos nuevos para sincronizar. Todos los archivos ya existen en tu biblioteca.",
  },
  irreversibleNotice:
    "Los archivos serán movidos y organizados automáticamente. Esta acción no se puede deshacer desde la app.",
  cancelLabel: "Cancelar",
  confirmLabel: "Sí, sincronizar →",
} as const;
