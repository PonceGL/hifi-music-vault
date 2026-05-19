import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Download, Trash2, FolderInput, Tag } from "lucide-react";
import { ActionBar } from "./action-bar";
import type { ActionBarAction } from "./action-bar";

const DEFAULT_ACTIONS: ActionBarAction[] = [
  { label: "Exportar", icon: Download, onClick: () => {}, variant: "default" },
  { label: "Mover", icon: FolderInput, onClick: () => {}, variant: "default" },
  { label: "Etiquetar", icon: Tag, onClick: () => {}, variant: "default" },
  {
    label: "Eliminar",
    icon: Trash2,
    onClick: () => {},
    variant: "destructive",
  },
];

const meta = {
  title: "Shared/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    selectedCount: 3,
    actions: DEFAULT_ACTIONS,
    onClearSelection: () => {},
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSelection: Story = {
  args: { selectedCount: 1 },
};

export const ManySelected: Story = {
  args: { selectedCount: 47 },
};

export const Hidden: Story = {
  args: { selectedCount: 0 },
};

export const DestructiveOnly: Story = {
  args: {
    actions: [
      {
        label: "Eliminar",
        icon: Trash2,
        onClick: () => {},
        variant: "destructive",
      },
    ],
  },
};

function InteractiveDemo(): React.JSX.Element {
  const [count, setCount] = useState(0);
  return (
    <div className="bg-surface-primary p-8 pb-24">
      <p className="mb-4 text-sm text-text-secondary">
        Haz clic en los botones para simular la selección:
      </p>
      <div className="flex gap-2">
        <button
          className="rounded bg-surface-secondary px-3 py-1 text-sm text-text-primary"
          onClick={() => setCount((c) => c + 1)}
          type="button"
        >
          + Seleccionar
        </button>
        <button
          className="rounded bg-surface-secondary px-3 py-1 text-sm text-text-primary"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          type="button"
        >
          − Deseleccionar
        </button>
      </div>
      <ActionBar
        selectedCount={count}
        actions={DEFAULT_ACTIONS}
        onClearSelection={() => setCount(0)}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
