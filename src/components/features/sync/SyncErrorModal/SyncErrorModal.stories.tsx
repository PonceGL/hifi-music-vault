import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncErrorModal } from "./index";

const meta = {
  title: "Features/Sync/SyncErrorModal",
  component: SyncErrorModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    onRetry: () => {},
    onClose: () => {},
    error: {
      kind: "disk_full",
      message: "No hay espacio suficiente en disco",
      affectedPath: "/Users/juan/Music/Biblioteca",
      moved: 143,
      pending: 88,
      inProcess: 1,
    },
  },
  argTypes: {
    isOpen: { control: "boolean" },
  },
} satisfies Meta<typeof SyncErrorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** MFM-495 — Disco lleno: 143 movidos, 88 pendientes, 1 en proceso */
export const Default: Story = {};

/** MFM-495 — Disco lleno con archivo incompleto */
export const DiskFull: Story = {
  args: {
    error: {
      kind: "disk_full",
      message: "No hay espacio suficiente en disco",
      affectedPath: "/Users/juan/Music/Biblioteca",
      moved: 143,
      pending: 88,
      inProcess: 1,
    },
  },
};

/** MFM-496 — Disco externo desconectado */
export const DiskDisconnected: Story = {
  args: {
    error: {
      kind: "disk_disconnected",
      message: "Disco externo desconectado",
      affectedPath: "/Volumes/MusicDisk/Biblioteca",
      moved: 67,
      pending: 164,
      inProcess: 1,
    },
  },
};

/** MFM-497 — Sin permisos de escritura */
export const PermissionDenied: Story = {
  args: {
    error: {
      kind: "permission_denied",
      message: "Sin permisos de escritura",
      affectedPath: "/Users/juan/Music/Biblioteca",
      moved: 0,
      pending: 231,
      inProcess: 0,
    },
  },
};

/** Sin archivo en proceso — nota de incompleto oculta */
export const NoIncompleteFile: Story = {
  args: {
    error: {
      kind: "disk_full",
      message: "No hay espacio suficiente en disco",
      affectedPath: "/Users/juan/Music/Biblioteca",
      moved: 143,
      pending: 88,
      inProcess: 0,
    },
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <p className="mb-2 font-mono text-xs text-text-tertiary">disk_full</p>
        <SyncErrorModal
          {...args}
          error={{
            kind: "disk_full",
            message: "No hay espacio suficiente en disco",
            affectedPath: "/Users/juan/Music/Biblioteca",
            moved: 143,
            pending: 88,
            inProcess: 1,
          }}
        />
      </div>
      <div>
        <p className="mb-2 font-mono text-xs text-text-tertiary">
          disk_disconnected
        </p>
        <SyncErrorModal
          {...args}
          error={{
            kind: "disk_disconnected",
            message: "Disco externo desconectado",
            affectedPath: "/Volumes/MusicDisk/Biblioteca",
            moved: 67,
            pending: 164,
            inProcess: 1,
          }}
        />
      </div>
      <div>
        <p className="mb-2 font-mono text-xs text-text-tertiary">
          permission_denied
        </p>
        <SyncErrorModal
          {...args}
          error={{
            kind: "permission_denied",
            message: "Sin permisos de escritura",
            affectedPath: "/Users/juan/Music/Biblioteca",
            moved: 0,
            pending: 231,
            inProcess: 0,
          }}
        />
      </div>
    </div>
  ),
};
