import { handleHttpError } from "@/lib/errorResponse";
import { BadRequestError } from "@/lib/httpErrors";
import { NextRequest, NextResponse } from "next/server";
import { validateServer } from "@/app/api/fs/validate/validate.server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      throw new BadRequestError("Se requiere el path para validar");
    }

    const data = await validateServer.validate(path);

    return NextResponse.json(
      {
        success: true,
        message: "Path successfully validated",
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
