import type { ReactElement } from "react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";

export const metadata = {
  title: "Bienvenido — Music Files Manager",
};

export default function OnboardingPage(): ReactElement {
  return <OnboardingLayout />;
}
