import type { Meta, StoryObj } from "@storybook/nextjs";
import { WelcomeScreen } from "./index";

const meta = {
  title: "Features/Onboarding/WelcomeScreen",
  component: WelcomeScreen,
  tags: ["autodocs"],
  args: {
    onNext: () => {},
  },
} satisfies Meta<typeof WelcomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
