import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { parseFolderConfigCookie } from "@/lib/parseFolderConfig";
import { runSync } from "@/server/sync/sync";
import type { SyncEvent } from "@/app/api/sync/dtos/sync.dto";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function encodeEvent(event: SyncEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse | Response> {
  let downloadsPath: string;
  let libraryPath: string;

  try {
    ({ downloadsPath, libraryPath } = parseFolderConfigCookie(request));
  } catch (error) {
    return handleHttpError(error);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runSync({
          downloadsPath,
          libraryPath,
          onProgress: (progress) => {
            controller.enqueue(
              encodeEvent({ type: "progress", data: progress }),
            );
          },
        });

        controller.enqueue(encodeEvent({ type: "complete", data: result }));
      } catch (error) {
        controller.enqueue(
          encodeEvent({
            type: "error",
            data: { message: (error as Error).message },
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
