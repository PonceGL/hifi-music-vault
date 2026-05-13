"use client";

import type { MouseEvent, ReactElement } from "react";
import Image from "next/image";
import { Music, MoreHorizontal } from "lucide-react";
import type { Track } from "@/types/track";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { FormatBadge } from "@/components/shared/format-badge/format-badge";
import { HealthDot } from "@/components/shared/health-dot/health-dot";
import {
  EMPTY_VALUE,
  COLUMN_LABELS,
  CHECKBOX_ARIA_LABEL,
  MORE_MENU_ARIA_LABEL,
  ARTWORK_ALT_SUFFIX,
} from "./constants";

export interface TrackRowProps {
  track: Track;
  isSelected?: boolean;
  isLoading?: boolean;
  isSelectionActive?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackRowSkeleton(): ReactElement {
  return (
    <div className="flex h-[52px] items-center gap-3 px-4" aria-hidden="true">
      <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
      <Skeleton className="h-9 w-9 shrink-0 rounded-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/5 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </div>
      <Skeleton className="hidden h-3.5 w-28 rounded xl:block" />
      <Skeleton className="hidden h-5 w-12 rounded-sm xl:block" />
      <Skeleton className="h-3.5 w-10 rounded" />
      <Skeleton className="h-5 w-5 rounded-sm" />
    </div>
  );
}

export function TrackRow({
  track,
  isSelected = false,
  isLoading = false,
  isSelectionActive = false,
  onSelect,
  onClick,
}: TrackRowProps): ReactElement {
  if (isLoading) return <TrackRowSkeleton />;

  const { id, metadata, healthStatus, format, duration } = track;
  const title = metadata.title ?? EMPTY_VALUE;
  const artist = metadata.artist ?? EMPTY_VALUE;
  const album = metadata.album ?? EMPTY_VALUE;
  const year = metadata.year !== null ? String(metadata.year) : EMPTY_VALUE;
  const durationText = duration ? formatDuration(duration) : EMPTY_VALUE;
  const isError = healthStatus === "critical";
  const showCheckbox = isSelected || isSelectionActive;

  const handleRowClick = (e: MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-checkbox]") || target.closest("[data-more-menu]")) return;
    onClick?.(id);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate"): void => {
    if (checked !== "indeterminate") onSelect?.(id);
  };

  return (
    <div
      role="row"
      aria-selected={isSelected}
      className={cn(
        "group flex h-[52px] cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 transition-colors duration-100",
        "hover:bg-track-row-hover",
        isSelected && "border-accent bg-track-row-selected",
        isError && "opacity-70",
      )}
      onClick={handleRowClick}
    >
      {/* Checkbox — desktop only */}
      <div
        data-checkbox
        onClick={(e: MouseEvent) => e.stopPropagation()}
        className="hidden xl:block"
      >
        <Checkbox
          aria-label={CHECKBOX_ARIA_LABEL}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            "transition-opacity duration-100",
            showCheckbox ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        />
      </div>

      {/* HealthDot — tablet+ */}
      <div className="hidden md:block">
        <HealthDot status={healthStatus} />
      </div>

      {/* Thumbnail */}
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-surface-secondary">
        {metadata.artwork ? (
          <Image
            src={metadata.artwork}
            alt={`${title} ${ARTWORK_ALT_SUFFIX}`}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium leading-tight",
            title === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-primary",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "truncate text-xs leading-tight",
            artist === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-secondary",
          )}
        >
          {artist}
        </span>
      </div>

      {/* Album — desktop only */}
      <span
        aria-label={COLUMN_LABELS.album}
        className={cn(
          "hidden w-36 truncate text-sm xl:block",
          album === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-secondary",
        )}
      >
        {album}
      </span>

      {/* Year — desktop only */}
      <span
        aria-label={COLUMN_LABELS.year}
        className={cn(
          "hidden w-10 text-right text-xs xl:block",
          year === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-secondary",
        )}
      >
        {year}
      </span>

      {/* FormatBadge — desktop only */}
      <div className="hidden xl:block">
        <FormatBadge format={format} />
      </div>

      {/* Duration — always visible */}
      <span
        aria-label={COLUMN_LABELS.duration}
        className={cn(
          "w-10 shrink-0 text-right text-xs font-mono",
          durationText === EMPTY_VALUE ? "text-text-tertiary" : "text-text-secondary",
        )}
      >
        {durationText}
      </span>

      {/* More menu */}
      <Button
        data-more-menu
        variant="ghost"
        size="icon"
        aria-label={MORE_MENU_ARIA_LABEL}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        className="shrink-0 text-text-tertiary opacity-0 hover:text-text-primary group-hover:opacity-100 focus-visible:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
