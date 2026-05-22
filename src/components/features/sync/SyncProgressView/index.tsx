"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { HardDriveDownload } from "lucide-react";
import { Progress } from "@/components/ui/progress/progress";
import { Button } from "@/components/ui/button";
import { useOperationStore } from "@/store/useOperationStore";
import { SYNC_PROGRESS_STRINGS as S } from "./constants";

interface SyncProgressViewProps {
  progress: number;
  isExternalDrive?: boolean;
  onCancel?: () => void;
}

export function SyncProgressView({
  progress,
  isExternalDrive = false,
  onCancel,
}: SyncProgressViewProps): ReactElement {
  const { startSync, clearOperation } = useOperationStore();

  useEffect(() => {
    startSync();
    return () => clearOperation();
  }, [startSync, clearOperation]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={S.title}
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-8"
    >
      <div className="w-full max-w-md space-y-3">
        <p className="text-center text-sm font-medium text-text-primary">
          {S.title}
        </p>

        <Progress value={progress} aria-label={S.progressAriaLabel} />
      </div>

      <div className="flex max-w-md flex-col items-center gap-2 text-center text-xs text-text-secondary">
        <p>{S.warning}</p>

        {isExternalDrive && (
          <p className="flex items-center gap-1.5">
            <HardDriveDownload
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            {S.externalDriveWarning}
          </p>
        )}
      </div>

      {onCancel && (
        <Button variant="ghost" onClick={onCancel}>
          {S.cancelLabel}
        </Button>
      )}
    </div>
  );
}
