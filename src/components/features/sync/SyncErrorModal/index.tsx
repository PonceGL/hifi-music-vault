"use client";

import type { ReactElement } from "react";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import type { SyncCriticalError } from "@/types/sync";
import {
  SYNC_ERROR_MESSAGE_LABEL,
  SYNC_ERROR_RETRY_LABEL,
  SYNC_ERROR_STRINGS as S,
} from "./constants";

interface SyncErrorModalProps {
  isOpen: boolean;
  error: SyncCriticalError;
  onRetry: () => void;
  onClose: () => void;
}

export function SyncErrorModal({
  isOpen,
  error,
  onRetry,
  onClose,
}: SyncErrorModalProps): ReactElement {
  const hasIncompleteFile = error.inProcess > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="critical" onEscapeKeyDown={onClose}>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <AlertCircle
                aria-hidden="true"
                className="h-5 w-5 text-health-red"
              />
              {S.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Error message + affected path */}
          <div className="flex flex-col gap-1 rounded-md border border-health-red/30 bg-health-red/10 px-4 py-3 text-sm">
            <p className="font-medium text-text-primary">
              {SYNC_ERROR_MESSAGE_LABEL[error.kind]}
            </p>
            <p className="font-mono text-xs text-text-secondary">
              {error.affectedPath}
            </p>
          </div>

          {/* File status table */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text-secondary">
              {S.statusTitle}
            </p>

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-health-green"
                />
                <span>
                  <span className="font-mono font-bold text-text-primary">
                    {error.moved}
                  </span>{" "}
                  <span className="text-text-secondary">{S.status.moved}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-text-tertiary"
                />
                <span>
                  <span className="font-mono font-bold text-text-primary">
                    {error.pending}
                  </span>{" "}
                  <span className="text-text-secondary">
                    {S.status.pending}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <XCircle
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-health-red"
                />
                <span>
                  <span className="font-mono font-bold text-text-primary">
                    {error.inProcess}
                  </span>{" "}
                  <span className="text-text-secondary">
                    {S.status.inProcess}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Note about incomplete file */}
          {hasIncompleteFile && (
            <p className="text-xs text-text-tertiary">{S.incompleteNote}</p>
          )}
        </div>

        <DialogFooter className="justify-end">
          <Button variant="ghost" onClick={onClose}>
            {S.closeLabel}
          </Button>
          <Button variant="primary" onClick={onRetry}>
            {SYNC_ERROR_RETRY_LABEL[error.kind]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
