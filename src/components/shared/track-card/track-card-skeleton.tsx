import type { HTMLAttributes, ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton/skeleton";

export type TrackCardSkeletonProps = Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

export function TrackCardSkeleton({ className, style }: TrackCardSkeletonProps = {}): ReactElement {
  return (
    <div aria-hidden="true" className={className} style={style}>
      {/* Artwork placeholder — matches aspect-square artwork container */}
      <Skeleton className="aspect-square w-full rounded-t-lg rounded-b-none" />

      {/* Info section — matches bg-surface-secondary p-2 info container */}
      <div className="rounded-b-lg bg-surface-secondary p-2">
        <Skeleton className="mb-1 h-5 w-10 rounded-sm" />
        <Skeleton className="mb-1.5 h-3.5 w-4/5 rounded" />
        <Skeleton className="h-3 w-3/5 rounded" />
      </div>
    </div>
  );
}
