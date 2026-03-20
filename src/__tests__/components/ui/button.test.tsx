import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button component", () => {
  it("should_render_button_with_default_text", () => {
    // Arrange
    const buttonText = "Click me"

    // Act
    render(<Button>{buttonText}</Button>)
    const buttonElement = screen.getByRole("button", { name: buttonText })

    // Assert
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveClass("bg-primary")
    expect(buttonElement).toHaveClass("h-12") // default size
  })

  it("should_call_onClick_when_clicked", () => {
    // Arrange
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const buttonElement = screen.getByRole("button", { name: "Click me" })

    // Act
    fireEvent.click(buttonElement)

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should_apply_destructive_classes_when_variant_is_destructive", () => {
    // Arrange & Act
    render(<Button variant="destructive">Destructive</Button>)
    const buttonElement = screen.getByRole("button", { name: "Destructive" })

    // Assert
    expect(buttonElement).toHaveClass("bg-red-50")
    expect(buttonElement).toHaveClass("text-red-600")
  })

  it("should_render_as_child_when_asChild_prop_is_passed", () => {
    // Arrange & Act
    render(
      <Button asChild>
        <a href="/test-path">Link Button</a>
      </Button>
    )
    const linkElement = screen.getByRole("link", { name: "Link Button" })

    // Assert
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute("href", "/test-path")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("should_be_disabled_and_prevent_clicks_when_disabled_is_true", () => {
    // Arrange
    const handleClick = vi.fn()

    // Act
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    const buttonElement = screen.getByRole("button", { name: "Disabled" })
    fireEvent.click(buttonElement)

    // Assert
    expect(buttonElement).toBeDisabled()
    expect(handleClick).not.toHaveBeenCalled()
  })
})
