import { ValidatePathResult } from "@/app/api/fs/validate/type";
import { API_ROUTES } from "@/lib/apiRoutes";

export async function validateFolderPath(
  path: string,
): Promise<ValidatePathResult> {
  const URL = API_ROUTES.fs.validate(path);

  const response = await fetch(URL); // TODO: replace by axios adapter

  const defaultResult: ValidatePathResult = {
    path,
    exists: false,
    isDirectory: false,
    isFile: false,
    hasPermissions: false,
  };

  if (!response.ok) return defaultResult;

  const json = (await response.json()) as { data: ValidatePathResult };

  return json.data ?? defaultResult;
}
