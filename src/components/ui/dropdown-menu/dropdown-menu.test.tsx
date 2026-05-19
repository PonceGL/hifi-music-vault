import { fireEvent, render, screen } from "@testing-library/react";
import { DropdownMenu } from "./dropdown-menu";
import { DropdownMenuCheckboxItem } from "./dropdown-menu-checkbox-item";
import { DropdownMenuContent } from "./dropdown-menu-content";
import { DropdownMenuItem } from "./dropdown-menu-item";
import { DropdownMenuLabel } from "./dropdown-menu-label";
import { DropdownMenuSeparator } from "./dropdown-menu-separator";
import { DropdownMenuShortcut } from "./dropdown-menu-shortcut";
import { DropdownMenuTrigger } from "./dropdown-menu-trigger";

function TestMenuOpen() {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>
          Notifications
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TestMenuClosed() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("renders the trigger without errors", () => {
    render(<TestMenuClosed />);
    expect(screen.getByText("Options")).toBeInTheDocument();
  });

  it("menu content is not visible when closed", () => {
    render(<TestMenuClosed />);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("renders DropdownMenuContent when open", () => {
    render(<TestMenuOpen />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders DropdownMenuLabel inside open menu", () => {
    render(<TestMenuOpen />);
    expect(screen.getByText("My account")).toBeInTheDocument();
  });

  it("renders multiple DropdownMenuItems inside open menu", () => {
    render(<TestMenuOpen />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders DropdownMenuCheckboxItem inside open menu", () => {
    render(<TestMenuOpen />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("DropdownMenuItem is clickable", () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByText("Profile"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("DropdownMenuShortcut", () => {
  it("renders shortcut text", () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});
