import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncCancelDialog } from "./index";

const meta = {
  title: "Features/Sync/SyncCancelDialog",
  component: SyncCancelDialog,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    movedCount: 143,
    onContinue: () => {},
    onConfirmCancel: () => {},
  },
  argTypes: {
    isOpen: { control: "boolean" },
    movedCount: { control: "number" },
  },
} satisfies Meta<typeof SyncCancelDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Singular: Story = {
  args: { movedCount: 1 },
};

export const Zero: Story = {
  args: { movedCount: 0 },
};
