"use client";

import type { ReactElement } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import type { PrescanResponseDto } from "@/app/api/sync/prescan/dtos/prescan.dto";
import { SYNC_CONFIRM_STRINGS as S } from "./constants";

interface SyncConfirmModalProps {
  isOpen: boolean;
  prescan: PrescanResponseDto;
  downloadsPath: string;
  libraryPath: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function deriveBlockingMessage(prescan: PrescanResponseDto): string | null {
  if (prescan.toMove > 0) return null;
  const { duplicates, missingMetadata } = prescan.ignored;
  if (
    duplicates > 0 &&
    missingMetadata === 0 &&
    prescan.depthExceededCount === 0
  ) {
    return S.blocking.allDuplicates;
  }
  if (
    duplicates === 0 &&
    missingMetadata === 0 &&
    prescan.depthExceededCount === 0
  ) {
    return S.blocking.noFiles;
  }
  return null;
}

function buildDepthWarning(count: number): string {
  return count === 1
    ? S.warnings.depthExceeded.prefixSingular
    : `${count} ${S.warnings.depthExceeded.prefix}`;
}

function buildLongPathWarning(count: number): string {
  return count === 1
    ? S.warnings.longPaths.prefixSingular
    : `${count} ${S.warnings.longPaths.prefix}`;
}

export function SyncConfirmModal({
  isOpen,
  prescan,
  downloadsPath,
  libraryPath,
  onConfirm,
  onCancel,
}: SyncConfirmModalProps): ReactElement {
  const blockingMessage = deriveBlockingMessage(prescan);
  const isBlocked = prescan.toMove === 0;
  const fileLabel =
    prescan.toMove === 1 ? S.stats.filesSingular : S.stats.filesPlural;
  const hasWarnings =
    prescan.depthExceededCount > 0 || prescan.longPathWarnings > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent onEscapeKeyDown={onCancel}>
        <DialogHeader>
          <DialogTitle>{S.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          {/* Paths */}
          <div className="flex flex-col gap-1 rounded-md bg-surface-secondary p-3">
            <p className="text-xs text-text-secondary">{S.pathsLabel}</p>
            <p className="font-mono text-xs text-text-primary">
              {downloadsPath}
            </p>
            <p className="text-xs text-text-tertiary">→</p>
            <p className="font-mono text-xs text-text-primary">{libraryPath}</p>
          </div>

          {/* Stats */}
          <ul className="flex flex-col gap-1.5">
            <li className="flex justify-between">
              <span className="text-text-secondary">{S.stats.toMove}</span>
              <span className="font-medium text-text-primary">
                {prescan.toMove} {fileLabel}
              </span>
            </li>

            {prescan.ignored.duplicates > 0 && (
              <li className="flex justify-between">
                <span className="text-text-secondary">
                  {S.stats.duplicates}
                </span>
                <span className="text-text-primary">
                  {prescan.ignored.duplicates}
                </span>
              </li>
            )}

            {prescan.ignored.missingMetadata > 0 && (
              <li className="flex justify-between">
                <span className="text-text-secondary">
                  {S.stats.missingMetadata}
                </span>
                <span className="text-text-primary">
                  {prescan.ignored.missingMetadata}
                </span>
              </li>
            )}

            {prescan.tagFolders.length > 0 && (
              <li className="flex flex-wrap items-baseline gap-1">
                <span className="text-text-secondary">
                  {S.stats.tagFolders}
                </span>
                {prescan.tagFolders.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs text-text-secondary"
                  >
                    [{tag}]
                  </span>
                ))}
              </li>
            )}
          </ul>

          {/* Warnings */}
          {hasWarnings && (
            <div className="flex flex-col gap-2">
              {prescan.depthExceededCount > 0 && (
                <div className="flex gap-2 rounded-md bg-surface-secondary p-3">
                  <TriangleAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-health-yellow"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-text-secondary">
                    {buildDepthWarning(prescan.depthExceededCount)}
                  </p>
                </div>
              )}

              {prescan.longPathWarnings > 0 && (
                <div className="flex gap-2 rounded-md bg-surface-secondary p-3">
                  <TriangleAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-health-yellow"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-text-secondary">
                    {buildLongPathWarning(prescan.longPathWarnings)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Blocking message */}
          {blockingMessage && (
            <p className="text-sm font-medium text-health-red">
              {blockingMessage}
            </p>
          )}

          {/* Irreversible notice */}
          {!isBlocked && (
            <p className="text-xs text-text-tertiary">{S.irreversibleNotice}</p>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="secondary" autoFocus onClick={onCancel}>
            {S.cancelLabel}
          </Button>
          <Button variant="primary" disabled={isBlocked} onClick={onConfirm}>
            {S.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
