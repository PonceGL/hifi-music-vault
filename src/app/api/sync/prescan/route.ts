import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { parseFolderConfigCookie } from "@/lib/parseFolderConfig";
import { prescanServer } from "@/app/api/sync/prescan/prescan.server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { downloadsPath, libraryPath } = parseFolderConfigCookie(request);

    const data = await prescanServer.prescan(downloadsPath, libraryPath);

    return NextResponse.json(
      { success: true, message: "Pre-scan completado.", data },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
