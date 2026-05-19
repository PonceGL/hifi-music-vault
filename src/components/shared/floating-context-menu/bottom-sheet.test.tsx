import { fireEvent, render, screen } from "@testing-library/react";
import { Download, Trash2 } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { BOTTOM_SHEET_ARIA_LABEL, CANCEL_LABEL } from "./constants";
import type { ContextMenuAction } from "./floating-context-menu";

const MOCK_ACTIONS: ContextMenuAction[] = [
  { label: "Exportar", icon: Download, onClick: jest.fn(), variant: "default" },
  {
    label: "Eliminar",
    icon: Trash2,
    onClick: jest.fn(),
    variant: "destructive",
  },
];

function renderBottomSheet(isOpen = true, actions = MOCK_ACTIONS) {
  const onClose = jest.fn();
  const utils = render(
    <BottomSheet isOpen={isOpen} actions={actions} onClose={onClose} />,
  );
  return { ...utils, onClose };
}

describe("BottomSheet — visibility", () => {
  it("is hidden when isOpen is false", () => {
    const { container } = renderBottomSheet(false);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("opacity-0");
  });

  it("is visible when isOpen is true", () => {
    const { container } = renderBottomSheet(true);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "false");
    expect(root.className).toContain("opacity-100");
  });
});

describe("BottomSheet — actions", () => {
  it("renders all action items", () => {
    renderBottomSheet();
    expect(
      screen.getByRole("menuitem", { name: "Exportar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Eliminar" }),
    ).toBeInTheDocument();
  });

  it("calls action onClick and onClose when an action is clicked", () => {
    const onClick = jest.fn();
    const onClose = jest.fn();
    render(
      <BottomSheet
        isOpen
        actions={[{ label: "Test", onClick, variant: "default" }]}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Test" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the cancel button", () => {
    renderBottomSheet();
    expect(
      screen.getByRole("button", { name: CANCEL_LABEL }),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    const { onClose } = renderBottomSheet();
    fireEvent.click(screen.getByRole("button", { name: CANCEL_LABEL }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("BottomSheet — accessibility", () => {
  it("renders menu with correct aria-label", () => {
    renderBottomSheet();
    expect(
      screen.getByRole("menu", { name: BOTTOM_SHEET_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("destructive action has health-red color class", () => {
    renderBottomSheet();
    const destructiveItem = screen.getByRole("menuitem", { name: "Eliminar" });
    expect(destructiveItem.className).toContain("health-red");
  });

  it("default action does not have health-red color class", () => {
    renderBottomSheet();
    const defaultItem = screen.getByRole("menuitem", { name: "Exportar" });
    expect(defaultItem.className).not.toContain("health-red");
  });
});

describe("BottomSheet — keyboard", () => {
  it("calls onClose when Escape is pressed while open", () => {
    const { onClose } = renderBottomSheet(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on Escape when closed", () => {
    const { onClose } = renderBottomSheet(false);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("BottomSheet — overlay click", () => {
  it("calls onClose when overlay is clicked", () => {
    const { onClose } = renderBottomSheet(true);
    const overlay = document.querySelector(
      '[aria-hidden="true"].absolute.inset-0',
    );
    if (overlay) fireEvent.mouseDown(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
