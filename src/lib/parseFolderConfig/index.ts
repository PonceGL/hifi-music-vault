import type { NextRequest } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookieKeys";
import { BadRequestError } from "@/lib/httpErrors";
import type { FolderConfig } from "@/types/settings";

export interface ParsedFolderConfig {
  downloadsPath: string;
  libraryPath: string;
}

export function parseFolderConfigCookie(
  request: NextRequest,
): ParsedFolderConfig {
  const raw = request.cookies.get(COOKIE_KEYS.folderConfigured)?.value;

  if (!raw) {
    throw new BadRequestError("Configuración de carpetas no encontrada.");
  }

  let config: FolderConfig;
  try {
    config = JSON.parse(decodeURIComponent(raw)) as FolderConfig;
  } catch {
    throw new BadRequestError("Configuración de carpetas malformada.");
  }

  if (!config.downloadsPath || !config.libraryPath) {
    throw new BadRequestError("Las rutas de carpetas son inválidas.");
  }

  return {
    downloadsPath: config.downloadsPath,
    libraryPath: config.libraryPath,
  };
}
