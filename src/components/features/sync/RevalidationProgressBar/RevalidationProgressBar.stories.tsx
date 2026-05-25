import type { Meta, StoryObj } from "@storybook/nextjs";
import { RevalidationProgressBar } from "./index";
import { useOperationStore } from "@/store/useOperationStore";

const meta = {
  title: "Features/Sync/RevalidationProgressBar",
  component: RevalidationProgressBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      useOperationStore.setState({ operationInProgress: "revalidation" });
      return <Story />;
    },
  ],
} satisfies Meta<typeof RevalidationProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** MFM-500 — Visible: operationInProgress = 'revalidation' */
export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <p className="mb-1 font-mono text-xs text-text-tertiary">
          visible (revalidation)
        </p>
        <RevalidationProgressBar />
      </div>
    </div>
  ),
};
