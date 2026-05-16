import type { ReactElement } from "react";

export default function OnboardingLoading(): ReactElement {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-surface-elevated" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}
