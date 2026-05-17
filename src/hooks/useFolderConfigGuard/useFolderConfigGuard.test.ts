import { renderHook } from "@testing-library/react";
import { useFolderConfigGuard } from "./index";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/hooks/useFolderConfigStore", () => ({
  useFolderConfigStore: jest.fn(),
}));

const mockUseFolderConfigStore = useFolderConfigStore as jest.Mock;

function buildStore(folderConfig: { downloadsPath: string; libraryPath: string } | null) {
  return {
    folderConfig,
    saveFolderConfig: jest.fn(),
    clearFolderConfig: jest.fn(),
  };
}

describe("useFolderConfigGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to onboarding and clears config when folderConfig is null", () => {
    const store = buildStore(null);
    mockUseFolderConfigStore.mockReturnValue(store);

    renderHook(() => useFolderConfigGuard());

    expect(store.clearFolderConfig).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/onboarding");
  });

  it("does not redirect when folderConfig is valid", () => {
    mockUseFolderConfigStore.mockReturnValue(
      buildStore({ downloadsPath: "/downloads", libraryPath: "/music" }),
    );

    renderHook(() => useFolderConfigGuard());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("clears config before redirecting so the stale cookie is removed", () => {
    const store = buildStore(null);
    mockUseFolderConfigStore.mockReturnValue(store);

    renderHook(() => useFolderConfigGuard());

    const clearOrder = store.clearFolderConfig.mock.invocationCallOrder[0];
    const replaceOrder = mockReplace.mock.invocationCallOrder[0];
    expect(clearOrder).toBeLessThan(replaceOrder);
  });
});
