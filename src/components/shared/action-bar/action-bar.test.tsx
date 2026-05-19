import { fireEvent, render, screen } from "@testing-library/react";
import { Trash2, Download } from "lucide-react";
import { ActionBar } from "./action-bar";
import { CLEAR_SELECTION_LABEL, getSelectionLabel } from "./constants";
import type { ActionBarAction } from "./action-bar";

const MOCK_ACTIONS: ActionBarAction[] = [
  {
    label: "Exportar",
    icon: Download,
    onClick: jest.fn(),
    variant: "default",
  },
  {
    label: "Eliminar",
    icon: Trash2,
    onClick: jest.fn(),
    variant: "destructive",
  },
];

function renderActionBar(selectedCount = 2, actions = MOCK_ACTIONS) {
  const onClearSelection = jest.fn();
  const utils = render(
    <ActionBar
      selectedCount={selectedCount}
      actions={actions}
      onClearSelection={onClearSelection}
    />,
  );
  return { ...utils, onClearSelection };
}

describe("ActionBar — visibility", () => {
  it("is hidden when selectedCount is 0", () => {
    const { container } = renderActionBar(0);
    const bar = container.firstChild as HTMLElement;
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar.className).toContain("translate-y-full");
  });

  it("is visible when selectedCount is greater than 0", () => {
    const { container } = renderActionBar(3);
    const bar = container.firstChild as HTMLElement;
    expect(bar).toHaveAttribute("aria-hidden", "false");
    expect(bar.className).toContain("translate-y-0");
  });
});

describe("ActionBar — selection count label", () => {
  it("shows singular label for 1 item", () => {
    renderActionBar(1);
    expect(screen.getByText(getSelectionLabel(1))).toBeInTheDocument();
  });

  it("shows plural label for multiple items", () => {
    renderActionBar(5);
    expect(screen.getByText(getSelectionLabel(5))).toBeInTheDocument();
  });

  it("includes the check mark in the label", () => {
    renderActionBar(2);
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  });
});

describe("ActionBar — actions", () => {
  it("renders all action buttons", () => {
    renderActionBar();
    expect(
      screen.getByRole("button", { name: "Exportar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Eliminar" }),
    ).toBeInTheDocument();
  });

  it("calls the action onClick when clicked", () => {
    const onClick = jest.fn();
    render(
      <ActionBar
        selectedCount={2}
        actions={[{ label: "Test", icon: Download, onClick }]}
        onClearSelection={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the cancel button", () => {
    renderActionBar();
    expect(
      screen.getByRole("button", { name: CLEAR_SELECTION_LABEL }),
    ).toBeInTheDocument();
  });

  it("calls onClearSelection when cancel button is clicked", () => {
    const { onClearSelection } = renderActionBar();
    fireEvent.click(
      screen.getByRole("button", { name: CLEAR_SELECTION_LABEL }),
    );
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });
});

describe("ActionBar — getSelectionLabel", () => {
  it("returns singular form for count 1", () => {
    expect(getSelectionLabel(1)).toContain("archivo seleccionado");
    expect(getSelectionLabel(1)).not.toContain("archivos");
  });

  it("returns plural form for count > 1", () => {
    expect(getSelectionLabel(2)).toContain("archivos seleccionados");
    expect(getSelectionLabel(10)).toContain("archivos seleccionados");
  });

  it("includes the count number in the label", () => {
    expect(getSelectionLabel(7)).toContain("7");
  });
});
