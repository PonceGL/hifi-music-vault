import type { ReactElement } from "react";
import { Music, Library, ListMusic, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STRINGS } from "../constants";

const FEATURE_ICONS = [Library, ListMusic, Tag] as const;

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps): ReactElement {
  const { welcome } = ONBOARDING_STRINGS;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle">
            <Music className="h-8 w-8 text-accent" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              {welcome.appName}
            </h1>
            <p className="text-base text-text-secondary">{welcome.tagline}</p>
          </div>
        </div>

        <div
          role="separator"
          aria-hidden="true"
          className="h-px w-full bg-border"
        />

        <ul className="flex w-full flex-col gap-4" aria-label="Funcionalidades">
          {welcome.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <li key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-subtle">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold text-text-primary">
                    {feature.title}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {feature.description}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <Button size="lg" className="w-full" onClick={onNext}>
          {welcome.startButton}
        </Button>
      </div>
    </div>
  );
}
