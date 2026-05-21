import type { ReactElement } from "react";
import { Inbox, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LibraryStatus } from "@/hooks/useLibraryStatus";
import { LIBRARY_EMPTY_STATE_STRINGS as S } from "./constants";

interface LibraryEmptyStateProps {
  variant: LibraryStatus;
  downloadsCount?: number;
  downloadsPath?: string;
  onSync?: () => void;
  onChangeFolder?: () => void;
}

const WRAPPER =
  "flex w-full flex-col items-center justify-center gap-6 px-6 py-16 text-center";

function buildDownloadsDescription(count: number): string {
  return count === 1
    ? "Tienes 1 archivo listo para organizar en tu carpeta de Descargas."
    : `Tienes ${count} archivos listos para organizar en tu carpeta de Descargas.`;
}

function buildSyncDescription(count: number): string {
  return count === 1
    ? "Tienes 1 archivo nuevo en tu carpeta de Descargas."
    : `Tienes ${count} archivos nuevos en tu carpeta de Descargas.`;
}

export function LibraryEmptyState({
  variant,
  downloadsCount = 0,
  downloadsPath,
  onSync,
  onChangeFolder,
}: LibraryEmptyStateProps): ReactElement {
  if (variant === "A") {
    return (
      <div className={WRAPPER}>
        <Inbox aria-hidden="true" className="h-12 w-12 text-text-tertiary" />

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            {S.A.title}
          </h2>
          <p className="max-w-sm text-sm text-text-secondary">
            {buildDownloadsDescription(downloadsCount)}
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={onSync}>
          {S.A.primaryCta}
        </Button>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <div
            role="separator"
            aria-hidden="true"
            className="h-px w-full bg-border"
          />
          <p className="text-xs text-text-tertiary">{S.A.footerLabel}</p>
          <Button variant="link" onClick={onChangeFolder}>
            {S.A.secondaryCta}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "B") {
    return (
      <div className={WRAPPER}>
        <RefreshCw
          aria-hidden="true"
          className="h-12 w-12 text-text-tertiary"
        />

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            {S.B.title}
          </h2>
          <p className="max-w-sm text-sm text-text-secondary">
            {buildSyncDescription(downloadsCount)}
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={onSync}>
          {S.B.primaryCta}
        </Button>
      </div>
    );
  }

  if (variant === "C") {
    return (
      <div className={WRAPPER}>
        <CheckCircle2
          aria-hidden="true"
          className="h-12 w-12 text-text-tertiary"
        />

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            {S.C.title}
          </h2>
          <p className="max-w-sm text-sm text-text-secondary">
            {S.C.description}
          </p>
        </div>

        <Button variant="link" onClick={onChangeFolder}>
          {S.C.secondaryCta}
        </Button>
      </div>
    );
  }

  // variant === "D"
  return (
    <div className={WRAPPER}>
      <Inbox aria-hidden="true" className="h-12 w-12 text-text-tertiary" />

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{S.D.title}</h2>
        <p className="max-w-sm text-sm text-text-secondary">
          {S.D.description}
        </p>
      </div>

      {downloadsPath && (
        <p className="font-mono text-sm text-text-tertiary">{downloadsPath}</p>
      )}

      <Button variant="link" onClick={onChangeFolder}>
        {S.D.secondaryCta}
      </Button>
    </div>
  );
}
