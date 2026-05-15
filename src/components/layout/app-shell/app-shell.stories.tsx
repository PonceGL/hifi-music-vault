import type { Meta, StoryObj } from "@storybook/nextjs";
import { AppShell } from "./app-shell";

/* ── Placeholder slots ───────────────────────────────────────── */

function MockSidebar(): React.JSX.Element {
  return (
    <div className="flex w-60 flex-col gap-1 p-3">
      {["Biblioteca", "Artistas", "Álbumes", "Playlists", "Health"].map(
        (item) => (
          <div
            key={item}
            className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-text-secondary hover:bg-sidebar-hover"
          >
            <span className="size-4 rounded bg-surface-elevated" />
            {item}
          </div>
        ),
      )}
      <div className="mt-auto border-t border-border pt-3">
        <p className="px-3 font-mono text-xs text-text-tertiary">
          1 284 tracks · 47.2 GB
        </p>
      </div>
    </div>
  );
}

function MockTopbar(): React.JSX.Element {
  return (
    <div className="flex h-14 items-center gap-4 border-b border-border bg-topbar-bg px-4 backdrop-blur-sm">
      <span className="text-sm font-semibold text-text-primary">
        Music Files Manager
      </span>
      <div className="mx-auto h-8 w-64 rounded-md border border-border bg-surface-secondary" />
      <div className="size-8 rounded-full bg-surface-elevated" />
    </div>
  );
}

function MockTabBar(): React.JSX.Element {
  return (
    <div className="flex h-16 items-center justify-around border-t border-border bg-surface-primary px-4">
      {["Biblioteca", "Artistas", "Álbumes", "Playlists"].map((item) => (
        <div
          key={item}
          className="flex flex-col items-center gap-1 text-text-tertiary"
        >
          <span className="size-5 rounded bg-surface-elevated" />
          <span className="text-[10px]">{item}</span>
        </div>
      ))}
    </div>
  );
}

function MockContent(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex h-12 items-center gap-3 rounded-md border border-border bg-surface-primary px-4"
        >
          <span className="size-8 rounded bg-surface-secondary" />
          <div className="flex flex-col gap-1">
            <span className="h-3 w-32 rounded bg-surface-elevated" />
            <span className="h-2 w-20 rounded bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MockDetailPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="aspect-square w-full rounded-lg bg-surface-secondary" />
      <div className="flex flex-col gap-2">
        <span className="h-4 w-40 rounded bg-surface-elevated" />
        <span className="h-3 w-28 rounded bg-surface-overlay" />
        <span className="font-mono text-xs text-text-tertiary">
          FLAC · 96kHz · 24bit
        </span>
      </div>
    </div>
  );
}

function MockArtworkBanner(): React.JSX.Element {
  return (
    <div className="flex h-8 items-center gap-3 border-b border-border bg-surface-secondary px-4">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-elevated">
        <div className="h-full w-3/5 rounded-full bg-accent" />
      </div>
      <span className="font-mono text-xs text-text-secondary">30/50</span>
      <button
        type="button"
        className="text-xs text-text-tertiary hover:text-text-primary"
      >
        Cancelar
      </button>
    </div>
  );
}

/* ── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    sidebar: <MockSidebar />,
    topbar: <MockTopbar />,
    tabBar: <MockTabBar />,
    children: <MockContent />,
    isBlocked: false,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Stories ─────────────────────────────────────────────────── */

export const Default: Story = {};

export const WithDetailPanel: Story = {
  args: {
    detailPanel: <MockDetailPanel />,
  },
};

export const WithArtworkBanner: Story = {
  args: {
    artworkBanner: <MockArtworkBanner />,
  },
};

export const Blocked: Story = {
  args: {
    isBlocked: true,
  },
};

export const AllVariants: Story = {
  args: {},
  render: (args) => (
    <div className="flex flex-col gap-8 bg-background p-4">
      <div>
        <p className="mb-2 text-xs text-text-tertiary">Default</p>
        <div className="h-64 overflow-hidden rounded-lg border border-border">
          <AppShell {...args}>
            <MockContent />
          </AppShell>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-text-tertiary">Con panel de detalle</p>
        <div className="h-64 overflow-hidden rounded-lg border border-border">
          <AppShell {...args} detailPanel={<MockDetailPanel />}>
            <MockContent />
          </AppShell>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-text-tertiary">
          Bloqueado (sync / export)
        </p>
        <div className="h-64 overflow-hidden rounded-lg border border-border">
          <AppShell {...args} isBlocked>
            <MockContent />
          </AppShell>
        </div>
      </div>
    </div>
  ),
};
