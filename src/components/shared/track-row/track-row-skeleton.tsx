import type { HTMLAttributes, ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton/skeleton";

export type TrackRowSkeletonProps = Pick<HTMLAttributes<HTMLDivElement>, "className" | "style">;

export function TrackRowSkeleton({ className, style }: TrackRowSkeletonProps = {}): ReactElement {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={className}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        {/* Checkbox placeholder — desktop only */}
        <Skeleton className="hidden h-4 w-4 shrink-0 rounded-sm xl:block" />

        {/* HealthDot placeholder — tablet+ */}
        <Skeleton className="hidden h-2 w-2 shrink-0 rounded-full md:block" />

        {/* Thumbnail */}
        <Skeleton className="h-14 w-14 shrink-0 rounded-sm" />

        {/* Title + Artist */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-2/5 rounded" />
          <Skeleton className="h-3 w-1/4 rounded" />
        </div>

        {/* Album — desktop only */}
        <Skeleton className="hidden h-3.5 w-28 rounded xl:block" />

        {/* Format badge — desktop only */}
        <Skeleton className="hidden h-5 w-12 rounded-sm xl:block" />

        {/* Duration — lg+ */}
        <Skeleton className="hidden h-3.5 w-10 rounded lg:block" />

        {/* More menu */}
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>
    </div>
  );
}
