import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/server/lib/withErrorHandler";
import { openFolderDialogService } from "@/server/fs/openDialog";

export const POST = withErrorHandler(
  async (req: NextRequest): Promise<NextResponse> => {
    const body = (await req.json().catch(() => ({}))) as unknown;
    const data = await openFolderDialogService(body);
    return NextResponse.json({ success: true, data });
  }
);
