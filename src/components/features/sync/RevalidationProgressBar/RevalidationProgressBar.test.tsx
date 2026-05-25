import { render, screen } from "@testing-library/react";
import { RevalidationProgressBar } from "./index";
import {
  REVALIDATION_BAR_ARIA_LABEL,
  REVALIDATION_BAR_LABEL,
} from "./constants";

const mockUseOperationStore = jest.fn();

jest.mock("@/store/useOperationStore", () => ({
  useOperationStore: () => mockUseOperationStore(),
}));

describe("RevalidationProgressBar — visibilidad", () => {
  it("is visible when operationInProgress is 'revalidation'", () => {
    mockUseOperationStore.mockReturnValue({
      operationInProgress: "revalidation",
    });
    render(<RevalidationProgressBar />);
    const wrapper = screen.getByRole("status", {
      name: REVALIDATION_BAR_ARIA_LABEL,
    });
    expect(wrapper.closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("is hidden when operationInProgress is null", () => {
    mockUseOperationStore.mockReturnValue({ operationInProgress: null });
    render(<RevalidationProgressBar />);
    const wrapper = screen.getByRole("status", {
      hidden: true,
      name: REVALIDATION_BAR_ARIA_LABEL,
    });
    expect(wrapper.closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("is hidden when operationInProgress is 'sync'", () => {
    mockUseOperationStore.mockReturnValue({ operationInProgress: "sync" });
    render(<RevalidationProgressBar />);
    const wrapper = screen.getByRole("status", {
      hidden: true,
      name: REVALIDATION_BAR_ARIA_LABEL,
    });
    expect(wrapper.closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

describe("RevalidationProgressBar — contenido", () => {
  beforeEach(() => {
    mockUseOperationStore.mockReturnValue({
      operationInProgress: "revalidation",
    });
  });

  it("shows the label text", () => {
    render(<RevalidationProgressBar />);
    expect(screen.getByText(REVALIDATION_BAR_LABEL)).toBeInTheDocument();
  });

  it("renders a status role element", () => {
    render(<RevalidationProgressBar />);
    expect(
      screen.getByRole("status", { name: REVALIDATION_BAR_ARIA_LABEL }),
    ).toBeInTheDocument();
  });
});
