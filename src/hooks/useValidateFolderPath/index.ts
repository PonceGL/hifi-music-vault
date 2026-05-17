"use client";

import { useMutation } from "@tanstack/react-query";
import { validateFolderPath } from "@/lib/validateFolderPath";
import type { ValidatePathResult } from "@/app/api/fs/validate/type";
import type { AppHttpError } from "@/lib/http";

export function useValidateFolderPath() {
  return useMutation<ValidatePathResult, AppHttpError, string>({
    mutationFn: validateFolderPath,
  });
}
