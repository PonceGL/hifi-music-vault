import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "./dialog";
import { DialogClose } from "./dialog-close";
import { DialogContent } from "./dialog-content";
import { DialogDescription } from "./dialog-description";
import { DialogFooter } from "./dialog-footer";
import { DialogHeader } from "./dialog-header";
import { DialogTitle } from "./dialog-title";
import { DialogTrigger } from "./dialog-trigger";
import type { DialogVariant } from "./dialog-constants";

function TestDialog({ variant }: { variant?: DialogVariant } = {}) {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent variant={variant}>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ControlledDialog({
  variant,
  onOpenChange,
}: {
  variant?: DialogVariant;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent variant={variant}>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>Dialog description</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("renders the trigger without errors", () => {
    render(<TestDialog />);
    expect(screen.getByText("Open dialog")).toBeInTheDocument();
  });

  it("dialog content is not visible when closed", () => {
    render(<TestDialog />);
    expect(screen.queryByText("Confirm action")).not.toBeInTheDocument();
  });

  it("opens and shows content when trigger is clicked", () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
  });

  it("renders DialogTitle inside open dialog", () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByRole("heading", { name: "Confirm action" })).toBeInTheDocument();
  });

  it("renders DialogDescription inside open dialog", () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("renders DialogFooter with a cancel button", () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("closes the dialog when DialogClose is clicked", () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Confirm action")).not.toBeInTheDocument();
  });

  it("has role='dialog' when open", () => {
    render(<ControlledDialog />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("is labelled by the title via aria-labelledby", () => {
    render(<ControlledDialog />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("is described via aria-describedby", () => {
    render(<ControlledDialog />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});

describe("DialogHeader", () => {
  it("renders children", () => {
    render(<DialogHeader>Header content</DialogHeader>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });
});

describe("DialogFooter", () => {
  it("renders children", () => {
    render(<DialogFooter>Footer content</DialogFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});

describe("DialogContent — close button visibility", () => {
  it("shows close button for informative variant", () => {
    render(<ControlledDialog variant="informative" />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("shows close button for confirmation variant", () => {
    render(<ControlledDialog variant="confirmation" />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("hides close button for critical variant", () => {
    render(<ControlledDialog variant="critical" />);
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("hides close button for in-progress variant", () => {
    render(<ControlledDialog variant="in-progress" />);
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("hides close button when hideCloseButton is true on informative variant", () => {
    render(
      <Dialog open>
        <DialogContent variant="informative" hideCloseButton>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("shows close button when hideCloseButton is false on critical variant", () => {
    render(
      <Dialog open>
        <DialogContent variant="critical" hideCloseButton={false}>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("DialogContent — Escape key behavior", () => {
  it("calls onOpenChange(false) on Escape for informative variant", () => {
    const onOpenChange = jest.fn();
    render(<ControlledDialog variant="informative" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) on Escape for confirmation variant", () => {
    const onOpenChange = jest.fn();
    render(<ControlledDialog variant="confirmation" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not call onOpenChange on Escape for critical variant", () => {
    const onOpenChange = jest.fn();
    render(<ControlledDialog variant="critical" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does not call onOpenChange on Escape for in-progress variant", () => {
    const onOpenChange = jest.fn();
    render(<ControlledDialog variant="in-progress" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("still invokes user onEscapeKeyDown handler for critical variant", () => {
    const onEscapeKeyDown = jest.fn();
    render(
      <Dialog open>
        <DialogContent variant="critical" onEscapeKeyDown={onEscapeKeyDown}>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalled();
  });
});
