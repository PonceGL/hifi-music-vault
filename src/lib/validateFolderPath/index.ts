import { internalHttpClient } from "@/lib/http";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { ValidatePathResult } from "@/app/api/fs/validate/type";

type ValidateApiResponse = {
  data: ValidatePathResult;
};

export async function validateFolderPath(
  path: string,
): Promise<ValidatePathResult> {
  const fallback: ValidatePathResult = {
    path,
    exists: false,
    isDirectory: false,
    isFile: false,
    hasPermissions: false,
  };

  try {
    const response = await internalHttpClient.get<ValidateApiResponse>(
      API_ROUTES.fs.validate(path),
    );
    return response.data.data ?? fallback;
  } catch {
    return fallback;
  }
}
