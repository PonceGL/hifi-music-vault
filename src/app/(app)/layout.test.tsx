import { render, screen } from "@testing-library/react";
import AppLayout from "./layout";

const mockGuard = jest.fn();
const mockValidate = jest.fn().mockResolvedValue({});
const VALID_CONFIG = {
  downloadsPath: "/downloads",
  libraryPath: "/library",
};

jest.mock("@/hooks/useFolderConfigGuard", () => ({
  useFolderConfigGuard: () => mockGuard(),
}));

jest.mock("@/hooks/useFolderConfigStore", () => ({
  useFolderConfigStore: jest.fn(() => ({ folderConfig: VALID_CONFIG })),
}));

jest.mock("@/store/useOperationStore", () => ({
  useOperationStore: jest.fn(() => ({ operationInProgress: null })),
}));

jest.mock("@/hooks/useLibraryStatus", () => ({
  useLibraryStatus: jest.fn(() => ({ data: null })),
}));

jest.mock("@/hooks/useSync", () => ({
  useSync: jest.fn(() => ({ startPrescan: jest.fn() })),
}));

jest.mock("@/hooks/useRevalidation", () => ({
  useRevalidation: jest.fn(() => ({
    revalidate: jest.fn(),
    isRevalidating: false,
  })),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({ info: jest.fn() })),
}));

jest.mock("@/lib/validateFolderPath", () => ({
  validateFolderPath: (path: string) => mockValidate(path),
}));

jest.mock("@/components/layout/app-shell/app-shell", () => ({
  AppShell: ({
    children,
    sidebar,
    topbar,
    tabBar,
    artworkBanner,
    isBlocked,
  }: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    topbar: React.ReactNode;
    tabBar: React.ReactNode;
    artworkBanner?: React.ReactNode;
    isBlocked?: boolean;
  }) => (
    <div data-testid="app-shell" data-blocked={String(isBlocked ?? false)}>
      <div data-testid="sidebar-slot">{sidebar}</div>
      <div data-testid="topbar-slot">{topbar}</div>
      <div data-testid="tabbar-slot">{tabBar}</div>
      {artworkBanner && (
        <div data-testid="artwork-banner-slot">{artworkBanner}</div>
      )}
      <div data-testid="content-slot">{children}</div>
    </div>
  ),
}));

jest.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

jest.mock("@/components/layout/topbar/topbar", () => ({
  Topbar: () => <div data-testid="topbar" />,
}));

jest.mock("@/components/layout/TabBar", () => ({
  TabBar: () => <div data-testid="tab-bar" />,
}));

jest.mock("@/components/features/sync/RevalidationProgressBar", () => ({
  RevalidationProgressBar: () => <div data-testid="revalidation-bar" />,
}));

import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";
import { useOperationStore } from "@/store/useOperationStore";

const mockStore = useFolderConfigStore as jest.Mock;
const mockOperationStore = useOperationStore as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.mockReturnValue({ folderConfig: VALID_CONFIG });
  mockOperationStore.mockReturnValue({ operationInProgress: null });
});

describe("AppLayout — structure (MFM-397)", () => {
  it("renders without crashing", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
  });

  it("renders the AppShell", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
  });

  it("renders the Sidebar inside the shell", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the Topbar inside the shell", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("topbar")).toBeInTheDocument();
  });

  it("renders the TabBar inside the shell", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("tab-bar")).toBeInTheDocument();
  });

  it("renders children inside the content slot", () => {
    render(
      <AppLayout>
        <p data-testid="child">content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("calls useFolderConfigGuard on render", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(mockGuard).toHaveBeenCalled();
  });

  it("renders the RevalidationProgressBar in the artworkBanner slot", () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("revalidation-bar")).toBeInTheDocument();
  });
});

describe("AppLayout — shell blocking (MFM-382, MFM-501)", () => {
  it("passes isBlocked=false to AppShell when no operation is in progress", () => {
    mockOperationStore.mockReturnValue({ operationInProgress: null });
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("app-shell")).toHaveAttribute(
      "data-blocked",
      "false",
    );
  });

  it("passes isBlocked=true to AppShell when sync is in progress", () => {
    mockOperationStore.mockReturnValue({ operationInProgress: "sync" });
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("app-shell")).toHaveAttribute(
      "data-blocked",
      "true",
    );
  });

  it("passes isBlocked=false to AppShell when revalidation is in progress", () => {
    mockOperationStore.mockReturnValue({ operationInProgress: "revalidation" });
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("app-shell")).toHaveAttribute(
      "data-blocked",
      "false",
    );
  });
});

describe("AppLayout — path validation (MFM-388)", () => {
  it("calls validateFolderPath for downloadsPath when config is present", async () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    await Promise.resolve();
    expect(mockValidate).toHaveBeenCalledWith(VALID_CONFIG.downloadsPath);
  });

  it("calls validateFolderPath for libraryPath when config is present", async () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    await Promise.resolve();
    expect(mockValidate).toHaveBeenCalledWith(VALID_CONFIG.libraryPath);
  });

  it("does not call validateFolderPath when folderConfig is null", async () => {
    mockStore.mockReturnValue({ folderConfig: null });
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    );
    await Promise.resolve();
    expect(mockValidate).not.toHaveBeenCalled();
  });
});
