"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import { SYNC_CANCEL_STRINGS as S } from "./constants";

interface SyncCancelDialogProps {
  isOpen: boolean;
  movedCount: number;
  onContinue: () => void;
  onConfirmCancel: () => void;
}

export function SyncCancelDialog({
  isOpen,
  movedCount,
  onContinue,
  onConfirmCancel,
}: SyncCancelDialogProps): ReactElement {
  const movedText =
    movedCount === 1 ? S.movedSingular : S.movedPlural(movedCount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent variant="critical" onEscapeKeyDown={onContinue}>
        <DialogHeader>
          <DialogTitle>{S.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
          <p>{movedText}</p>
          <p>{S.irreversibleNotice}</p>
          <p>{S.pendingNotice}</p>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="secondary" autoFocus onClick={onContinue}>
            {S.continueLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirmCancel}>
            {S.confirmCancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
