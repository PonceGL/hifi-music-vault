import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "./dialog";
import { DialogClose } from "./dialog-close";
import { DialogContent } from "./dialog-content";
import { DialogDescription } from "./dialog-description";
import { DialogFooter } from "./dialog-footer";
import { DialogHeader } from "./dialog-header";
import { DialogTitle } from "./dialog-title";
import { DialogTrigger } from "./dialog-trigger";

function TestDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
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
