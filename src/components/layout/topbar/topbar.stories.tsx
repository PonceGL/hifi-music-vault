import type { Meta, StoryObj } from "@storybook/nextjs";
import { Topbar } from "./topbar";

const meta = {
  title: "Layout/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isBlocked: false,
    onSearchOpen: () => {},
    onSyncStart: () => {},
  },
  decorators: [
    (Story) => (
      <div className="bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blocked: Story = {
  args: {
    isBlocked: true,
  },
};

export const AllVariants: Story = {
  args: {},
  render: (args) => (
    <div className="flex flex-col gap-4 bg-background p-4">
      <div>
        <p className="mb-2 text-xs text-text-tertiary">Default</p>
        <Topbar {...args} />
      </div>
      <div>
        <p className="mb-2 text-xs text-text-tertiary">
          Bloqueado (sync / export activo)
        </p>
        <Topbar {...args} isBlocked />
      </div>
    </div>
  ),
};
