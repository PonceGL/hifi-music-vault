import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = Array.from({ length: 8 }, (_, i) => i);

export default function ArtistsLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="mb-2 h-8 w-48" />
      {SKELETON_ROWS.map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
