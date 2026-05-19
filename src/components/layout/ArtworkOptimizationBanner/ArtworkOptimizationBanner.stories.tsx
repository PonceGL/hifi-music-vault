import type { Meta, StoryObj } from "@storybook/nextjs";
import { ArtworkOptimizationBanner } from ".";

const meta = {
  title: "Layout/ArtworkOptimizationBanner",
  component: ArtworkOptimizationBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onCancel: () => {},
  },
  decorators: [
    (Story: () => React.ReactNode) => (
      <div className="bg-background">
        <div className="flex h-14 items-center border-b border-border bg-topbar-bg px-4">
          <span className="text-sm font-semibold text-text-primary">
            HiFi Music Vault
          </span>
        </div>
        <Story />
        <div className="flex h-32 items-center justify-center text-sm text-text-tertiary">
          Área de contenido
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ArtworkOptimizationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isVisible: true,
    progress: 60,
    current: 30,
    total: 50,
  },
};

export const InProgress: Story = {
  args: {
    isVisible: true,
    progress: 60,
    current: 30,
    total: 50,
  },
};

export const NearComplete: Story = {
  args: {
    isVisible: true,
    progress: 95,
    current: 48,
    total: 50,
  },
};

export const Hidden: Story = {
  args: {
    isVisible: false,
    progress: 0,
    current: 0,
    total: 50,
  },
};

export const AllVariants: Story = {
  args: { isVisible: true, progress: 60, current: 30, total: 50 },
  render: (args) => (
    <div className="flex flex-col gap-0 bg-background">
      <div className="flex h-14 items-center border-b border-border bg-topbar-bg px-4">
        <span className="text-sm font-semibold text-text-primary">
          HiFi Music Vault
        </span>
      </div>
      <div>
        <p className="px-4 py-1 text-xs text-text-tertiary">
          En progreso (60%)
        </p>
        <ArtworkOptimizationBanner
          {...args}
          progress={60}
          current={30}
          total={50}
        />
      </div>
      <div>
        <p className="px-4 py-1 text-xs text-text-tertiary">
          Casi completo (95%)
        </p>
        <ArtworkOptimizationBanner
          {...args}
          progress={95}
          current={48}
          total={50}
        />
      </div>
      <div>
        <p className="px-4 py-1 text-xs text-text-tertiary">Oculto</p>
        <ArtworkOptimizationBanner
          {...args}
          isVisible={false}
          progress={0}
          current={0}
        />
      </div>
    </div>
  ),
};
