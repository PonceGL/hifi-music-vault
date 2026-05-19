import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Track } from "@/types/track";
import { TrackRow } from "./track-row";

const SAMPLE_TRACK: Track = {
  id: "story-track-1",
  filePath:
    "/music/Boards of Canada/Music Has the Right to Children/01 - Wildlife Analysis.flac",
  fileName: "01 - Wildlife Analysis.flac",
  format: "flac",
  size: 47_185_920,
  duration: 116,
  healthStatus: "complete",
  metadata: {
    title: "Wildlife Analysis",
    artist: "Boards of Canada",
    albumArtist: "Boards of Canada",
    album: "Music Has the Right to Children",
    year: 1998,
    genre: "Electronic",
    trackNumber: 1,
    totalTracks: 18,
    discNumber: 1,
    totalDiscs: 1,
    composer: null,
    comment: null,
    artwork: null,
    bitrate: 1411,
    sampleRate: 44100,
    musicBrainzId: "abc123",
  },
};

const meta = {
  title: "Shared/TrackRow",
  component: TrackRow,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    track: SAMPLE_TRACK,
    isSelected: false,
    isLoading: false,
    isSelectionActive: false,
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-primary">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TrackRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const SelectionActive: Story = {
  args: {
    isSelectionActive: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const MissingMetadata: Story = {
  args: {
    track: {
      ...SAMPLE_TRACK,
      id: "story-track-missing",
      healthStatus: "critical",
      metadata: {
        ...SAMPLE_TRACK.metadata,
        title: null,
        artist: null,
        album: null,
        year: null,
        genre: null,
      },
    },
  },
};

export const WarningHealth: Story = {
  args: {
    track: {
      ...SAMPLE_TRACK,
      id: "story-track-warning",
      healthStatus: "warning",
      metadata: {
        ...SAMPLE_TRACK.metadata,
        genre: null,
      },
    },
  },
};

export const MP3Format: Story = {
  args: {
    track: {
      ...SAMPLE_TRACK,
      id: "story-track-mp3",
      format: "mp3",
      metadata: {
        ...SAMPLE_TRACK.metadata,
        title: "An Eagle in Your Mind",
        bitrate: 320,
      },
    },
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="bg-surface-primary divide-y divide-border">
      <TrackRow {...args} track={SAMPLE_TRACK} />
      <TrackRow {...args} track={{ ...SAMPLE_TRACK, id: "v2" }} isSelected />
      <TrackRow
        {...args}
        track={{
          ...SAMPLE_TRACK,
          id: "v3",
          healthStatus: "warning",
          metadata: { ...SAMPLE_TRACK.metadata, genre: null },
        }}
      />
      <TrackRow
        {...args}
        track={{
          ...SAMPLE_TRACK,
          id: "v4",
          format: "mp3",
          metadata: {
            ...SAMPLE_TRACK.metadata,
            title: "Roygbiv",
            bitrate: 320,
          },
        }}
      />
      <TrackRow
        {...args}
        track={{
          ...SAMPLE_TRACK,
          id: "v5",
          healthStatus: "critical",
          metadata: {
            ...SAMPLE_TRACK.metadata,
            title: null,
            artist: null,
            album: null,
            year: null,
            genre: null,
          },
        }}
      />
      <TrackRow {...args} track={{ ...SAMPLE_TRACK, id: "v6" }} isLoading />
    </div>
  ),
};
