import type { Meta, StoryObj } from "@storybook/nextjs";
import { HealthDot } from "./health-dot";

const meta = {
  title: "Shared/HealthDot",
  component: HealthDot,
  tags: ["autodocs"],
  args: {
    status: "complete",
    size: "standard",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["complete", "warning", "alert", "critical"],
      description: "Health status of the track",
    },
    size: {
      control: "select",
      options: ["standard", "large"],
      description: "standard (8px, for lists) | large (10px with border, for cards)",
    },
  },
} satisfies Meta<typeof HealthDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: "complete", size: "standard" },
};

export const AllStatuses: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <HealthDot {...args} status="complete" />
      <HealthDot {...args} status="warning" />
      <HealthDot {...args} status="alert" />
      <HealthDot {...args} status="critical" />
    </div>
  ),
  args: { size: "standard" },
};

export const BothSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>standard (8px)</span>
        <HealthDot {...args} size="standard" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>large (10px)</span>
        <HealthDot {...args} size="large" />
      </div>
    </div>
  ),
  args: { status: "complete" },
};

export const InContext: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {(["complete", "warning", "alert", "critical"] as const).map((status) => (
        <div key={status} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HealthDot {...args} status={status} />
          <span style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>
            Track title — {status}
          </span>
        </div>
      ))}
    </div>
  ),
  args: { size: "standard" },
};
