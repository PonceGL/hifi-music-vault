import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Track } from "@/types/track";
import { DetailPanel } from ".";

const MOCK_TRACK: Track = {
  id: "track-1",
  filePath: "/music/Aphex Twin/Selected Ambient Works [1992]/01 - Xtal.flac",
  fileName: "01 - Xtal.flac",
  format: "flac",
  size: 47_185_920,
  duration: 345,
  healthStatus: "complete",
  metadata: {
    title: "Xtal",
    artist: "Aphex Twin",
    albumArtist: "Aphex Twin",
    album: "Selected Ambient Works 85-92",
    year: 1992,
    genre: "Electronic",
    trackNumber: 1,
    totalTracks: 12,
    discNumber: 1,
    totalDiscs: 1,
    composer: null,
    comment: null,
    artwork: null,
    bitrate: 1_411_000,
    sampleRate: 44100,
    musicBrainzId: "abc123",
  },
};

const MISSING_TRACK: Track = {
  ...MOCK_TRACK,
  id: "track-2",
  healthStatus: "critical",
  metadata: {
    ...MOCK_TRACK.metadata,
    title: null,
    artist: null,
    album: null,
    year: null,
    bitrate: null,
    sampleRate: null,
  },
};

const meta = {
  title: "Layout/DetailPanel",
  component: DetailPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: true,
    onClose: () => {},
    onEditMetadata: () => {},
    onRevealInFinder: () => {},
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div className="flex h-screen justify-end overflow-hidden bg-background">
        <div className="w-80 overflow-hidden border-l border-border">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof DetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { track: MOCK_TRACK },
};

export const MissingMetadata: Story = {
  args: { track: MISSING_TRACK },
};

export const NoTrack: Story = {
  args: { track: null },
};

export const AllVariants: Story = {
  args: { track: MOCK_TRACK },
  render: (args) => (
    <div className="flex gap-0 bg-background">
      <div className="w-80 overflow-hidden border-l border-border">
        <p className="px-4 py-2 text-xs text-text-tertiary">Completo</p>
        <DetailPanel {...args} track={MOCK_TRACK} />
      </div>
      <div className="w-80 overflow-hidden border-l border-border">
        <p className="px-4 py-2 text-xs text-text-tertiary">Sin metadatos</p>
        <DetailPanel {...args} track={MISSING_TRACK} />
      </div>
    </div>
  ),
};
