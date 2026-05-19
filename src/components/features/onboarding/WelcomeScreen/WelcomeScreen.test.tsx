import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WelcomeScreen } from "./index";
import { ONBOARDING_STRINGS } from "../constants";

describe("WelcomeScreen", () => {
  it("renders app name and tagline", () => {
    render(<WelcomeScreen onNext={jest.fn()} />);
    expect(
      screen.getByText(ONBOARDING_STRINGS.welcome.appName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ONBOARDING_STRINGS.welcome.tagline),
    ).toBeInTheDocument();
  });

  it("renders all feature bullets", () => {
    render(<WelcomeScreen onNext={jest.fn()} />);
    ONBOARDING_STRINGS.welcome.features.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it("renders the start button with correct label", () => {
    render(<WelcomeScreen onNext={jest.fn()} />);
    expect(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.welcome.startButton,
      }),
    ).toBeInTheDocument();
  });

  it("calls onNext when start button is clicked", async () => {
    const onNext = jest.fn();
    render(<WelcomeScreen onNext={onNext} />);

    await userEvent.click(
      screen.getByRole("button", {
        name: ONBOARDING_STRINGS.welcome.startButton,
      }),
    );

    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
