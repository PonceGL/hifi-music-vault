import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import { handleHttpError } from "@/lib/errorResponse";
import { BadRequestError } from "@/lib/httpErrors";
import { libraryQueryDto } from "@/app/api/library/dtos/library.dto";
import { libraryServer } from "@/app/api/library/library.server";
import type { FolderConfig } from "@/types/settings";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const raw = request.cookies.get(COOKIE_KEYS.folderConfigured)?.value;

    if (!raw) {
      throw new BadRequestError("Configuración de carpetas no encontrada.");
    }

    const config = JSON.parse(decodeURIComponent(raw)) as FolderConfig;

    if (!config.libraryPath) {
      throw new BadRequestError("La ruta de la biblioteca es inválida.");
    }

    const sp = new URL(request.url).searchParams;

    const query = libraryQueryDto.parse({
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
      sort: sp.get("sort") ?? undefined,
      order: sp.get("order") ?? undefined,
      format: sp.get("format") ?? undefined,
      health: sp.get("health") ?? undefined,
    });

    const data = await libraryServer.getLibrary(config.libraryPath, query);

    return NextResponse.json(
      { success: true, message: "Biblioteca obtenida.", data },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
