export async function openFolderDialog(
  prompt?: string
): Promise<string | null> {
  const response = await fetch("/api/fs/open-dialog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { path: string | null };
  return data.path ?? null;
}
