import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderConfigScreen } from "./index";
import { ONBOARDING_STRINGS } from "../constants";

jest.mock("../FolderPickerField", () => ({
  FolderPickerField: ({
    label,
    onSelect,
    validationState,
  }: {
    label: string;
    onSelect: (path: string) => void;
    validationState: string;
  }) => (
    <div>
      <span>{label}</span>
      <span data-testid={`state-${label}`}>{validationState}</span>
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
  });

  it("renders title and both folder fields", () => {
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.title)
    ).toBeInTheDocument();
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.downloads.label)
    ).toBeInTheDocument();
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.library.label)
    ).toBeInTheDocument();
  });

  it("renders submit button as disabled when no folders are selected", () => {
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.submitButton,
      })
    ).toBeDisabled();
  });

  it("renders back button", () => {
    render(<FolderConfigScreen {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.backButton,
      })
    ).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", async () => {
    const onBack = jest.fn();
    render(<FolderConfigScreen {...defaultProps} onBack={onBack} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.folderConfig.backButton,
      })
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("submit button remains disabled until both fields are valid", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, writable: true }),
    });

    render(<FolderConfigScreen {...defaultProps} />);

    const submitBtn = screen.getByRole("button", {
      name: ONBOARDING_STRINGS.folderConfig.submitButton,
    });
    expect(submitBtn).toBeDisabled();

    await userEvent.click(
      screen.getByRole("button", {
        name: `Elegir ${ONBOARDING_STRINGS.folderConfig.downloads.label}`,
      })
    );

    expect(submitBtn).toBeDisabled();
  });
});
