import { openFolderDialog } from "@/server/fs/open-dialog";
import { UnsupportedPlatformError } from "@/server/errors";

interface OpenDialogRequestBody {
  prompt?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as OpenDialogRequestBody;
    const prompt = body.prompt ?? "Seleccionar carpeta";

    const path = await openFolderDialog(prompt);

    return Response.json({ path });
  } catch (error) {
    if (error instanceof UnsupportedPlatformError) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.error("[POST /api/fs/open-dialog]", error);
    return Response.json(
      { error: "Error interno al abrir el selector de carpetas" },
      { status: 500 }
    );
  }
}
