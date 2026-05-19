import { fireEvent, render, screen } from "@testing-library/react";
import type { Track } from "@/types/track";
import { DetailPanel } from ".";
import {
  DETAIL_PANEL_ARIA_LABEL,
  DETAIL_PANEL_CLOSE_LABEL,
  ACTION_EDIT_METADATA,
  ACTION_REVEAL_IN_FINDER,
  MISSING_VALUE,
} from "./constants";

jest.mock("@/hooks/useEscapeKey", () => ({
  useEscapeKey: jest.fn(),
}));

import { useEscapeKey } from "@/hooks/useEscapeKey";

const mockUseEscapeKey = useEscapeKey as jest.Mock;

const MOCK_TRACK: Track = {
  id: "track-1",
  filePath: "/music/artist/album/01 - Title.flac",
  fileName: "01 - Title.flac",
  format: "flac",
  size: 47_185_920,
  duration: 225,
  healthStatus: "complete",
  metadata: {
    title: "Track Title",
    artist: "Artist Name",
    albumArtist: "Artist Name",
    album: "Album Name",
    year: 2024,
    genre: "Electronic",
    trackNumber: 1,
    totalTracks: 10,
    discNumber: 1,
    totalDiscs: 1,
    composer: null,
    comment: null,
    artwork: null,
    bitrate: 1_411_000,
    sampleRate: 44100,
    musicBrainzId: null,
  },
};

function renderPanel(
  overrides: Partial<typeof MOCK_TRACK> = {},
  props: Partial<Parameters<typeof DetailPanel>[0]> = {},
) {
  const track = overrides ? { ...MOCK_TRACK, ...overrides } : MOCK_TRACK;
  return render(
    <DetailPanel track={track} isOpen onClose={jest.fn()} {...props} />,
  );
}

beforeEach(() => {
  mockUseEscapeKey.mockReset();
});

describe("DetailPanel — guard clause", () => {
  it("renders nothing when track is null", () => {
    const { container } = render(
      <DetailPanel track={null} isOpen onClose={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders content when track is provided and isOpen is true", () => {
    renderPanel();
    expect(screen.getByLabelText(DETAIL_PANEL_ARIA_LABEL)).toBeInTheDocument();
  });
});

describe("DetailPanel — metadata", () => {
  it("shows the track title", () => {
    renderPanel();
    expect(screen.getByText("Track Title")).toBeInTheDocument();
  });

  it("shows the artist name", () => {
    renderPanel();
    expect(screen.getAllByText("Artist Name").length).toBeGreaterThan(0);
  });

  it("shows the album name", () => {
    renderPanel();
    expect(screen.getAllByText("Album Name").length).toBeGreaterThan(0);
  });

  it("shows em dash for missing title", () => {
    renderPanel({ metadata: { ...MOCK_TRACK.metadata, title: null } });
    expect(screen.getAllByText(MISSING_VALUE).length).toBeGreaterThan(0);
  });

  it("shows the formatted bitrate", () => {
    renderPanel();
    expect(screen.getByText("1411 kbps")).toBeInTheDocument();
  });

  it("shows the formatted sample rate", () => {
    renderPanel();
    expect(screen.getByText("44.1 kHz")).toBeInTheDocument();
  });

  it("shows em dash for missing bitrate", () => {
    renderPanel({ metadata: { ...MOCK_TRACK.metadata, bitrate: null } });
    expect(screen.getAllByText(MISSING_VALUE).length).toBeGreaterThan(0);
  });
});

describe("DetailPanel — close interactions", () => {
  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<DetailPanel track={MOCK_TRACK} isOpen onClose={onClose} />);
    fireEvent.click(
      screen.getByRole("button", { name: DETAIL_PANEL_CLOSE_LABEL }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("wires useEscapeKey with isOpen and onClose", () => {
    const onClose = jest.fn();
    render(<DetailPanel track={MOCK_TRACK} isOpen onClose={onClose} />);
    expect(mockUseEscapeKey).toHaveBeenCalledWith(true, onClose);
  });

  it("passes isOpen=false to useEscapeKey when closed", () => {
    const onClose = jest.fn();
    render(<DetailPanel track={MOCK_TRACK} isOpen={false} onClose={onClose} />);
    expect(mockUseEscapeKey).toHaveBeenCalledWith(false, onClose);
  });
});

describe("DetailPanel — action buttons", () => {
  it("renders the edit metadata button", () => {
    renderPanel();
    expect(
      screen.getByRole("button", {
        name: new RegExp(ACTION_EDIT_METADATA, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("renders the reveal in finder button", () => {
    renderPanel();
    expect(
      screen.getByRole("button", {
        name: new RegExp(ACTION_REVEAL_IN_FINDER, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("calls onEditMetadata when that button is clicked", () => {
    const onEditMetadata = jest.fn();
    renderPanel({}, { onEditMetadata });
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(ACTION_EDIT_METADATA, "i"),
      }),
    );
    expect(onEditMetadata).toHaveBeenCalledTimes(1);
  });

  it("calls onRevealInFinder when that button is clicked", () => {
    const onRevealInFinder = jest.fn();
    renderPanel({}, { onRevealInFinder });
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(ACTION_REVEAL_IN_FINDER, "i"),
      }),
    );
    expect(onRevealInFinder).toHaveBeenCalledTimes(1);
  });
});
