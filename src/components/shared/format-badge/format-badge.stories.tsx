import type { Meta, StoryObj } from "@storybook/nextjs";
import { FormatBadge } from "./format-badge";

const meta = {
  title: "Shared/FormatBadge",
  component: FormatBadge,
  tags: ["autodocs"],
  args: {
    format: "flac",
  },
  argTypes: {
    format: {
      control: "select",
      options: ["flac", "alac", "mp3", "wav", "aac", "ogg"],
      description: "Audio format to display",
    },
  },
} satisfies Meta<typeof FormatBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { format: "flac" },
};

export const LosslessFormats: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <FormatBadge {...args} format="flac" />
      <FormatBadge {...args} format="alac" />
    </div>
  ),
};

export const LossyFormats: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <FormatBadge {...args} format="mp3" />
      <FormatBadge {...args} format="wav" />
      <FormatBadge {...args} format="aac" />
      <FormatBadge {...args} format="ogg" />
    </div>
  ),
};

export const AllFormats: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormatBadge {...args} format="flac" />
      <FormatBadge {...args} format="alac" />
      <FormatBadge {...args} format="mp3" />
      <FormatBadge {...args} format="wav" />
      <FormatBadge {...args} format="aac" />
      <FormatBadge {...args} format="ogg" />
    </div>
  ),
};

export const InContext: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {(["flac", "alac", "mp3", "wav"] as const).map((fmt) => (
        <div
          key={fmt}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <FormatBadge {...args} format={fmt} />
          <span
            style={{ fontSize: "13px", color: "var(--color-text-primary)" }}
          >
            Artist — Track title
          </span>
        </div>
      ))}
    </div>
  ),
};
