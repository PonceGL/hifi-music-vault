import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderConfigScreen } from "./index";
import { ONBOARDING_STRINGS } from "../constants";

const mockHandleDownloadsSelect = jest.fn();
const mockHandleLibrarySelect = jest.fn();
const mockHandleSubmit = jest.fn();

const defaultHookReturn = {
  downloads: { path: null, state: "idle" as const, message: undefined },
  library: { path: null, state: "idle" as const, message: undefined },
  bothValid: false,
  handleDownloadsSelect: mockHandleDownloadsSelect,
  handleLibrarySelect: mockHandleLibrarySelect,
  handleSubmit: mockHandleSubmit,
};

let mockHookReturn = { ...defaultHookReturn };

jest.mock("@/hooks/useFolderConfig", () => ({
  useFolderConfig: () => mockHookReturn,
}));

jest.mock("../FolderPickerField", () => ({
  FolderPickerField: ({
    label,
    onSelect,
  }: {
    label: string;
    onSelect: (path: string) => void;
  }) => (
    <div>
      <span>{label}</span>
      <button onClick={() => onSelect("/test/path")}>Elegir {label}</button>
    </div>
  ),
}));

const defaultProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
};

describe("FolderConfigScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookReturn = { ...defaultHookReturn };
  });

  it("renders title and both folder field labels", () => {
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.title),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.downloads.label),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.library.label),
    ).toBeInTheDocument();
  });

  it("renders submit button as disabled when bothValid is false", () => {
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.submitButton,
      }),
    ).toBeDisabled();
  });

  it("renders submit button as enabled when bothValid is true", () => {
    mockHookReturn = { ...defaultHookReturn, bothValid: true };
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.submitButton,
      }),
    ).not.toBeDisabled();
  });

  it("calls onBack when back button is clicked", async () => {
    const onBack = jest.fn();
    render(<FolderConfigScreen {...defaultProps} onBack={onBack} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.backButton,
      }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls handleSubmit from hook when submit button is clicked", async () => {
    mockHookReturn = { ...defaultHookReturn, bothValid: true };
    render(<FolderConfigScreen {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.submitButton,
      }),
    );
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls handleDownloadsSelect when downloads folder is selected", async () => {
    render(<FolderConfigScreen {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `Elegir ${ONBOARDING_STRINGS.folderConfig.downloads.label}`,
      }),
    );
    expect(mockHandleDownloadsSelect).toHaveBeenCalledWith("/test/path");
  });

  it("calls handleLibrarySelect when library folder is selected", async () => {
    render(<FolderConfigScreen {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `Elegir ${ONBOARDING_STRINGS.folderConfig.library.label}`,
      }),
    );
    expect(mockHandleLibrarySelect).toHaveBeenCalledWith("/test/path");
  });
});
