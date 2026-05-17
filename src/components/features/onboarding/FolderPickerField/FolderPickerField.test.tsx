import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderPickerField } from "./index";
import { ONBOARDING_STRINGS } from "../constants";

jest.mock("@/lib/openFolderDialog", () => ({
  openFolderDialog: jest.fn(),
}));

import { openFolderDialog } from "@/lib/openFolderDialog";
const mockOpenFolderDialog = openFolderDialog as jest.Mock;

const defaultProps = {
  label: "Carpeta de Descargas",
  value: null,
  onSelect: jest.fn(),
  validationState: "idle" as const,
  prompt: "Selecciona carpeta",
};

describe("FolderPickerField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and choose button", () => {
    render(<FolderPickerField {...defaultProps} />);
    expect(screen.getByText("Carpeta de Descargas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Elegir/i })).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(
      <FolderPickerField
        {...defaultProps}
        description="Descripción de prueba"
      />,
    );
    expect(screen.getByText("Descripción de prueba")).toBeInTheDocument();
  });

  it("shows placeholder when value is null and state is idle", () => {
    render(<FolderPickerField {...defaultProps} />);
    expect(
      screen.getByText(ONBOARDING_STRINGS.folderConfig.downloads.placeholder),
    ).toBeInTheDocument();
  });

  it("shows path in mono font when value is set and state is valid", () => {
    render(
      <FolderPickerField
        {...defaultProps}
        value="/Users/test/Downloads"
        validationState="valid"
      />,
    );
    expect(screen.getByText("/Users/test/Downloads")).toBeInTheDocument();
  });

  it("shows spinner when validationState is loading", () => {
    render(<FolderPickerField {...defaultProps} validationState="loading" />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows validation message when state is valid", () => {
    render(
      <FolderPickerField
        {...defaultProps}
        validationState="valid"
        validationMessage="247 archivos de audio"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "247 archivos de audio",
    );
  });

  it("shows error message when state is error", () => {
    render(
      <FolderPickerField
        {...defaultProps}
        validationState="error"
        validationMessage={ONBOARDING_STRINGS.validation.sameFolderError}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      ONBOARDING_STRINGS.validation.sameFolderError,
    );
  });

  it("calls onSelect with the path returned by openFolderDialog", async () => {
    const onSelect = jest.fn();
    mockOpenFolderDialog.mockResolvedValueOnce("/Users/test/Downloads");

    render(<FolderPickerField {...defaultProps} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /Elegir/i }));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith("/Users/test/Downloads");
    });
  });

  it("does not call onSelect when openFolderDialog returns null (dialog cancelled)", async () => {
    const onSelect = jest.fn();
    mockOpenFolderDialog.mockResolvedValueOnce(null);

    render(<FolderPickerField {...defaultProps} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /Elegir/i }));

    await waitFor(() => {
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  it("disables the choose button when validationState is loading", () => {
    render(<FolderPickerField {...defaultProps} validationState="loading" />);
    expect(screen.getByRole("button", { name: /Elegir/i })).toBeDisabled();
  });
});
