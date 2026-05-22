export const SYNC_CANCEL_STRINGS = {
  title: "¿Cancelar sincronización?",
  irreversibleNotice: "Esta acción no se puede revertir.",
  pendingNotice: "Los archivos pendientes permanecerán en Descargas.",
  movedSingular: "1 archivo ya fue movido a la Biblioteca.",
  movedPlural: (count: number) =>
    `${count} archivos ya fueron movidos a la Biblioteca.`,
  continueLabel: "Seguir sincronizando",
  confirmCancelLabel: "Cancelar de todas formas",
} as const;
