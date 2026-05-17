import { internalHttpClient } from "@/lib/http";
import { API_ROUTES } from "@/lib/apiRoutes";

type DialogApiResponse = {
  data: { path: string };
};

export async function openFolderDialog(
  prompt?: string,
): Promise<string | null> {
  try {
    const response = await internalHttpClient.post<DialogApiResponse>(
      API_ROUTES.fs.dialog,
      { prompt },
    );
    return response.data.data.path ?? null;
  } catch {
    return null;
  }
}
