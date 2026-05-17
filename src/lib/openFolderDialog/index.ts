import { API_ROUTES } from "@/lib/apiRoutes";

export async function openFolderDialog(
  prompt?: string,
): Promise<string | null> {
  // TODO: replace by axios adapter
  const response = await fetch(API_ROUTES.fs.dialog, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { data: { path: string | null } }; // TODO: Fix this type with real types from response (check API response structure)
  return data.data.path ?? null;
}
