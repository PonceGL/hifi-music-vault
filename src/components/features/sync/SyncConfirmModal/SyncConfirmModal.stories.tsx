import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncConfirmModal } from "./index";

const DOWNLOADS_PATH = "/Users/juan/Downloads/Música";
const LIBRARY_PATH = "/Users/juan/Music/Biblioteca";

const meta = {
  title: "Features/Sync/SyncConfirmModal",
  component: SyncConfirmModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    downloadsPath: DOWNLOADS_PATH,
    libraryPath: LIBRARY_PATH,
    onConfirm: () => {},
    onCancel: () => {},
    prescan: {
      toMove: 235,
      ignored: { duplicates: 12, missingMetadata: 4 },
      tagFolders: ["Rock", "Favoritos"],
      depthExceededCount: 0,
      longPathWarnings: 0,
    },
  },
  argTypes: {
    isOpen: { control: "boolean" },
  },
} satisfies Meta<typeof SyncConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** MFM-473 — Happy path: 247 archivos, con tags, sin advertencias */
export const Default: Story = {};

/** MFM-474 — Sin archivos encontrados en Descargas */
export const NoFilesFound: Story = {
  args: {
    prescan: {
      toMove: 0,
      ignored: { duplicates: 0, missingMetadata: 0 },
      tagFolders: [],
      depthExceededCount: 0,
      longPathWarnings: 0,
    },
  },
};

/** MFM-475 — Todos los archivos ya existen en Biblioteca */
export const AllDuplicates: Story = {
  args: {
    prescan: {
      toMove: 0,
      ignored: { duplicates: 247, missingMetadata: 0 },
      tagFolders: [],
      depthExceededCount: 0,
      longPathWarnings: 0,
    },
  },
};

/** MFM-476 — Con advertencias: rutas largas + archivos en profundidad > 5 niveles */
export const WithWarnings: Story = {
  args: {
    prescan: {
      toMove: 230,
      ignored: { duplicates: 8, missingMetadata: 2 },
      tagFolders: ["Jazz", "Clásica"],
      depthExceededCount: 3,
      longPathWarnings: 2,
    },
  },
};

export const SingularCounts: Story = {
  args: {
    prescan: {
      toMove: 1,
      ignored: { duplicates: 1, missingMetadata: 1 },
      tagFolders: ["Rock"],
      depthExceededCount: 1,
      longPathWarnings: 1,
    },
  },
};
