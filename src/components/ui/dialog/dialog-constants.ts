export const DIALOG_VARIANTS = {
  informative: 'informative',
  confirmation: 'confirmation',
  critical: 'critical',
  'in-progress': 'in-progress',
} as const;

export type DialogVariant = keyof typeof DIALOG_VARIANTS;

export const DIALOG_OVERLAY_CLASSES: Record<DialogVariant, string> = {
  informative: 'bg-black/50',
  confirmation: 'bg-black/60',
  critical: 'bg-black/80',
  'in-progress': 'bg-black/90',
};

export const DIALOG_CLOSE_LABEL = 'Close';
