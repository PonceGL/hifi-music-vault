import { API_ROUTES } from "@/lib/apiRoutes";

export interface FolderPathResult {
  valid: boolean;
  writable: boolean;
}

export async function validateFolderPath(
  path: string
): Promise<FolderPathResult> {
  const response = await fetch(API_ROUTES.fs.validate(path));

  if (!response.ok) return { valid: false, writable: false };

  return response.json() as Promise<FolderPathResult>;
}
