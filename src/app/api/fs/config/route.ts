import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookieKeys";

/**
 * GET /api/fs/config
 *
 * Temporary test endpoint. Reads the folder configuration directly from the
 * cookie so Node has access to both paths without touching localStorage.
 * Confirms that the guard implementation works end-to-end: even if the client
 * clears localStorage, this endpoint still returns the correct paths.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const raw = request.cookies.get(COOKIE_KEYS.folderConfigured)?.value;

  if (!raw) {
    return NextResponse.json({ success: false, data: null }, { status: 401 });
  }

  try {
    const config = JSON.parse(decodeURIComponent(raw)) as {
      downloadsPath: string;
      libraryPath: string;
    };

    if (!config.downloadsPath || !config.libraryPath) {
      return NextResponse.json({ success: false, data: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: config });
  } catch {
    return NextResponse.json({ success: false, data: null }, { status: 400 });
  }
}
