import type { Meta, StoryObj } from "@storybook/nextjs";
import { Sidebar } from "./sidebar";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/library",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen bg-background">
        <Story />
        <div className="flex flex-1 items-center justify-center text-sm text-text-tertiary">
          Área de contenido
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: { trackCount: 1284, diskSpaceLabel: "47.2 GB" },
  },
};

export const WithoutStats: Story = {
  args: {},
};

export const AllVariants: Story = {
  args: {
    stats: { trackCount: 1284, diskSpaceLabel: "47.2 GB" },
  },
};
