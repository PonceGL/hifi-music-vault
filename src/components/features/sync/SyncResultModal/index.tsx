"use client";

import type { ReactElement } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import type { SyncResult } from "@/types/sync";
import { SYNC_RESULT_STRINGS as S } from "./constants";

interface SyncResultModalProps {
  isOpen: boolean;
  result: SyncResult;
  wasCancelled?: boolean;
  onGoToLibrary: () => void;
}

export function SyncResultModal({
  isOpen,
  result,
  wasCancelled = false,
  onGoToLibrary,
}: SyncResultModalProps): ReactElement {
  const totalIgnored = result.duplicatesSkipped + result.missingMetadataSkipped;
  const hasIgnoredBreakdown = totalIgnored > 0;
  const hasPlaylists = result.playlistsUpdated.length > 0;
  const title = wasCancelled ? S.titleCancelled : S.titleCompleted;
  const TitleIcon = wasCancelled ? AlertCircle : CheckCircle2;
  const iconClass = wasCancelled
    ? "h-5 w-5 text-health-yellow"
    : "h-5 w-5 text-health-green";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onGoToLibrary()}>
      <DialogContent variant="informative" onEscapeKeyDown={onGoToLibrary}>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <TitleIcon aria-hidden="true" className={iconClass} />
              {title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 3-column stat grid */}
          <div className="grid grid-cols-3 divide-x divide-border rounded-md border border-border">
            <div className="flex flex-col items-center gap-0.5 px-4 py-3">
              <span className="font-mono text-2xl font-bold text-text-primary">
                {result.moved}
              </span>
              <span className="text-xs text-text-secondary">
                {S.stats.moved}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-4 py-3">
              <span className="font-mono text-2xl font-bold text-text-primary">
                {totalIgnored}
              </span>
              <span className="text-xs text-text-secondary">
                {S.stats.ignored}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-4 py-3">
              <span
                className={`font-mono text-2xl font-bold ${result.errors > 0 ? "text-health-red" : "text-text-primary"}`}
              >
                {result.errors}
              </span>
              <span className="text-xs text-text-secondary">
                {S.stats.errors}
              </span>
            </div>
          </div>

          {/* Ignored breakdown */}
          {hasIgnoredBreakdown && (
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-text-secondary">
                {S.breakdown.label}
              </p>
              {result.duplicatesSkipped > 0 && (
                <p className="text-text-secondary">
                  <span className="font-mono text-text-primary">
                    {result.duplicatesSkipped}
                  </span>{" "}
                  {S.breakdown.duplicates}
                </p>
              )}
              {result.missingMetadataSkipped > 0 && (
                <p className="text-text-secondary">
                  <span className="font-mono text-text-primary">
                    {result.missingMetadataSkipped}
                  </span>{" "}
                  {S.breakdown.missingMetadata}
                </p>
              )}
            </div>
          )}

          {/* Playlists updated */}
          {hasPlaylists && (
            <p className="text-sm text-text-secondary">
              <span className="font-medium">{S.playlists.label}</span>{" "}
              {result.playlistsUpdated.join(" · ")}
            </p>
          )}
        </div>

        <DialogFooter className="justify-end">
          <Button variant="primary" onClick={onGoToLibrary}>
            {S.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
