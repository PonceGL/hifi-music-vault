import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = Array.from({ length: 6 }, (_, i) => i);

export default function PlaylistsLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="mb-2 h-8 w-48" />
      {SKELETON_ROWS.map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
