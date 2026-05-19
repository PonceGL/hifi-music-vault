"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogDescription } from "@/components/ui/dialog/dialog-description";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import { DEFAULT_CANCEL_LABEL, DEFAULT_CONFIRM_LABEL } from "./constants";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  variant = "default",
}: ConfirmDialogProps): ReactElement {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={onCancel}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="secondary" autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
