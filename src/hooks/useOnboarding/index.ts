"use client";

import { useState } from "react";

const TRANSITION_DURATION_MS = 300;

export interface UseOnboardingReturn {
  step: 0 | 1;
  goNext: () => void;
  goBack: () => void;
  isTransitioning: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const [step, setStep] = useState<0 | 1>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function transition(nextStep: 0 | 1): void {
    setIsTransitioning(true);
    setStep(nextStep);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION_MS);
  }

  function goNext(): void {
    if (step === 0) transition(1);
  }

  function goBack(): void {
    if (step === 1) transition(0);
  }

  return { step, goNext, goBack, isTransitioning };
}
