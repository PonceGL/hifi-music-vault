import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryProvider } from "./index";

function QueryClientInspector(): null {
  const client = useQueryClient();
  const defaults = client.getDefaultOptions().queries;
  return (
    <output data-testid="defaults" data-defaults={JSON.stringify(defaults)} />
  ) as unknown as null;
}

describe("QueryProvider", () => {
  it("renders children inside the provider", () => {
    render(
      <QueryProvider>
        <span>child content</span>
      </QueryProvider>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("exposes a QueryClient to descendants via context", () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    expect(screen.getByTestId("defaults")).toBeInTheDocument();
  });

  it("configures staleTime to 2 minutes", () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    const defaults = JSON.parse(
      screen.getByTestId("defaults").getAttribute("data-defaults") ?? "{}",
    ) as { staleTime?: number };
    expect(defaults.staleTime).toBe(1000 * 60 * 2);
  });

  it("configures gcTime to 10 minutes", () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    const defaults = JSON.parse(
      screen.getByTestId("defaults").getAttribute("data-defaults") ?? "{}",
    ) as { gcTime?: number };
    expect(defaults.gcTime).toBe(1000 * 60 * 10);
  });

  it("configures retry to 1", () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    const defaults = JSON.parse(
      screen.getByTestId("defaults").getAttribute("data-defaults") ?? "{}",
    ) as { retry?: number };
    expect(defaults.retry).toBe(1);
  });

  it("configures refetchOnWindowFocus to false", () => {
    render(
      <QueryProvider>
        <QueryClientInspector />
      </QueryProvider>,
    );
    const defaults = JSON.parse(
      screen.getByTestId("defaults").getAttribute("data-defaults") ?? "{}",
    ) as { refetchOnWindowFocus?: boolean };
    expect(defaults.refetchOnWindowFocus).toBe(false);
  });
});
