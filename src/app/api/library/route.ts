import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { parseFolderConfigCookie } from "@/lib/parseFolderConfig";
import { libraryQueryDto } from "@/app/api/library/dtos/library.dto";
import { libraryServer } from "@/app/api/library/library.server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { libraryPath } = parseFolderConfigCookie(request);

    const sp = new URL(request.url).searchParams;

    const query = libraryQueryDto.parse({
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
      sort: sp.get("sort") ?? undefined,
      order: sp.get("order") ?? undefined,
      format: sp.get("format") ?? undefined,
      health: sp.get("health") ?? undefined,
    });

    const data = await libraryServer.getLibrary(libraryPath, query);

    return NextResponse.json(
      { success: true, message: "Biblioteca obtenida.", data },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
