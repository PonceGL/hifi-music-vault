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

jest.mock("@/lib/validateFolderPath", () => ({
  validateFolderPath: (path: string) => mockValidate(path),
}));

jest.mock("@/components/layout/app-shell/app-shell", () => ({
  AppShell: ({
    children,
    sidebar,
    topbar,
    tabBar,
  }: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    topbar: React.ReactNode;
    tabBar: React.ReactNode;
  }) => (
    <div data-testid="app-shell">
      <div data-testid="sidebar-slot">{sidebar}</div>
      <div data-testid="topbar-slot">{topbar}</div>
      <div data-testid="tabbar-slot">{tabBar}</div>
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

import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";

const mockStore = useFolderConfigStore as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.mockReturnValue({ folderConfig: VALID_CONFIG });
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
