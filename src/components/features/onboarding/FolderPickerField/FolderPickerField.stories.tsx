import type { Meta, StoryObj } from "@storybook/nextjs";
import { FolderPickerField } from "./index";
import { ONBOARDING_STRINGS } from "../constants";

const meta = {
  title: "Features/Onboarding/FolderPickerField",
  component: FolderPickerField,
  tags: ["autodocs"],
  args: {
    label: ONBOARDING_STRINGS.folderConfig.downloads.label,
    description: ONBOARDING_STRINGS.folderConfig.downloads.description,
    value: null,
    onSelect: () => {},
    validationState: "idle",
    prompt: ONBOARDING_STRINGS.folderConfig.downloads.prompt,
  },
} satisfies Meta<typeof FolderPickerField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { validationState: "idle" },
};

export const Loading: Story = {
  args: { validationState: "loading" },
};

export const Valid: Story = {
  args: {
    value: "/Users/demo/Downloads/Música",
    validationState: "valid",
    validationMessage: "247 archivos de audio",
  },
};

export const Error: Story = {
  args: {
    value: "/Users/demo/Library/Music",
    validationState: "error",
    validationMessage: ONBOARDING_STRINGS.validation.sameFolderError,
  },
};
