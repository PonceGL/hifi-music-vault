export const ONBOARDING_STRINGS = {
  welcome: {
    appName: "Music Files Manager",
    tagline: "Tu biblioteca musical, perfectamente organizada",
    startButton: "Comenzar →",
    features: [
      {
        title: "Gestión de biblioteca",
        description: "Organiza por Artista / Álbum / Año automáticamente",
      },
      {
        title: "Playlists portables",
        description: "Formato .m3u8 compatible con cualquier reproductor",
      },
      {
        title: "Metadatos precisos",
        description: "Enriquece con MusicBrainz, tú decides qué aplicas",
      },
    ],
  },
  folderConfig: {
    title: "Configura tus carpetas",
    backButton: "← Volver",
    submitButton: "Empezar",
    downloads: {
      label: "Carpeta de Descargas",
      description: "Aquí están los archivos de audio sin organizar",
      prompt: "Selecciona tu carpeta de Descargas",
      placeholder: "Ninguna carpeta seleccionada",
    },
    library: {
      label: "Carpeta de Biblioteca",
      description: "Estructura /Artista/Álbum [Año]/## - Título.ext",
      prompt: "Selecciona tu carpeta de Biblioteca",
      placeholder: "Ninguna carpeta seleccionada",
    },
  },
  validation: {
    sameFolderError: "Las carpetas no pueden ser la misma ruta",
    libraryInsideDownloadsError:
      "La Biblioteca no puede ser una subcarpeta de Descargas",
    noWritePermissionError:
      "Sin permisos de escritura. En macOS: Ajustes del Sistema → Privacidad → Acceso a la carpeta. En Windows: Propiedades → Seguridad.",
    validSuccess: "Carpeta válida",
    chooseFolderButton: "Elegir",
  },
} as const;
