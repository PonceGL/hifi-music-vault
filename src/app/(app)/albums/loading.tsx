import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARDS = Array.from({ length: 12 }, (_, i) => i);

export default function AlbumsLoading(): ReactElement {
  return (
    <div className="p-4">
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SKELETON_CARDS.map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
