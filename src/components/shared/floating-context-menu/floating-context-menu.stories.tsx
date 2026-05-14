import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Pencil,
  ListPlus,
  Download,
  Trash2,
  Tag,
  ListX,
} from "lucide-react";
import { FloatingContextMenu } from "./floating-context-menu";
import { BottomSheet } from "./bottom-sheet";
import type { ContextMenuAction } from "./floating-context-menu";

const SINGLE_SELECTION_ACTIONS: ContextMenuAction[] = [
  { label: "Editar metadatos", icon: Pencil, onClick: () => {}, variant: "default" },
  { label: "Agregar a playlist", icon: ListPlus, onClick: () => {}, variant: "default" },
  { label: "Exportar", icon: Download, onClick: () => {}, variant: "default" },
  { label: "Eliminar", icon: Trash2, onClick: () => {}, variant: "destructive" },
];

const MULTI_SELECTION_ACTIONS: ContextMenuAction[] = [
  { label: "Editar campo en lote", icon: Tag, onClick: () => {}, variant: "default" },
  { label: "Agregar a playlist", icon: ListPlus, onClick: () => {}, variant: "default" },
  { label: "Exportar selección", icon: Download, onClick: () => {}, variant: "default" },
  { label: "Eliminar selección", icon: Trash2, onClick: () => {}, variant: "destructive" },
];

const PLAYLIST_DETAIL_ACTIONS: ContextMenuAction[] = [
  { label: "Editar metadatos", icon: Pencil, onClick: () => {}, variant: "default" },
  { label: "Agregar a otra playlist", icon: ListPlus, onClick: () => {}, variant: "default" },
  { label: "Remover de esta playlist", icon: ListX, onClick: () => {}, variant: "destructive" },
  { label: "Eliminar", icon: Trash2, onClick: () => {}, variant: "destructive" },
];

function TriggerButton(): React.JSX.Element {
  return (
    <button
      type="button"
      className="rounded-md bg-surface-secondary px-3 py-1.5 text-sm text-text-primary"
    >
      ⋯ Abrir menú
    </button>
  );
}

const meta = {
  title: "Shared/FloatingContextMenu",
  component: FloatingContextMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    trigger: <TriggerButton />,
    actions: SINGLE_SELECTION_ACTIONS,
    isOpen: true,
    onClose: () => {},
  },
} satisfies Meta<typeof FloatingContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSelection: Story = {
  args: { actions: SINGLE_SELECTION_ACTIONS },
};

export const MultiSelection: Story = {
  args: { actions: MULTI_SELECTION_ACTIONS },
};

export const InPlaylist: Story = {
  args: { actions: PLAYLIST_DETAIL_ACTIONS },
};

export const Closed: Story = {
  args: { isOpen: false },
};

function InteractiveDemo({ actions }: { actions: ContextMenuAction[] }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center justify-center p-12">
      <FloatingContextMenu
        trigger={
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-md bg-surface-secondary px-3 py-1.5 text-sm text-text-primary hover:bg-surface-elevated"
          >
            ⋯ Clic para abrir
          </button>
        }
        actions={actions}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: (args) => <InteractiveDemo actions={args.actions ?? SINGLE_SELECTION_ACTIONS} />,
};

export const InteractiveMultiSelection: Story = {
  render: (args) => <InteractiveDemo actions={args.actions ?? MULTI_SELECTION_ACTIONS} />,
  args: { actions: MULTI_SELECTION_ACTIONS },
};

function BottomSheetDemo({ actions }: { actions: ContextMenuAction[] }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative flex h-96 w-80 flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-primary"
      style={{ isolation: "isolate" }}
    >
      <p className="mb-4 text-sm text-text-secondary">Vista móvil simulada</p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-surface-secondary px-3 py-1.5 text-sm text-text-primary"
      >
        ⋯ Abrir BottomSheet
      </button>
      <BottomSheet
        isOpen={isOpen}
        actions={actions}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

export const MobileBottomSheet: Story = {
  render: (args) => <BottomSheetDemo actions={args.actions ?? SINGLE_SELECTION_ACTIONS} />,
  parameters: { layout: "centered" },
};

export const MobileBottomSheetInPlaylist: Story = {
  render: (args) => <BottomSheetDemo actions={args.actions ?? PLAYLIST_DETAIL_ACTIONS} />,
  args: { actions: PLAYLIST_DETAIL_ACTIONS },
  parameters: { layout: "centered" },
};
