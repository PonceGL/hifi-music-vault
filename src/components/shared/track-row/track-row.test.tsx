import { fireEvent, render, screen } from "@testing-library/react";
import type { Track } from "@/types/track";
import { TrackRow } from "./track-row";
import {
  EMPTY_VALUE,
  CHECKBOX_ARIA_LABEL,
  MORE_MENU_ARIA_LABEL,
} from "./constants";

const MOCK_TRACK: Track = {
  id: "track-1",
  filePath: "/music/artist/album/01 - Track Title.flac",
  fileName: "01 - Track Title.flac",
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
    bitrate: 1411,
    sampleRate: 44100,
    musicBrainzId: null,
  },
};

const MOCK_TRACK_MISSING: Track = {
  ...MOCK_TRACK,
  id: "track-2",
  healthStatus: "critical",
  metadata: {
    ...MOCK_TRACK.metadata,
    title: null,
    artist: null,
    album: null,
    year: null,
  },
};

const MOCK_TRACK_NO_ARTWORK: Track = {
  ...MOCK_TRACK,
  id: "track-3",
  metadata: { ...MOCK_TRACK.metadata, artwork: null },
};

describe("TrackRow", () => {
  it("renders without errors", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(screen.getByRole("row")).toBeInTheDocument();
  });

  it("renders the track title", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(screen.getByText("Track Title")).toBeInTheDocument();
  });

  it("renders the track artist", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(screen.getByText("Artist Name")).toBeInTheDocument();
  });

  it("renders the duration in MM:SS format", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(screen.getByText("3:45")).toBeInTheDocument();
  });

  it("renders the more menu button", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(
      screen.getByRole("button", { name: MORE_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("renders the more menu button aria label", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(
      screen.getByRole("button", { name: MORE_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });
});

describe("TrackRow — missing metadata", () => {
  it("renders em dash for missing title", () => {
    render(<TrackRow track={MOCK_TRACK_MISSING} />);
    const spans = screen.getAllByText(EMPTY_VALUE);
    expect(spans.length).toBeGreaterThan(0);
  });

  it("renders em dash for missing artist", () => {
    render(<TrackRow track={MOCK_TRACK_MISSING} />);
    expect(screen.getAllByText(EMPTY_VALUE).length).toBeGreaterThan(1);
  });

  it("renders Music icon placeholder when no artwork", () => {
    render(<TrackRow track={MOCK_TRACK_NO_ARTWORK} />);
    expect(
      screen.queryByRole("img", { name: /artwork/i }),
    ).not.toBeInTheDocument();
  });
});

describe("TrackRow — selected state", () => {
  it("has aria-selected=true when isSelected", () => {
    render(<TrackRow track={MOCK_TRACK} isSelected />);
    expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "true");
  });

  it("has aria-selected=false by default", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "false");
  });

  it("renders checked checkbox when isSelected", () => {
    render(<TrackRow track={MOCK_TRACK} isSelected />);
    const checkbox = screen.getByRole("checkbox", {
      name: CHECKBOX_ARIA_LABEL,
    });
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("renders unchecked checkbox when not selected", () => {
    render(<TrackRow track={MOCK_TRACK} isSelected={false} />);
    const checkbox = screen.getByRole("checkbox", {
      name: CHECKBOX_ARIA_LABEL,
    });
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });
});

describe("TrackRow — callbacks", () => {
  it("calls onSelect with track id when checkbox changes", () => {
    const onSelect = jest.fn();
    render(<TrackRow track={MOCK_TRACK} onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL }),
    );
    expect(onSelect).toHaveBeenCalledWith(MOCK_TRACK.id);
  });

  it("calls onClick with track id when row is clicked", () => {
    const onClick = jest.fn();
    render(<TrackRow track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(screen.getByRole("row"));
    expect(onClick).toHaveBeenCalledWith(MOCK_TRACK.id);
  });

  it("does not call onClick when checkbox is clicked", () => {
    const onClick = jest.fn();
    render(<TrackRow track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: CHECKBOX_ARIA_LABEL }),
    );
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when more menu button is clicked", () => {
    const onClick = jest.fn();
    render(<TrackRow track={MOCK_TRACK} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: MORE_MENU_ARIA_LABEL }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not throw when onClick is not provided", () => {
    expect(() => {
      render(<TrackRow track={MOCK_TRACK} />);
      fireEvent.click(screen.getByRole("row"));
    }).not.toThrow();
  });
});

describe("TrackRow — loading state", () => {
  it("renders skeleton instead of content when isLoading", () => {
    render(<TrackRow track={MOCK_TRACK} isLoading />);
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
    expect(screen.queryByText("Track Title")).not.toBeInTheDocument();
  });
});

describe("TrackRow — error state", () => {
  it("renders with reduced opacity for critical health status", () => {
    render(<TrackRow track={MOCK_TRACK_MISSING} />);
    const row = screen.getByRole("row");
    expect(row.className).toContain("opacity-70");
  });

  it("does not apply opacity-70 for healthy tracks", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    const row = screen.getByRole("row");
    expect(row.className).not.toContain("opacity-70");
  });
});

describe("TrackRow — navigation links", () => {
  it("renders title as link when trackHref is provided", () => {
    render(<TrackRow track={MOCK_TRACK} trackHref="/library/track-1" />);
    expect(screen.getByRole("link", { name: "Track Title" })).toHaveAttribute(
      "href",
      "/library/track-1",
    );
  });

  it("renders artist as link when artistHref is provided", () => {
    render(<TrackRow track={MOCK_TRACK} artistHref="/artists/artist-name" />);
    expect(screen.getByRole("link", { name: "Artist Name" })).toHaveAttribute(
      "href",
      "/artists/artist-name",
    );
  });

  it("does not render title as link when trackHref is not provided", () => {
    render(<TrackRow track={MOCK_TRACK} />);
    expect(
      screen.queryByRole("link", { name: "Track Title" }),
    ).not.toBeInTheDocument();
  });

  it("does not render title as link when title is missing", () => {
    render(
      <TrackRow track={MOCK_TRACK_MISSING} trackHref="/library/track-2" />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not call onClick when title link is clicked", () => {
    const onClick = jest.fn();
    render(
      <TrackRow
        track={MOCK_TRACK}
        trackHref="/library/track-1"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Track Title" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when artist link is clicked", () => {
    const onClick = jest.fn();
    render(
      <TrackRow
        track={MOCK_TRACK}
        artistHref="/artists/artist-name"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Artist Name" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
