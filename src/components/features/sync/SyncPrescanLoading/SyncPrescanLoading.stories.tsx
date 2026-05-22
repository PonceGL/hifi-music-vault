import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncPrescanLoading } from "./index";

const meta = {
  title: "Features/Sync/SyncPrescanLoading",
  component: SyncPrescanLoading,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    downloadsPath: "/Users/juan/Downloads/Música",
  },
  argTypes: {
    isOpen: { control: "boolean" },
    downloadsPath: { control: "text" },
  },
} satisfies Meta<typeof SyncPrescanLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongPath: Story = {
  args: {
    downloadsPath:
      "/Users/juan/Music/Colecciones/Música Clásica/Orquestas/Descargas/Pendientes",
  },
};
