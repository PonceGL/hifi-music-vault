import { render, screen } from "@testing-library/react";
import { SearchInput } from "./search-input";
import { SEARCH_PLACEHOLDER, SEARCH_SHORTCUT_LABEL } from "./constants";

describe("SearchInput", () => {
  it("renders a search input", () => {
    render(<SearchInput />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("uses the SEARCH_PLACEHOLDER constant as placeholder", () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("renders the Search icon (aria-hidden)", () => {
    render(<SearchInput />);
    const svg = document.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeInTheDocument();
  });

  it("renders the shortcut hint", () => {
    render(<SearchInput />);
    expect(screen.getByText(SEARCH_SHORTCUT_LABEL)).toBeInTheDocument();
  });

  it("forwards additional props to the underlying input", () => {
    render(<SearchInput aria-label="Buscar pistas" />);
    expect(
      screen.getByRole("searchbox", { name: "Buscar pistas" }),
    ).toBeInTheDocument();
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<SearchInput disabled />);
    expect(screen.getByRole("searchbox")).toBeDisabled();
  });
});
