import type { Meta, StoryObj } from "@storybook/nextjs";
import { ConfirmDialog } from "./confirm-dialog";
import { DEFAULT_CANCEL_LABEL, DEFAULT_CONFIRM_LABEL } from "./constants";

const meta = {
  title: "Shared/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
  },
  args: {
    isOpen: true,
    title: "¿Eliminar pista?",
    description: "Esta acción no se puede deshacer.",
    onConfirm: () => {},
    onCancel: () => {},
    confirmLabel: DEFAULT_CONFIRM_LABEL,
    cancelLabel: DEFAULT_CANCEL_LABEL,
    variant: "default",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    title: "¿Eliminar álbum completo?",
    description: "Se eliminarán 12 pistas. Esta acción no se puede deshacer.",
    confirmLabel: "Sí, eliminar",
    variant: "destructive",
  },
};

export const CustomLabels: Story = {
  args: {
    title: "¿Mover a biblioteca?",
    description: "El archivo se moverá a la carpeta de biblioteca.",
    confirmLabel: "Sí, mover",
    cancelLabel: "Volver",
  },
};

export const LongContent: Story = {
  args: {
    title: "¿Sobrescribir metadatos de esta pista?",
    description:
      "Los metadatos actuales serán reemplazados con la información obtenida de MusicBrainz. Los campos afectados incluyen: título, artista, álbum, año, género y carátula. Esta acción no se puede deshacer.",
    confirmLabel: "Sí, sobrescribir",
    variant: "destructive",
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
