export const SELECTION_LABEL_SINGULAR = "archivo seleccionado";
export const SELECTION_LABEL_PLURAL = "archivos seleccionados";
export const CLEAR_SELECTION_LABEL = "Cancelar selección";
export const SELECTION_CHECK_MARK = "✓";

export function getSelectionLabel(count: number): string {
  const unit = count === 1 ? SELECTION_LABEL_SINGULAR : SELECTION_LABEL_PLURAL;
  return `${SELECTION_CHECK_MARK} ${count} ${unit}`;
}
