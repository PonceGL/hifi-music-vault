"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { FolderPickerField } from "../FolderPickerField";
import { ONBOARDING_STRINGS } from "../constants";
import { useFolderConfig } from "@/hooks/useFolderConfig";
import type { FolderConfig } from "@/types/settings";

interface FolderConfigScreenProps {
  onBack: () => void;
  onSubmit: (config: FolderConfig) => void;
}

export function FolderConfigScreen({
  onBack,
  onSubmit,
}: FolderConfigScreenProps): ReactElement {
  const { folderConfig } = ONBOARDING_STRINGS;

  const {
    downloads,
    library,
    bothValid,
    handleDownloadsSelect,
    handleLibrarySelect,
    handleSubmit,
  } = useFolderConfig(onSubmit, ONBOARDING_STRINGS.validation);

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
          <Button variant="ghost" size="md" onClick={onBack} className="flex-1">
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
