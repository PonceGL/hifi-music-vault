import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncResultModal } from "./index";

const meta = {
  title: "Features/Sync/SyncResultModal",
  component: SyncResultModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    wasCancelled: false,
    onGoToLibrary: () => {},
    result: {
      moved: 231,
      duplicatesSkipped: 0,
      missingMetadataSkipped: 0,
      withWarnings: 0,
      errors: 0,
      playlistsUpdated: [],
    },
  },
  argTypes: {
    isOpen: { control: "boolean" },
    wasCancelled: { control: "boolean" },
  },
} satisfies Meta<typeof SyncResultModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** MFM-488 — Happy path: 231 movidos, 0 errores, sin playlists */
export const Default: Story = {};

/** MFM-489 — Con ignorados desglosados y playlists actualizadas */
export const WithBreakdownAndPlaylists: Story = {
  args: {
    result: {
      moved: 231,
      duplicatesSkipped: 12,
      missingMetadataSkipped: 4,
      withWarnings: 0,
      errors: 0,
      playlistsUpdated: ["Rock", "Favoritos", "Jazz"],
    },
  },
};

/** MFM-490 — Todos fallaron: 0 movidos, N errores */
export const AllFailed: Story = {
  args: {
    result: {
      moved: 0,
      duplicatesSkipped: 0,
      missingMetadataSkipped: 0,
      withWarnings: 0,
      errors: 8,
      playlistsUpdated: [],
    },
  },
};

/** MFM-491 — Cancelado a mitad: resultado parcial */
export const CancelledPartial: Story = {
  args: {
    wasCancelled: true,
    result: {
      moved: 143,
      duplicatesSkipped: 5,
      missingMetadataSkipped: 2,
      withWarnings: 0,
      errors: 0,
      playlistsUpdated: ["Rock"],
    },
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div>
        <p className="mb-2 font-mono text-xs text-text-tertiary">Happy path</p>
        <SyncResultModal
          {...args}
          result={{
            moved: 231,
            duplicatesSkipped: 0,
            missingMetadataSkipped: 0,
            withWarnings: 0,
            errors: 0,
            playlistsUpdated: [],
          }}
        />
      </div>
      <div>
        <p className="mb-2 font-mono text-xs text-text-tertiary">
          Con desglose + playlists
        </p>
        <SyncResultModal
          {...args}
          result={{
            moved: 231,
            duplicatesSkipped: 12,
            missingMetadataSkipped: 4,
            withWarnings: 0,
            errors: 0,
            playlistsUpdated: ["Rock", "Jazz"],
          }}
        />
      </div>
    </div>
  ),
};
