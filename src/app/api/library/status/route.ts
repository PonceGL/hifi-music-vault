import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import { handleHttpError } from "@/lib/errorResponse";
import { BadRequestError } from "@/lib/httpErrors";
import { statusServer } from "@/app/api/library/status/status.server";
import type { FolderConfig } from "@/types/settings";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const raw = request.cookies.get(COOKIE_KEYS.folderConfigured)?.value;

    if (!raw) {
      throw new BadRequestError("Configuración de carpetas no encontrada.");
    }

    const config = JSON.parse(decodeURIComponent(raw)) as FolderConfig;

    if (!config.downloadsPath || !config.libraryPath) {
      throw new BadRequestError("Las rutas de carpetas son inválidas.");
    }

    const data = await statusServer.getStatus(
      config.downloadsPath,
      config.libraryPath,
    );

    return NextResponse.json(
      { success: true, message: "Estado de biblioteca obtenido.", data },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
