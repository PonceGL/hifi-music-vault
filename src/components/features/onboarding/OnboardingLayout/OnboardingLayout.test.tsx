import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingLayout } from "./index";

const mockGoNext = jest.fn();
const mockGoBack = jest.fn();
const mockPush = jest.fn();

let mockStep: 0 | 1 = 0;
let mockIsTransitioning = false;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useOnboarding", () => ({
  useOnboarding: () => ({
    get step() {
      return mockStep;
    },
    goNext: mockGoNext,
    goBack: mockGoBack,
    get isTransitioning() {
      return mockIsTransitioning;
    },
  }),
}));

jest.mock("../WelcomeScreen", () => ({
  WelcomeScreen: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="welcome-screen">
      <button onClick={onNext}>Comenzar</button>
    </div>
  ),
}));

jest.mock("../FolderConfigScreen", () => ({
  FolderConfigScreen: ({
    onBack,
    onSubmit,
  }: {
    onBack: () => void;
    onSubmit: (config: { downloadsPath: string; libraryPath: string }) => void;
  }) => (
    <div data-testid="folder-config-screen">
      <button onClick={onBack}>Volver</button>
      <button
        onClick={() =>
          onSubmit({ downloadsPath: "/downloads", libraryPath: "/library" })
        }
      >
        Empezar
      </button>
    </div>
  ),
}));

describe("OnboardingLayout — step 0", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockStep = 0;
    mockIsTransitioning = false;
  });

  it("renders WelcomeScreen and FolderConfigScreen", () => {
    render(<OnboardingLayout />);
    expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    expect(screen.getByTestId("folder-config-screen")).toBeInTheDocument();
  });

  it("applies translateX(0%) when step is 0", () => {
    render(<OnboardingLayout />);
    const slider = screen.getByTestId("welcome-screen")
      .parentElement as HTMLElement;
    expect(slider.parentElement).toHaveStyle({ transform: "translateX(0%)" });
  });

  it("WelcomeScreen is not aria-hidden in step 0", () => {
    render(<OnboardingLayout />);
    const welcomeWrapper = screen.getByTestId("welcome-screen")
      .parentElement as HTMLElement;
    expect(welcomeWrapper).toHaveAttribute("aria-hidden", "false");
  });

  it("FolderConfigScreen is aria-hidden in step 0", () => {
    render(<OnboardingLayout />);
    const configWrapper = screen.getByTestId("folder-config-screen")
      .parentElement as HTMLElement;
    expect(configWrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("calls goNext when WelcomeScreen's onNext is triggered", async () => {
    render(<OnboardingLayout />);
    await userEvent.click(screen.getByRole("button", { name: "Comenzar" }));
    expect(mockGoNext).toHaveBeenCalledTimes(1);
  });
});

describe("OnboardingLayout — step 1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockStep = 1;
    mockIsTransitioning = false;
  });

  it("applies translateX(-50%) when step is 1", () => {
    render(<OnboardingLayout />);
    const slider = screen.getByTestId("welcome-screen")
      .parentElement as HTMLElement;
    expect(slider.parentElement).toHaveStyle({ transform: "translateX(-50%)" });
  });

  it("WelcomeScreen is aria-hidden in step 1", () => {
    render(<OnboardingLayout />);
    const welcomeWrapper = screen.getByTestId("welcome-screen")
      .parentElement as HTMLElement;
    expect(welcomeWrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("FolderConfigScreen is not aria-hidden in step 1", () => {
    render(<OnboardingLayout />);
    const configWrapper = screen.getByTestId("folder-config-screen")
      .parentElement as HTMLElement;
    expect(configWrapper).toHaveAttribute("aria-hidden", "false");
  });

  it("calls goBack when FolderConfigScreen's onBack is triggered", async () => {
    render(<OnboardingLayout />);
    await userEvent.click(
      screen.getByRole("button", { name: "Volver" })
    );
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it("saves config to localStorage and redirects on submit", async () => {
    render(<OnboardingLayout />);
    await userEvent.click(screen.getByRole("button", { name: "Empezar" }));

    const stored = JSON.parse(localStorage.getItem("folder-config") ?? "{}");
    expect(stored.downloadsPath).toBe("/downloads");
    expect(stored.libraryPath).toBe("/library");
    expect(mockPush).toHaveBeenCalledWith("/library");
  });
});
