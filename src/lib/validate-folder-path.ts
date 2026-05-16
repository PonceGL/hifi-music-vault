export interface FolderPathResult {
  valid: boolean;
  writable: boolean;
}

export async function validateFolderPath(
  path: string
): Promise<FolderPathResult> {
  const params = new URLSearchParams({ path });
  const response = await fetch(`/api/fs?${params.toString()}`);

  if (!response.ok) return { valid: false, writable: false };

  return response.json() as Promise<FolderPathResult>;
}
