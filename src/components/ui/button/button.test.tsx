import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from ".";

describe("Button", () => {
  describe("rendering", () => {
    it("renders its text content", () => {
      render(<Button>Save changes</Button>);
      expect(
        screen.getByRole("button", { name: /save changes/i }),
      ).toBeInTheDocument();
    });

    it("forwards native button props", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("forwards aria attributes", () => {
      render(<Button aria-label="Close dialog">✕</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Close dialog",
      );
    });
  });

  describe("variants", () => {
    it("uses the primary variant by default", () => {
      render(<Button>Confirm</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "primary",
      );
    });

    it("applies the secondary variant", () => {
      render(<Button variant="secondary">Cancel</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "secondary",
      );
    });

    it("applies the destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "destructive",
      );
    });

    it("applies the ghost variant", () => {
      render(<Button variant="ghost">More</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "ghost",
      );
    });

    it("applies the link variant", () => {
      render(<Button variant="link">Learn more</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "link",
      );
    });
  });

  describe("sizes", () => {
    it("uses md size by default", () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    });

    it("applies sm size", () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
    });

    it("applies lg size", () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
    });

    it("applies icon size", () => {
      render(<Button size="icon">✕</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon");
    });
  });

  describe("disabled state", () => {
    it("is disabled when the disabled prop is passed", () => {
      render(<Button disabled>Save changes</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not call onClick when disabled", () => {
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Delete
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("isLoading state", () => {
    it("disables the button when isLoading is true", () => {
      render(<Button isLoading>Saving…</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("renders a spinner when isLoading is true", () => {
      render(<Button isLoading>Saving…</Button>);
      expect(
        screen.getByRole("button").querySelector("[aria-hidden='true']"),
      ).toBeInTheDocument();
    });

    it("does not call onClick when isLoading is true", () => {
      const onClick = jest.fn();
      render(
        <Button isLoading onClick={onClick}>
          Saving…
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
