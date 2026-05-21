import { render, screen } from "@testing-library/react";
import LibraryPage from "./page";

const VALID_CONFIG = {
  downloadsPath: "/Users/juan/Downloads/Música",
  libraryPath: "/Users/juan/Music/Biblioteca",
};

jest.mock("@/hooks/useLibraryStatus", () => ({
  useLibraryStatus: jest.fn(),
}));

jest.mock("@/hooks/useFolderConfigStore", () => ({
  useFolderConfigStore: jest.fn(() => ({ folderConfig: VALID_CONFIG })),
}));

jest.mock("@/components/features/library/LibraryEmptyState", () => ({
  LibraryEmptyState: ({
    variant,
    downloadsCount,
    downloadsPath,
  }: {
    variant: string;
    downloadsCount?: number;
    downloadsPath?: string;
  }) => (
    <div
      data-testid={`empty-state-${variant}`}
      data-downloads-count={downloadsCount}
      data-downloads-path={downloadsPath}
    />
  ),
}));

import { useLibraryStatus } from "@/hooks/useLibraryStatus";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";

const mockUseLibraryStatus = useLibraryStatus as jest.Mock;
const mockUseFolderConfigStore = useFolderConfigStore as jest.Mock;

const DOWNLOADS_WITH_FILES = { count: 12, byFormat: { flac: 12 } };
const DOWNLOADS_EMPTY = { count: 0, byFormat: {} };
const LIBRARY_WITH_FILES = { count: 247, byFormat: { flac: 247 } };
const LIBRARY_EMPTY = { count: 0, byFormat: {} };

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFolderConfigStore.mockReturnValue({ folderConfig: VALID_CONFIG });
});

describe("LibraryPage — loading state", () => {
  it("renders an accessible loading indicator while status is undefined", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: undefined,
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { container } = render(<LibraryPage />);
    const busy = container.querySelector("[aria-busy]");
    expect(busy).toBeInTheDocument();
  });
});

describe("LibraryPage — status A (primera sync)", () => {
  it("renders LibraryEmptyState with variant A", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "A",
      data: { downloads: DOWNLOADS_WITH_FILES, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-A")).toBeInTheDocument();
  });

  it("passes the downloads count from the status data", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "A",
      data: { downloads: DOWNLOADS_WITH_FILES, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-A")).toHaveAttribute(
      "data-downloads-count",
      "12",
    );
  });

  it("passes the downloads path from the folder config", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "A",
      data: { downloads: DOWNLOADS_WITH_FILES, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-A")).toHaveAttribute(
      "data-downloads-path",
      VALID_CONFIG.downloadsPath,
    );
  });
});

describe("LibraryPage — status D (ambas vacías)", () => {
  it("renders LibraryEmptyState with variant D", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "D",
      data: { downloads: DOWNLOADS_EMPTY, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-D")).toBeInTheDocument();
  });

  it("passes zero as downloads count for status D", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "D",
      data: { downloads: DOWNLOADS_EMPTY, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-D")).toHaveAttribute(
      "data-downloads-count",
      "0",
    );
  });
});

describe("LibraryPage — status B (uso habitual)", () => {
  it("does not render LibraryEmptyState for status B", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "B",
      data: { downloads: DOWNLOADS_WITH_FILES, library: LIBRARY_WITH_FILES },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.queryByTestId("empty-state-B")).not.toBeInTheDocument();
  });

  it("renders library content placeholder for status B", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "B",
      data: { downloads: DOWNLOADS_WITH_FILES, library: LIBRARY_WITH_FILES },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByText("Biblioteca")).toBeInTheDocument();
  });
});

describe("LibraryPage — status C (sin pendientes)", () => {
  it("does not render LibraryEmptyState for status C", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "C",
      data: { downloads: DOWNLOADS_EMPTY, library: LIBRARY_WITH_FILES },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.queryByTestId("empty-state-C")).not.toBeInTheDocument();
  });

  it("renders library content placeholder for status C", () => {
    mockUseLibraryStatus.mockReturnValue({
      status: "C",
      data: { downloads: DOWNLOADS_EMPTY, library: LIBRARY_WITH_FILES },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByText("Biblioteca")).toBeInTheDocument();
  });
});

describe("LibraryPage — no folder config", () => {
  it("passes undefined as downloadsPath when folderConfig is null", () => {
    mockUseFolderConfigStore.mockReturnValue({ folderConfig: null });
    mockUseLibraryStatus.mockReturnValue({
      status: "D",
      data: { downloads: DOWNLOADS_EMPTY, library: LIBRARY_EMPTY },
      isLoading: false,
      isError: false,
    });
    render(<LibraryPage />);
    expect(screen.getByTestId("empty-state-D")).not.toHaveAttribute(
      "data-downloads-path",
    );
  });
});
