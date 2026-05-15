"use client";

import type { MouseEvent, ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music, MoreHorizontal } from "lucide-react";
import type { Track } from "@/types/track";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { FormatBadge } from "@/components/shared/format-badge/format-badge";
import { HealthDot } from "@/components/shared/health-dot/health-dot";
import { TrackCardSkeleton } from "./track-card-skeleton";
import {
  EMPTY_VALUE,
  ARTWORK_ALT_SUFFIX,
  CHECKBOX_ARIA_LABEL,
  MORE_MENU_ARIA_LABEL,
} from "./constants";

export interface TrackCardProps {
  track: Track;
  trackHref?: string;
  artistHref?: string;
  isSelected?: boolean;
  isLoading?: boolean;
  isSelectionActive?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function TrackCard({
  track,
  trackHref,
  artistHref,
  isSelected = false,
  isLoading = false,
  isSelectionActive = false,
  onSelect,
  onClick,
}: TrackCardProps): ReactElement {
  if (isLoading) return <TrackCardSkeleton />;

  const { id, metadata, healthStatus, format } = track;
  const title = metadata.title ?? EMPTY_VALUE;
  const artist = metadata.artist ?? EMPTY_VALUE;
  const showCheckbox = isSelected || isSelectionActive;

  const handleCardClick = (e: MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-checkbox]") ||
      target.closest("[data-more-menu]") ||
      target.closest("a")
    ) return;
    onClick?.(id);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate"): void => {
    if (checked !== "indeterminate") onSelect?.(id);
  };

  return (
    <div
      data-selected={isSelected}
      className={cn(
        "group cursor-pointer rounded-lg transition-all duration-150",
        "ring-2 ring-transparent",
        isSelected && "ring-accent",
      )}
      onClick={handleCardClick}
    >
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-surface-secondary">
        {metadata.artwork ? (
          <Image
            src={metadata.artwork}
            alt={`${title} ${ARTWORK_ALT_SUFFIX}`}
            fill
            sizes="(max-width: 640px) 50vw, 160px"
            className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-7 w-7 text-text-tertiary" aria-hidden="true" />
          </div>
        )}

        {/* Hover overlay — visual only, does not capture pointer events */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/20 pointer-events-none"
        />

        {/* More menu — centered, visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Button
            data-more-menu
            variant="ghost"
            size="icon"
            aria-label={MORE_MENU_ARIA_LABEL}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            className="text-white hover:bg-white/20 hover:text-white focus-visible:text-white"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Checkbox — top left, visible on hover or when selection is active */}
        <div
          data-checkbox
          onClick={(e: MouseEvent) => e.stopPropagation()}
          className={cn(
            "absolute left-2 top-2 transition-opacity duration-100",
            showCheckbox ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Checkbox
            aria-label={CHECKBOX_ARIA_LABEL}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
          />
        </div>

        {/* HealthDot — top right */}
        <div className="absolute right-2 top-2">
          <HealthDot status={healthStatus} size="large" />
        </div>
      </div>

      {/* Info */}
      <div className="rounded-b-lg bg-surface-secondary p-2">
        <div className="mb-1">
          <FormatBadge format={format} />
        </div>
        <p
          className={cn(
            "truncate text-sm font-medium leading-tight",
            title === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-primary",
          )}
        >
          {trackHref && title !== EMPTY_VALUE ? (
            <Link
              href={trackHref}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              className="hover:underline focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-1 focus-visible:ring-border-focus"
            >
              {title}
            </Link>
          ) : title}
        </p>
        <p
          className={cn(
            "truncate text-xs leading-tight",
            artist === EMPTY_VALUE ? "font-mono text-text-tertiary" : "text-text-secondary",
          )}
        >
          {artistHref && artist !== EMPTY_VALUE ? (
            <Link
              href={artistHref}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              className="hover:underline focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-1 focus-visible:ring-border-focus"
            >
              {artist}
            </Link>
          ) : artist}
        </p>
      </div>
    </div>
  );
}
