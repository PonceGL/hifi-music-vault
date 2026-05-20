import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { parseFolderConfigCookie } from "@/lib/parseFolderConfig";
import { libraryWatcher } from "@/server/fs/watcher";
import type { WatchEvent } from "@/app/api/library/watch/dtos/watch.dto";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function encodeEvent(event: WatchEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse | Response> {
  let libraryPath: string;

  try {
    ({ libraryPath } = parseFolderConfigCookie(request));
  } catch (error) {
    return handleHttpError(error);
  }

  await libraryWatcher.watch(libraryPath);

  const stream = new ReadableStream({
    start(controller): void {
      const unsubscribe = libraryWatcher.subscribe((event) => {
        controller.enqueue(encodeEvent(event));
      });

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
