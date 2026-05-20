import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { parseFolderConfigCookie } from "@/lib/parseFolderConfig";
import { statusServer } from "@/app/api/library/status/status.server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { downloadsPath, libraryPath } = parseFolderConfigCookie(request);

    const data = await statusServer.getStatus(downloadsPath, libraryPath);

    return NextResponse.json(
      { success: true, message: "Estado de biblioteca obtenido.", data },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
