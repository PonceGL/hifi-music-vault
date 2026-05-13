import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "ghost", "link"],
      description: "Visual style of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "Size of the button",
    },
    isLoading: {
      control: "boolean",
      description: "Shows a spinner and disables the button",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Save changes",
    variant: "primary",
    size: "md",
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="icon">✕</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    variant: "primary",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Saving…",
    variant: "primary",
    isLoading: true,
  },
};

export const DestructiveVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Button {...args} variant="destructive" size="sm">Delete</Button>
      <Button {...args} variant="destructive" size="md">Delete track</Button>
      <Button {...args} variant="destructive" size="lg">Delete library</Button>
    </div>
  ),
};
