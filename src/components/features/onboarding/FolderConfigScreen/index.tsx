"use client";

import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { FolderPickerField, type ValidationState } from "../FolderPickerField";
import { ONBOARDING_STRINGS } from "../constants";
import type { FolderConfig } from "@/types/settings";

interface FolderValidation {
  path: string | null;
  state: ValidationState;
  message: string | undefined;
}

interface FolderConfigScreenProps {
  onBack: () => void;
  onSubmit: (config: FolderConfig) => void;
}

const INITIAL_VALIDATION: FolderValidation = {
  path: null,
  state: "idle",
  message: undefined,
};

export function FolderConfigScreen({
  onBack,
  onSubmit,
}: FolderConfigScreenProps): ReactElement {
  const [downloads, setDownloads] =
    useState<FolderValidation>(INITIAL_VALIDATION);
  const [library, setLibrary] =
    useState<FolderValidation>(INITIAL_VALIDATION);

  const { folderConfig, validation } = ONBOARDING_STRINGS;

  const bothValid =
    downloads.state === "valid" && library.state === "valid";

  async function validatePath(
    path: string,
    otherPath: string | null,
    isLibrary: boolean
  ): Promise<{ state: ValidationState; message: string | undefined }> {
    if (otherPath && path === otherPath) {
      return { state: "error", message: validation.sameFolderError };
    }

    if (
      isLibrary &&
      otherPath &&
      path.startsWith(otherPath + "/")
    ) {
      return {
        state: "error",
        message: validation.libraryInsideDownloadsError,
      };
    }

    const params = new URLSearchParams({ path });
    const response = await fetch(`/api/fs?${params.toString()}`);

    if (!response.ok) {
      return { state: "error", message: validation.noWritePermissionError };
    }

    const data = (await response.json()) as {
      valid: boolean;
      writable: boolean;
    };

    if (!data.valid || !data.writable) {
      return { state: "error", message: validation.noWritePermissionError };
    }

    return { state: "valid", message: validation.validSuccess };
  }

  async function handleDownloadsSelect(path: string): Promise<void> {
    setDownloads({ path, state: "loading", message: undefined });
    const result = await validatePath(path, library.path, false);
    setDownloads({ path, ...result });
  }

  async function handleLibrarySelect(path: string): Promise<void> {
    setLibrary({ path, state: "loading", message: undefined });
    const result = await validatePath(path, downloads.path, true);
    setLibrary({ path, ...result });
  }

  function handleSubmit(): void {
    if (!bothValid || !downloads.path || !library.path) return;
    onSubmit({ downloadsPath: downloads.path, libraryPath: library.path });
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {folderConfig.title}
        </h1>

        <div className="flex flex-col gap-6">
          <FolderPickerField
            label={folderConfig.downloads.label}
            description={folderConfig.downloads.description}
            prompt={folderConfig.downloads.prompt}
            value={downloads.path}
            onSelect={handleDownloadsSelect}
            validationState={downloads.state}
            validationMessage={downloads.message}
          />

          <FolderPickerField
            label={folderConfig.library.label}
            description={folderConfig.library.description}
            prompt={folderConfig.library.prompt}
            value={library.path}
            onSelect={handleLibrarySelect}
            validationState={library.state}
            validationMessage={library.message}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onBack}
            className="flex-1"
          >
            {folderConfig.backButton}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!bothValid}
            className="flex-1"
          >
            {folderConfig.submitButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
