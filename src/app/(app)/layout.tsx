"use client";

import { useEffect } from "react";
import type { PropsWithChildren, ReactElement } from "react";
import { AppShell } from "@/components/layout/app-shell/app-shell";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";
import { TabBar } from "@/components/layout/TabBar";
import { RevalidationProgressBar } from "@/components/features/sync/RevalidationProgressBar";
import { useFolderConfigGuard } from "@/hooks/useFolderConfigGuard";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";
import { useLibraryStatus } from "@/hooks/useLibraryStatus";
import { useSync } from "@/hooks/useSync";
import { useRevalidation } from "@/hooks/useRevalidation";
import { validateFolderPath } from "@/lib/validateFolderPath";
import { useOperationStore } from "@/store/useOperationStore";
import { useToast } from "@/hooks/use-toast";
import { OPERATION_BUSY_TOAST } from "@/components/layout/topbar/constants";

export default function AppLayout({
  children,
}: PropsWithChildren): ReactElement {
  useFolderConfigGuard();
  const { folderConfig } = useFolderConfigStore();
  const { operationInProgress } = useOperationStore();
  const { data: libraryStatusData } = useLibraryStatus();
  const { startPrescan } = useSync();
  const { revalidate } = useRevalidation();
  const toast = useToast();

  const hasLibrary = (libraryStatusData?.library.count ?? 0) > 0;

  useEffect(() => {
    if (!folderConfig) return;
    void validateFolderPath(folderConfig.downloadsPath!);
    void validateFolderPath(folderConfig.libraryPath!);
  }, [folderConfig]);

  function handleSyncStart(): void {
    if (operationInProgress !== null) {
      toast.info(OPERATION_BUSY_TOAST);
      return;
    }
    void startPrescan();
  }

  function handleRevalidate(): void {
    void revalidate();
  }

  return (
    <AppShell
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          hasLibrary={hasLibrary}
          onSyncStart={handleSyncStart}
          onRevalidate={handleRevalidate}
        />
      }
      tabBar={<TabBar />}
      artworkBanner={<RevalidationProgressBar />}
      isBlocked={operationInProgress === "sync"}
    >
      {children}
    </AppShell>
  );
}
