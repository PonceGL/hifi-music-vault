import { render, screen } from "@testing-library/react";
import { FormatBadge } from "./format-badge";

describe("FormatBadge", () => {
  describe("rendering", () => {
    it("renders without crashing for all AudioFormat values", () => {
      const formats = ["flac", "alac", "mp3", "wav", "aac", "ogg"] as const;
      formats.forEach((format) => {
        const { unmount } = render(<FormatBadge format={format} />);
        unmount();
      });
    });
  });

  describe("display text", () => {
    it("displays FLAC in uppercase", () => {
      render(<FormatBadge format="flac" />);
      expect(screen.getByText("FLAC")).toBeInTheDocument();
    });

    it("displays ALAC in uppercase", () => {
      render(<FormatBadge format="alac" />);
      expect(screen.getByText("ALAC")).toBeInTheDocument();
    });

    it("displays MP3 in uppercase", () => {
      render(<FormatBadge format="mp3" />);
      expect(screen.getByText("MP3")).toBeInTheDocument();
    });

    it("displays WAV in uppercase", () => {
      render(<FormatBadge format="wav" />);
      expect(screen.getByText("WAV")).toBeInTheDocument();
    });

    it("displays AAC in uppercase", () => {
      render(<FormatBadge format="aac" />);
      expect(screen.getByText("AAC")).toBeInTheDocument();
    });

    it("displays OGG in uppercase", () => {
      render(<FormatBadge format="ogg" />);
      expect(screen.getByText("OGG")).toBeInTheDocument();
    });
  });

  describe("aria-label", () => {
    it("has aria-label 'Formato: FLAC' for flac", () => {
      render(<FormatBadge format="flac" />);
      expect(screen.getByText("FLAC")).toHaveAttribute(
        "aria-label",
        "Formato: FLAC",
      );
    });

    it("has aria-label 'Formato: ALAC' for alac", () => {
      render(<FormatBadge format="alac" />);
      expect(screen.getByText("ALAC")).toHaveAttribute(
        "aria-label",
        "Formato: ALAC",
      );
    });

    it("has aria-label 'Formato: MP3' for mp3", () => {
      render(<FormatBadge format="mp3" />);
      expect(screen.getByText("MP3")).toHaveAttribute(
        "aria-label",
        "Formato: MP3",
      );
    });

    it("has aria-label 'Formato: WAV' for wav", () => {
      render(<FormatBadge format="wav" />);
      expect(screen.getByText("WAV")).toHaveAttribute(
        "aria-label",
        "Formato: WAV",
      );
    });
  });
});
