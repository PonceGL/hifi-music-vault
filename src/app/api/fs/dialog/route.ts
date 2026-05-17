import { NextRequest, NextResponse } from "next/server";
import { dialogServer } from "@/app/api/fs/dialog/dialog.server";
import { handleHttpError } from "@/lib/errorResponse";
import { OpenDialogBodyDto } from "@/app/api/fs/dialog/dtos/dialog.dto";

const DEFAULT_PROMPT = "Selecciona una carpeta";
const DEFAULT_BODY: OpenDialogBodyDto = {
  prompt: DEFAULT_PROMPT,
};

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Dialog service working",
        data: "working",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: OpenDialogBodyDto = await request
      .json()
      .catch(() => DEFAULT_BODY);

    const data = await dialogServer.openDialog(body);
    return NextResponse.json(
      {
        success: true,
        message: "Path successfully selected",
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
