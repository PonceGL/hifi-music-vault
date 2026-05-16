"use client";

import { useState } from "react";
import type { FolderConfig } from "@/types/settings";
import type { ValidationState } from "@/types/onboarding";
import { validateFolderPath } from "@/lib/validate-folder-path";

export interface FolderValidation {
  path: string | null;
  state: ValidationState;
  message: string | undefined;
}

export interface FolderConfigMessages {
  sameFolderError: string;
  libraryInsideDownloadsError: string;
  noWritePermissionError: string;
  validSuccess: string;
}

export interface UseFolderConfigReturn {
  downloads: FolderValidation;
  library: FolderValidation;
  bothValid: boolean;
  handleDownloadsSelect: (path: string) => Promise<void>;
  handleLibrarySelect: (path: string) => Promise<void>;
  handleSubmit: () => void;
}

const INITIAL_VALIDATION: FolderValidation = {
  path: null,
  state: "idle",
  message: undefined,
};

export function useFolderConfig(
  onSubmit: (config: FolderConfig) => void,
  messages: FolderConfigMessages
): UseFolderConfigReturn {
  const [downloads, setDownloads] =
    useState<FolderValidation>(INITIAL_VALIDATION);
  const [library, setLibrary] = useState<FolderValidation>(INITIAL_VALIDATION);

  const bothValid =
    downloads.state === "valid" && library.state === "valid";

  async function validate(
    path: string,
    otherPath: string | null,
    isLibrary: boolean
  ): Promise<{ state: ValidationState; message: string | undefined }> {
    if (otherPath && path === otherPath) {
      return { state: "error", message: messages.sameFolderError };
    }

    if (isLibrary && otherPath && path.startsWith(otherPath + "/")) {
      return { state: "error", message: messages.libraryInsideDownloadsError };
    }

    const result = await validateFolderPath(path);

    if (!result.valid || !result.writable) {
      return { state: "error", message: messages.noWritePermissionError };
    }

    return { state: "valid", message: messages.validSuccess };
  }

  async function handleDownloadsSelect(path: string): Promise<void> {
    setDownloads({ path, state: "loading", message: undefined });
    const result = await validate(path, library.path, false);
    setDownloads({ path, ...result });
  }

  async function handleLibrarySelect(path: string): Promise<void> {
    setLibrary({ path, state: "loading", message: undefined });
    const result = await validate(path, downloads.path, true);
    setLibrary({ path, ...result });
  }

  function handleSubmit(): void {
    if (!bothValid || !downloads.path || !library.path) return;
    onSubmit({ downloadsPath: downloads.path, libraryPath: library.path });
  }

  return {
    downloads,
    library,
    bothValid,
    handleDownloadsSelect,
    handleLibrarySelect,
    handleSubmit,
  };
}
