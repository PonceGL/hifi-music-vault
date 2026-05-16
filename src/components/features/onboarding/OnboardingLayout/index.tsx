"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { WelcomeScreen } from "../WelcomeScreen";
import { FolderConfigScreen } from "../FolderConfigScreen";
import type { FolderConfig } from "@/types/settings";

const FOLDER_CONFIG_STORAGE_KEY = "folder-config";

export function OnboardingLayout(): ReactElement {
  const router = useRouter();
  const { step, goNext, goBack, isTransitioning } = useOnboarding();

  function handleSubmit(config: FolderConfig): void {
    localStorage.setItem(FOLDER_CONFIG_STORAGE_KEY, JSON.stringify(config));
    router.push("/library");
  }

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
          style={{ pointerEvents: step !== 0 || isTransitioning ? "none" : "auto" }}
        >
          <WelcomeScreen onNext={goNext} />
        </div>

        <div
          className="h-full w-1/2"
          aria-hidden={step !== 1}
          style={{ pointerEvents: step !== 1 || isTransitioning ? "none" : "auto" }}
        >
          <FolderConfigScreen onBack={goBack} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
