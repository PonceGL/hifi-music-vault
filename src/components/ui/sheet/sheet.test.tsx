import { fireEvent, render, screen } from "@testing-library/react";
import { Sheet } from "./sheet";
import { SheetClose } from "./sheet-close";
import { SheetContent } from "./sheet-content";
import { SheetDescription } from "./sheet-description";
import { SheetFooter } from "./sheet-footer";
import { SheetHeader } from "./sheet-header";
import { SheetTitle } from "./sheet-title";
import { SheetTrigger } from "./sheet-trigger";

function TestSheet() {
  return (
    <Sheet>
      <SheetTrigger>Open panel</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panel title</SheetTitle>
          <SheetDescription>Panel description</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("renders the trigger without errors", () => {
    render(<TestSheet />);
    expect(screen.getByText("Open panel")).toBeInTheDocument();
  });

  it("sheet content is not visible when closed", () => {
    render(<TestSheet />);
    expect(screen.queryByText("Panel title")).not.toBeInTheDocument();
  });

  it("opens and shows content when trigger is clicked", () => {
    render(<TestSheet />);
    fireEvent.click(screen.getByText("Open panel"));
    expect(screen.getByText("Panel title")).toBeInTheDocument();
  });

  it("renders SheetTitle inside open sheet", () => {
    render(<TestSheet />);
    fireEvent.click(screen.getByText("Open panel"));
    expect(
      screen.getByRole("heading", { name: "Panel title" }),
    ).toBeInTheDocument();
  });

  it("renders SheetDescription inside open sheet", () => {
    render(<TestSheet />);
    fireEvent.click(screen.getByText("Open panel"));
    expect(screen.getByText("Panel description")).toBeInTheDocument();
  });

  it("renders SheetFooter with SheetClose button", () => {
    render(<TestSheet />);
    fireEvent.click(screen.getByText("Open panel"));
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("closes the sheet when SheetClose is clicked", () => {
    render(<TestSheet />);
    fireEvent.click(screen.getByText("Open panel"));
    expect(screen.getByText("Panel title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Panel title")).not.toBeInTheDocument();
  });
});

describe("SheetHeader", () => {
  it("renders children", () => {
    render(<SheetHeader>Header content</SheetHeader>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });
});

describe("SheetFooter", () => {
  it("renders children", () => {
    render(<SheetFooter>Footer content</SheetFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
