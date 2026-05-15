"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { X, Music2, Pencil, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { HealthBadge } from "./HealthBadge";
import {
  DETAIL_PANEL_ARIA_LABEL,
  DETAIL_PANEL_CLOSE_LABEL,
  DETAIL_PANEL_HEADING,
  NO_ARTWORK_ALT,
  LABEL_ARTIST,
  LABEL_ALBUM,
  LABEL_YEAR,
  LABEL_FORMAT,
  LABEL_BITRATE,
  LABEL_SAMPLE_RATE,
  LABEL_DURATION,
  LABEL_SIZE,
  ACTION_EDIT_METADATA,
  ACTION_REVEAL_IN_FINDER,
  MISSING_VALUE,
} from "./constants";

export interface DetailPanelProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onEditMetadata?: () => void;
  onRevealInFinder?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MetaRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function MetaRow({ label, value, mono = false }: MetaRowProps): ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-xs text-text-tertiary">{label}</dt>
      <dd
        className={cn(
          "truncate text-right text-xs text-text-secondary",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function DetailPanel({
  track,
  isOpen,
  onClose,
  onEditMetadata,
  onRevealInFinder,
}: DetailPanelProps): ReactElement | null {
  useEscapeKey(isOpen, onClose);

  if (!track) return null;

  const { metadata, healthStatus, format, size, duration } = track;

  return (
    <div
      aria-label={DETAIL_PANEL_ARIA_LABEL}
      className={cn(
        "flex h-full flex-col overflow-y-auto bg-surface-primary",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-text-primary">
          {DETAIL_PANEL_HEADING}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={DETAIL_PANEL_CLOSE_LABEL}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      {/* Artwork */}
      <div className="shrink-0 p-4">
        {metadata.artwork ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <Image
              src={`data:image/jpeg;base64,${metadata.artwork}`}
              alt={metadata.album ?? NO_ARTWORK_ALT}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-md bg-surface-elevated">
            <Music2 aria-hidden="true" className="size-12 text-text-tertiary" />
          </div>
        )}
      </div>

      {/* Track identity */}
      <div className="flex flex-col gap-0.5 px-4 pb-3">
        <p className="line-clamp-2 font-semibold text-text-primary">
          {metadata.title ?? MISSING_VALUE}
        </p>
        <p className="text-sm text-text-secondary">
          {metadata.artist ?? MISSING_VALUE}
        </p>
        <p className="text-sm text-text-tertiary">
          {metadata.album ?? MISSING_VALUE}
        </p>
      </div>

      {/* Health */}
      <div className="shrink-0 px-4 pb-4">
        <HealthBadge status={healthStatus} />
      </div>

      {/* Technical metadata */}
      <dl className="flex flex-col gap-2 border-t border-border px-4 py-3">
        <MetaRow label={LABEL_FORMAT} value={format.toUpperCase()} mono />
        <MetaRow
          label={LABEL_BITRATE}
          value={
            metadata.bitrate
              ? `${Math.round(metadata.bitrate / 1000)} kbps`
              : MISSING_VALUE
          }
          mono
        />
        <MetaRow
          label={LABEL_SAMPLE_RATE}
          value={
            metadata.sampleRate
              ? `${(metadata.sampleRate / 1000).toFixed(1)} kHz`
              : MISSING_VALUE
          }
          mono
        />
        <MetaRow label={LABEL_DURATION} value={formatDuration(duration)} mono />
        <MetaRow label={LABEL_SIZE} value={formatSize(size)} mono />
        <MetaRow
          label={LABEL_YEAR}
          value={metadata.year?.toString() ?? MISSING_VALUE}
        />
        <MetaRow
          label={LABEL_ALBUM}
          value={metadata.album ?? MISSING_VALUE}
        />
        <MetaRow
          label={LABEL_ARTIST}
          value={metadata.artist ?? MISSING_VALUE}
        />
      </dl>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-1 border-t border-border px-4 py-3">
        <Button
          variant="ghost"
          size="md"
          className="w-full justify-start gap-3"
          onClick={onEditMetadata}
        >
          <Pencil aria-hidden="true" className="size-4 shrink-0" />
          {ACTION_EDIT_METADATA}
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="w-full justify-start gap-3"
          onClick={onRevealInFinder}
        >
          <FolderOpen aria-hidden="true" className="size-4 shrink-0" />
          {ACTION_REVEAL_IN_FINDER}
        </Button>
      </div>
    </div>
  );
}
