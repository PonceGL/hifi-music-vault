import type { Meta, StoryObj } from "@storybook/nextjs";
import { TabBar } from ".";

const meta = {
  title: "Layout/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-48 flex-col justify-end bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveArtists: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/artists" },
    },
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 bg-background p-4">
      <div>
        <p className="mb-1 px-1 text-xs text-text-tertiary">Activo: Biblioteca</p>
        <TabBar {...args} />
      </div>
    </div>
  ),
};
