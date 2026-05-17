"use client";

import { useMutation } from "@tanstack/react-query";
import { openFolderDialog } from "@/lib/openFolderDialog";
import type { AppHttpError } from "@/lib/http";

export function useOpenFolderDialog() {
  return useMutation<string | null, AppHttpError, string | undefined>({
    mutationFn: openFolderDialog,
  });
}
