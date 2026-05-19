import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = Array.from({ length: 10 }, (_, i) => i);

export default function HealthLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      {SKELETON_ROWS.map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-9 w-9 rounded" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
