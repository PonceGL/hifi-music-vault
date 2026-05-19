"use client";

import { useEffect } from "react";
import type { PropsWithChildren, ReactElement } from "react";
import { AppShell } from "@/components/layout/app-shell/app-shell";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";
import { TabBar } from "@/components/layout/TabBar";
import { useFolderConfigGuard } from "@/hooks/useFolderConfigGuard";
import { useFolderConfigStore } from "@/hooks/useFolderConfigStore";
import { validateFolderPath } from "@/lib/validateFolderPath";

export default function AppLayout({
  children,
}: PropsWithChildren): ReactElement {
  useFolderConfigGuard();
  const { folderConfig } = useFolderConfigStore();

  useEffect(() => {
    if (!folderConfig) return;
    void validateFolderPath(folderConfig.downloadsPath!);
    void validateFolderPath(folderConfig.libraryPath!);
  }, [folderConfig]);

  return (
    <AppShell sidebar={<Sidebar />} topbar={<Topbar />} tabBar={<TabBar />}>
      {children}
    </AppShell>
  );
}
