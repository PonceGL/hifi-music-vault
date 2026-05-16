import { NextRequest, NextResponse } from "next/server";
import { HttpError } from "@/server/errors";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * HOF that wraps any route handler with centralized error handling.
 *
 * Every endpoint that uses this wrapper is guaranteed to return the same
 * error shape regardless of what is thrown inside the handler or the service.
 *
 * Usage:
 * ```ts
 * export const POST = withErrorHandler(async (req) => {
 *   const body = await req.json();
 *   const result = await someService(body);
 *   return NextResponse.json({ success: true, data: result });
 * });
 * ```
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json(error.toJSON(), {
          status: error.statusCode,
        });
      }

      console.error(`[API Error] ${req.method} ${req.url}`, error);

      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Error interno del servidor",
            code: "INTERNAL_ERROR",
            statusCode: 500,
          },
        },
        { status: 500 }
      );
    }
  };
}
