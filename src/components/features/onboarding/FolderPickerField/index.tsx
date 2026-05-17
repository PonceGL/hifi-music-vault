"use client";

import type { ReactElement } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STRINGS } from "@/components/features/onboarding/constants";
import type { ValidationState } from "@/types/onboarding";
import { openFolderDialog } from "@/lib/openFolderDialog";

export type { ValidationState };

export interface FolderPickerFieldProps {
  label: string;
  description?: string;
  value: string | null;
  onSelect: (path: string) => void;
  validationState: ValidationState;
  validationMessage?: string;
  prompt?: string;
}

export function FolderPickerField({
  label,
  description,
  value,
  onSelect,
  validationState,
  validationMessage,
  prompt,
}: FolderPickerFieldProps): ReactElement {
  const handleChoose = async (): Promise<void> => {
    const path = await openFolderDialog(prompt);
    if (path) onSelect(path);
    // TODO: check if is better idea lauch a toast notification here
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-primary">{label}</label>

      {description && (
        <p className="text-xs text-text-secondary">{description}</p>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex min-w-0 flex-1 items-center rounded-md border border-border bg-surface-primary px-3 py-2">
          {validationState === "loading" ? (
            <Loader2
              className="h-4 w-4 shrink-0 animate-spin text-text-secondary"
              aria-hidden="true"
            />
          ) : value ? (
            <span className="truncate font-mono text-sm text-text-primary">
              {value}
            </span>
          ) : (
            <span className="truncate text-sm text-text-tertiary">
              {ONBOARDING_STRINGS.folderConfig.downloads.placeholder}
            </span>
          )}

          {validationState === "valid" && (
            <CheckCircle
              className="ml-2 h-4 w-4 shrink-0 text-health-green"
              aria-hidden="true"
            />
          )}
          {validationState === "error" && (
            <XCircle
              className="ml-2 h-4 w-4 shrink-0 text-health-red"
              aria-hidden="true"
            />
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleChoose}
          disabled={validationState === "loading"}
          aria-label={`${ONBOARDING_STRINGS.validation.chooseFolderButton} ${label}`}
        >
          {ONBOARDING_STRINGS.validation.chooseFolderButton}
        </Button>
      </div>

      {validationState === "valid" && validationMessage && (
        <p className="text-xs text-health-green" role="status">
          {validationMessage}
        </p>
      )}
      {validationState === "error" && validationMessage && (
        <p className="text-xs text-health-red" role="alert">
          {validationMessage}
        </p>
      )}
    </div>
  );
}
