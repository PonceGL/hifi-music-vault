import { fireEvent, render, screen } from "@testing-library/react";
import type { Track } from "@/types/track";
import { TrackCard } from "./track-card";
import { EMPTY_VALUE, CHECKBOX_ARIA_LABEL, MORE_MENU_ARIA_LABEL } from "./constants";

const MOCK_TRACK: Track = {
  id: "card-track-1",
  filePath: "/music/artist/album/01 - Title.flac",
  fileName: "01 - Title.flac",
  format: "flac",
  size: 47_185_920,
  duration: 225,
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
    musicBrainzId: null,
  },
};

const MOCK_TRACK_MISSING: Track = {
  ...MOCK_TRACK,
  id: "card-track-2",
  metadata: {
    ...MOCK_TRACK.metadata,
    title: null,
    artist: null,
  },
};

describe("TrackCard", () => {
  it("renders without errors", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.getByText("Wildlife Analysis")).toBeInTheDocument();
  });

  it("renders the track title", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.getByText("Wildlife Analysis")).toBeInTheDocument();
  });

  it("renders the track artist", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.getByText("Boards of Canada")).toBeInTheDocument();
  });

  it("renders the more menu button", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.getByRole("button", { name: MORE_MENU_ARIA_LABEL })).toBeInTheDocument();
  });

  it("renders the checkbox", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL })).toBeInTheDocument();
  });
});

describe("TrackCard — missing metadata", () => {
  it("renders em dash for missing title", () => {
    render(<TrackCard track={MOCK_TRACK_MISSING} />);
    expect(screen.getAllByText(EMPTY_VALUE).length).toBeGreaterThan(0);
  });

  it("renders Music icon placeholder when no artwork", () => {
    render(<TrackCard track={MOCK_TRACK} />);
    expect(screen.queryByRole("img", { name: /artwork/i })).not.toBeInTheDocument();
  });
});

describe("TrackCard — selected state", () => {
  it("renders checked checkbox when isSelected", () => {
    render(<TrackCard track={MOCK_TRACK} isSelected />);
    expect(screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("renders unchecked checkbox when not selected", () => {
    render(<TrackCard track={MOCK_TRACK} isSelected={false} />);
    expect(screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL })).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("marks container as selected via data-selected", () => {
    const { container } = render(<TrackCard track={MOCK_TRACK} isSelected />);
    expect(container.firstChild).toHaveAttribute("data-selected", "true");
  });

  it("marks container as not selected by default", () => {
    const { container } = render(<TrackCard track={MOCK_TRACK} />);
    expect(container.firstChild).toHaveAttribute("data-selected", "false");
  });
});

describe("TrackCard — callbacks", () => {
  it("calls onSelect with track id when checkbox changes", () => {
    const onSelect = jest.fn();
    render(<TrackCard track={MOCK_TRACK} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL }));
    expect(onSelect).toHaveBeenCalledWith(MOCK_TRACK.id);
  });

  it("calls onClick with track id when card is clicked", () => {
    const onClick = jest.fn();
    render(<TrackCard track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(screen.getByText("Wildlife Analysis"));
    expect(onClick).toHaveBeenCalledWith(MOCK_TRACK.id);
  });

  it("does not call onClick when checkbox is clicked", () => {
    const onClick = jest.fn();
    render(<TrackCard track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when more menu button is clicked", () => {
    const onClick = jest.fn();
    render(<TrackCard track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: MORE_MENU_ARIA_LABEL }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not throw when onClick is not provided", () => {
    expect(() => {
      render(<TrackCard track={MOCK_TRACK} />);
      fireEvent.click(screen.getByText("Wildlife Analysis"));
    }).not.toThrow();
  });
});
