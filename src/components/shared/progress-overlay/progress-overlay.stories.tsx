import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ProgressOverlay } from "./progress-overlay";

const meta = {
  title: "Shared/ProgressOverlay",
  component: ProgressOverlay,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isActive: true,
    progress: 45,
    label: "Sincronizando biblioteca",
    sublabel: "Moviendo 14 de 247 archivos",
    onCancel: () => {},
  },
} satisfies Meta<typeof ProgressOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function MockShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-screen bg-bg">
      <aside
        data-shell-blockable
        className="w-60 border-r border-border bg-surface-primary transition-opacity duration-200"
        aria-label="Sidebar"
      >
        <div className="p-4 space-y-2">
          {["Biblioteca", "Artistas", "Álbumes", "Playlists", "Health"].map((item) => (
            <div
              key={item}
              className="h-8 rounded-md bg-surface-secondary px-3 flex items-center text-sm text-text-secondary"
            >
              {item}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header
          data-shell-blockable
          className="h-14 border-b border-border bg-surface-primary transition-opacity duration-200 flex items-center px-4"
          aria-label="Topbar"
        >
          <div className="h-6 w-48 rounded bg-surface-secondary" />
        </header>

        <main className="flex flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export const InProgress: Story = {
  args: {
    isActive: true,
    progress: 45,
    label: "Sincronizando biblioteca",
    sublabel: "Moviendo 14 de 247 archivos",
    onCancel: () => {},
  },
  render: (args) => (
    <MockShell>
      <ProgressOverlay {...args} />
    </MockShell>
  ),
};

export const Indeterminate: Story = {
  args: {
    isActive: true,
    progress: null,
    label: "Verificando archivos...",
    sublabel: undefined,
    onCancel: () => {},
  },
  render: (args) => (
    <MockShell>
      <ProgressOverlay {...args} />
    </MockShell>
  ),
};

export const WithPause: Story = {
  args: {
    isActive: true,
    progress: 62,
    label: "Exportando selección",
    sublabel: "93 de 150 archivos",
    onCancel: () => {},
    onPause: () => {},
  },
  render: (args) => (
    <MockShell>
      <ProgressOverlay {...args} />
    </MockShell>
  ),
};

export const Completed: Story = {
  args: {
    isActive: true,
    progress: 100,
    label: "Sincronización completada",
    sublabel: "247 archivos organizados",
    onCancel: () => {},
  },
  render: (args) => (
    <MockShell>
      <ProgressOverlay {...args} />
    </MockShell>
  ),
};

export const Inactive: Story = {
  args: {
    isActive: false,
    progress: null,
    label: "Sincronizando biblioteca",
  },
  render: (args) => (
    <MockShell>
      <div className="flex flex-1 items-center justify-center text-sm text-text-secondary">
        Contenido normal de la biblioteca
      </div>
      <ProgressOverlay {...args} />
    </MockShell>
  ),
};

function AnimatedDemo(): React.JSX.Element {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    if (progress >= 100) return;
    const interval = setInterval(() => setProgress((p) => Math.min(100, p + 2)), 100);
    return () => clearInterval(interval);
  }, [isActive, progress]);

  const handleStart = () => {
    setProgress(0);
    setIsActive(true);
  };

  const handleCancel = () => {
    setIsActive(false);
    setProgress(0);
  };

  return (
    <MockShell>
      {!isActive && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-sm text-text-secondary">
            Haz clic para simular una sincronización
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-text-on-accent"
          >
            Iniciar sync
          </button>
        </div>
      )}
      <ProgressOverlay
        isActive={isActive}
        progress={progress}
        label="Sincronizando biblioteca"
        sublabel={`Moviendo ${Math.round(progress * 2.47)} de 247 archivos`}
        onCancel={handleCancel}
      />
    </MockShell>
  );
}

export const Interactive: Story = {
  render: () => <AnimatedDemo />,
};
