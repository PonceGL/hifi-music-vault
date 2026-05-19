import type { Meta, StoryObj } from "@storybook/nextjs";
import { Progress } from "./progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: {
    value: 50,
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "0–100 for determinate mode; omit for indeterminate",
    },
    "aria-label": { control: "text" },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 50 },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const Indeterminate: Story = {
  args: { value: undefined },
};

export const AllStates: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "360px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            marginBottom: "6px",
          }}
        >
          Determinate — 25%
        </p>
        <Progress {...args} value={25} />
      </div>
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            marginBottom: "6px",
          }}
        >
          Determinate — 60%
        </p>
        <Progress {...args} value={60} />
      </div>
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            marginBottom: "6px",
          }}
        >
          Determinate — 100%
        </p>
        <Progress {...args} value={100} />
      </div>
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            marginBottom: "6px",
          }}
        >
          Indeterminate
        </p>
        <Progress {...args} value={undefined} />
      </div>
    </div>
  ),
};
