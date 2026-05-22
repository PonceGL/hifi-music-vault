import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncProgressView } from "./index";

const meta = {
  title: "Features/Sync/SyncProgressView",
  component: SyncProgressView,
  tags: ["autodocs"],
  args: {
    progress: 65,
    isExternalDrive: false,
    onCancel: () => {},
  },
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    isExternalDrive: { control: "boolean" },
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SyncProgressView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** MFM-479 — En progreso al 65% */
export const Default: Story = {};

/** MFM-480 — Con advertencia de disco externo */
export const ExternalDrive: Story = {
  args: {
    progress: 42,
    isExternalDrive: true,
  },
};

export const Starting: Story = {
  args: { progress: 2 },
};

export const NearComplete: Story = {
  args: { progress: 95 },
};
