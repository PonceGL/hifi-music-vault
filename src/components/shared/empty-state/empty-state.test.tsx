import { fireEvent, render, screen } from "@testing-library/react";
import { Music } from "lucide-react";
import { EmptyState } from "./empty-state";

const BASE_PROPS = {
  icon: Music,
  title: "Biblioteca vacía",
  description: "Agrega archivos de audio para comenzar",
};

describe("EmptyState", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.getByText("Biblioteca vacía")).toBeInTheDocument();
    });

    it("renders the description", () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(
        screen.getByText("Agrega archivos de audio para comenzar"),
      ).toBeInTheDocument();
    });

    it("renders the icon as aria-hidden", () => {
      render(<EmptyState {...BASE_PROPS} />);
      const svg = document.querySelector("svg[aria-hidden='true']");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("without action", () => {
    it("does not render a button when action prop is omitted", () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("with action", () => {
    const action = { label: "Sincronizar ahora", onClick: jest.fn() };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders the action button when action prop is provided", () => {
      render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(
        screen.getByRole("button", { name: /sincronizar ahora/i }),
      ).toBeInTheDocument();
    });

    it("calls action.onClick when the button is clicked", () => {
      render(<EmptyState {...BASE_PROPS} action={action} />);
      fireEvent.click(screen.getByRole("button", { name: /sincronizar ahora/i }));
      expect(action.onClick).toHaveBeenCalledTimes(1);
    });
  });
});
