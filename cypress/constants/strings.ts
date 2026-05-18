export const ONBOARDING = {
  appName: "Music Files Manager",
  tagline: "Tu biblioteca musical, perfectamente organizada",
  startButton: "Comenzar →",
  configureTitle: "Configura tus carpetas",
  backButton: "← Volver",
  submitButton: "Empezar",
  downloadsLabel: "Carpeta de Descargas",
  libraryLabel: "Carpeta de Biblioteca",
  chooseFolderButton: "Elegir",
  // Composed aria-labels: `${chooseFolderButton} ${label}`
  chooseFolderDownloadsAriaLabel: "Elegir Carpeta de Descargas",
  chooseFolderLibraryAriaLabel: "Elegir Carpeta de Biblioteca",
  // Validation messages — must match src/components/features/onboarding/constants.ts
  validSuccess: "Carpeta válida",
  sameFolderError: "Las carpetas no pueden ser la misma ruta",
  libraryInsideDownloadsError:
    "La Biblioteca no puede ser una subcarpeta de Descargas",
  downloadsInsideLibraryError:
    "Las Descargas no pueden ser una subcarpeta de la Biblioteca",
  notFoundError: "La ruta seleccionada no existe.",
  notADirectoryError: "La ruta seleccionada no es una carpeta.",
  noWritePermissionError: "Sin permisos de escritura",
  // Prompt substrings used to distinguish dialog API calls by body content
  downloadsPromptHint: "Descargas",
  libraryPromptHint: "Biblioteca",
} as const;
