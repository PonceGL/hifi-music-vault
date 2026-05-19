import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = Array.from({ length: 10 }, (_, i) => i);

export default function LibraryLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-0 p-4">
      {/* Toolbar skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Column header skeleton */}
      <div className="mb-2 grid grid-cols-[1rem_2.5rem_1fr_1fr_1fr_4rem_3rem_1.5rem] items-center gap-3 px-3">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-3" />
      </div>

      {/* Track rows skeleton */}
      {SKELETON_ROWS.map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1rem_2.5rem_1fr_1fr_1fr_4rem_3rem_1.5rem] items-center gap-3 rounded-md px-3 py-2"
        >
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-9 w-9 rounded" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-full max-w-[180px]" />
            <Skeleton className="h-2.5 w-full max-w-[120px]" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
      ))}
    </div>
  );
}
