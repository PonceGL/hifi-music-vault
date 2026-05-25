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
    hasLibrary: true,
    onSearchOpen: () => {},
    onSyncStart: () => {},
    onRevalidate: () => {},
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

export const NoLibrary: Story = {
  args: {
    hasLibrary: false,
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
    <div className="flex flex-col gap-4 bg-background p-4">
      <div>
        <p className="mb-2 text-xs text-text-tertiary">
          Con biblioteca (sync disponible)
        </p>
        <Topbar {...args} hasLibrary />
      </div>
      <div>
        <p className="mb-2 text-xs text-text-tertiary">
          Sin biblioteca (oculta sync)
        </p>
        <Topbar {...args} hasLibrary={false} />
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
