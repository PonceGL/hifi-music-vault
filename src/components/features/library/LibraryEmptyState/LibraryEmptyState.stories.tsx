import type { Meta, StoryObj } from "@storybook/nextjs";
import { LibraryEmptyState } from "./index";

const meta = {
  title: "Features/Library/LibraryEmptyState",
  component: LibraryEmptyState,
  tags: ["autodocs"],
  args: {
    variant: "A",
    downloadsCount: 247,
    downloadsPath: "/Users/juan/Downloads/Música",
    onSync: () => {},
    onChangeFolder: () => {},
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["A", "B", "C", "D"],
      description:
        "A: primera sync | B: sync disponible | C: al día | D: ambas vacías",
    },
    downloadsCount: { control: "number" },
    downloadsPath: { control: "text" },
  },
} satisfies Meta<typeof LibraryEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantB: Story = {
  args: {
    variant: "B",
    downloadsCount: 12,
  },
};

export const VariantC: Story = {
  args: {
    variant: "C",
    downloadsCount: 0,
  },
};

export const VariantD: Story = {
  args: {
    variant: "D",
    downloadsCount: 0,
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 text-xs font-mono text-text-tertiary">
          Estado A — Primera sync
        </p>
        <LibraryEmptyState {...args} variant="A" downloadsCount={247} />
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 text-xs font-mono text-text-tertiary">
          Estado B — Sync disponible
        </p>
        <LibraryEmptyState {...args} variant="B" downloadsCount={12} />
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 text-xs font-mono text-text-tertiary">
          Estado C — Biblioteca al día
        </p>
        <LibraryEmptyState {...args} variant="C" />
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 text-xs font-mono text-text-tertiary">
          Estado D — Ambas vacías
        </p>
        <LibraryEmptyState {...args} variant="D" />
      </div>
    </div>
  ),
};
