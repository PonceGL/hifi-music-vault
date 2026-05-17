import { handleHttpError } from "@/lib/errorResponse";
import { BadRequestError } from "@/lib/httpErrors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      throw new BadRequestError("Se requiere el path para validar");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Validate endpoint working",
        data: "working",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
