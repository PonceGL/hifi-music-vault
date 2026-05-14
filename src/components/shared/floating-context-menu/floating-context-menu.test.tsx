import { fireEvent, render, screen } from "@testing-library/react";
import { Download, Trash2 } from "lucide-react";
import { FloatingContextMenu } from "./floating-context-menu";
import { CONTEXT_MENU_ARIA_LABEL } from "./constants";
import type { ContextMenuAction } from "./floating-context-menu";

const MOCK_ACTIONS: ContextMenuAction[] = [
  { label: "Exportar", icon: Download, onClick: jest.fn(), variant: "default" },
  { label: "Eliminar", icon: Trash2, onClick: jest.fn(), variant: "destructive" },
];

function renderMenu(isOpen = true, actions = MOCK_ACTIONS) {
  const onClose = jest.fn();
  const utils = render(
    <FloatingContextMenu
      trigger={<button type="button">⋯</button>}
      actions={actions}
      isOpen={isOpen}
      onClose={onClose}
    />,
  );
  return { ...utils, onClose };
}

describe("FloatingContextMenu — trigger", () => {
  it("always renders the trigger", () => {
    renderMenu(false);
    expect(screen.getByRole("button", { name: "⋯" })).toBeInTheDocument();
  });
});

describe("FloatingContextMenu — menu visibility", () => {
  it("does not render the menu when isOpen is false", () => {
    renderMenu(false);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the menu when isOpen is true", () => {
    renderMenu(true);
    expect(screen.getByRole("menu", { name: CONTEXT_MENU_ARIA_LABEL })).toBeInTheDocument();
  });
});

describe("FloatingContextMenu — actions", () => {
  it("renders all action items when open", () => {
    renderMenu();
    expect(screen.getByRole("menuitem", { name: "Exportar" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("calls action onClick and onClose when an action is clicked", () => {
    const onClick = jest.fn();
    const onClose = jest.fn();
    render(
      <FloatingContextMenu
        trigger={<button type="button">⋯</button>}
        actions={[{ label: "Test", onClick, variant: "default" }]}
        isOpen
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Test" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("FloatingContextMenu — accessibility", () => {
  it("menu has correct aria-label", () => {
    renderMenu();
    expect(
      screen.getByRole("menu", { name: CONTEXT_MENU_ARIA_LABEL }),
    ).toBeInTheDocument();
  });

  it("destructive action has health-red color class", () => {
    renderMenu();
    const destructiveItem = screen.getByRole("menuitem", { name: "Eliminar" });
    expect(destructiveItem.className).toContain("health-red");
  });

  it("default action does not have health-red color class", () => {
    renderMenu();
    const defaultItem = screen.getByRole("menuitem", { name: "Exportar" });
    expect(defaultItem.className).not.toContain("health-red");
  });
});

describe("FloatingContextMenu — keyboard", () => {
  it("calls onClose when Escape is pressed while open", () => {
    const { onClose } = renderMenu(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on Escape when menu is closed", () => {
    const { onClose } = renderMenu(false);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("FloatingContextMenu — click outside", () => {
  it("calls onClose when clicking outside the menu and trigger", () => {
    const { onClose } = renderMenu(true);
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the menu", () => {
    const { onClose } = renderMenu(true);
    const menuItem = screen.getByRole("menuitem", { name: "Exportar" });
    fireEvent.mouseDown(menuItem);
    expect(onClose).not.toHaveBeenCalled();
  });
});
