"use client";

import type { ReactElement } from "react";
import { useLibraryStatus } from "@/hooks/useLibraryStatus";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";
import { LibraryEmptyState } from "@/components/features/library/LibraryEmptyState";

export default function LibraryPage(): ReactElement {
  const { status, data } = useLibraryStatus();
  const { folderConfig } = useFolderConfigStore();

  if (!data || status === undefined) {
    return <div aria-live="polite" aria-busy className="sr-only" />;
  }

  if (status === "A" || status === "D") {
    return (
      <LibraryEmptyState
        variant={status}
        downloadsCount={data.downloads.count}
        downloadsPath={folderConfig?.downloadsPath ?? undefined}
        onSync={() => {}}
        onChangeFolder={() => {}}
      />
    );
  }

  // Status B or C — library has content (track list, future task)
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-text-secondary">Biblioteca</p>
    </div>
  );
}
