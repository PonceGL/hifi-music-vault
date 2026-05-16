import type { Meta, StoryObj } from "@storybook/nextjs";
import { FolderConfigScreen } from "./index";

const meta = {
  title: "Features/Onboarding/FolderConfigScreen",
  component: FolderConfigScreen,
  tags: ["autodocs"],
  args: {
    onBack: () => {},
    onSubmit: () => {},
  },
  parameters: {
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof FolderConfigScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Default: Story = {};
