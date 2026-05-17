import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { HttpError } from "@/lib/httpErrors";

export function handleHttpError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        data: null,
      },
      { status: error.statusCode },
    );
  }
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => {
      const path = issue.path.map((p) => p.toString()).join(".");
      return {
        [path !== "" ? path : issue.code]: issue.message
          .replace(/\\"/g, "")
          .replace(/"/g, ""),
      };
    });

    return NextResponse.json(
      {
        success: false,
        message: "Datos invalidos",
        data: issues ?? null,
      },
      { status: 400 },
    );
  }
  return NextResponse.json(
    {
      success: false,
      message: (error as Error).message || "Error desconocido",
      data: null,
    },
    { status: 500 },
  );
}
