import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackRowSkeleton } from "@/components/shared/track-row/track-row-skeleton";

const ROW_COUNT = 10;
const ROWS = Array.from({ length: ROW_COUNT }, (_, i) => i);

export default function LibraryLoading(): ReactElement {
  return (
    <div className="flex flex-col" aria-label="Cargando biblioteca" aria-busy>
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Search + filters skeleton */}
      <div className="flex flex-col gap-2 px-4 pb-3">
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      {/* Track rows */}
      {ROWS.map((i) => (
        <TrackRowSkeleton key={i} />
      ))}
    </div>
  );
}
