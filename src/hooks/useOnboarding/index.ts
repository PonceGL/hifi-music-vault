"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FolderConfig } from "@/types/settings";
import { APP_ROUTES } from "@/constants/appRoutes";

const TRANSITION_DURATION_MS = 300;
const FOLDER_CONFIG_STORAGE_KEY = "folder-config";

export interface UseOnboardingReturn {
  step: 0 | 1;
  goNext: () => void;
  goBack: () => void;
  isTransitioning: boolean;
  complete: (config: FolderConfig) => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter();
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

  function complete(config: FolderConfig): void {
    localStorage.setItem(FOLDER_CONFIG_STORAGE_KEY, JSON.stringify(config));
    router.push(APP_ROUTES.library);
  }

  return { step, goNext, goBack, isTransitioning, complete };
}
