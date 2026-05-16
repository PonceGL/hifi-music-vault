"use client";

import type { ReactElement } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { WelcomeScreen } from "../WelcomeScreen";
import { FolderConfigScreen } from "../FolderConfigScreen";

export function OnboardingLayout(): ReactElement {
  const { step, goNext, goBack, isTransitioning, complete } = useOnboarding();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{
          width: "200%",
          transform: step === 0 ? "translateX(0%)" : "translateX(-50%)",
        }}
        aria-live="polite"
      >
        <div
          className="h-full w-1/2"
          aria-hidden={step !== 0}
          style={{
            pointerEvents: step !== 0 || isTransitioning ? "none" : "auto",
          }}
        >
          <WelcomeScreen onNext={goNext} />
        </div>

        <div
          className="h-full w-1/2"
          aria-hidden={step !== 1}
          style={{
            pointerEvents: step !== 1 || isTransitioning ? "none" : "auto",
          }}
        >
          <FolderConfigScreen onBack={goBack} onSubmit={complete} />
        </div>
      </div>
    </div>
  );
}
