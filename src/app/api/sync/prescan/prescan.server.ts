import path from "path";
import { ZodError } from "zod";
import { scanDownloads } from "@/server/sync/scanner";
import { validateMinimalMetadata } from "@/server/sync/validator";
import { isDuplicate } from "@/server/sync/deduplicator";
import { buildDestPath } from "@/server/sync/pathBuilder";
import { HttpError, InternalServerErrorException } from "@/lib/httpErrors";
import {
  prescanResponseDto,
  type PrescanResponseDto,
} from "@/app/api/sync/prescan/dtos/prescan.dto";

const LONG_PATH_LIMIT = 260;

class PrescanServer {
  public async prescan(
    downloadsPath: string,
    libraryPath: string,
  ): Promise<PrescanResponseDto> {
    try {
      const scanResult = await scanDownloads(downloadsPath);

      let toMove = 0;
      let duplicates = 0;
      let missingMetadata = 0;
      let longPathWarnings = 0;

      for (const file of scanResult.files) {
        const ext = path.extname(file.path).toLowerCase();
        const validation = await validateMinimalMetadata(file.path);

        if (!validation.valid || !validation.metadata) {
          missingMetadata += 1;
          continue;
        }

        const destPath = buildDestPath(libraryPath, validation.metadata, ext);

        if (destPath.length > LONG_PATH_LIMIT) {
          longPathWarnings += 1;
        }

        if (await isDuplicate(destPath)) {
          duplicates += 1;
          continue;
        }

        toMove += 1;
      }

      return prescanResponseDto.parse({
        toMove,
        ignored: { duplicates, missingMetadata },
        tagFolders: scanResult.tagFolderNames,
        depthExceededCount: scanResult.tooDeepCount,
        longPathWarnings,
      });
    } catch (error) {
      throw this.handleServiceError(error, {
        internal: "Error al ejecutar el pre-scan.",
      });
    }
  }

  private handleServiceError(
    error: unknown,
    customMessages?: { internal?: string },
  ): Error {
    if (error instanceof HttpError || error instanceof ZodError) return error;
    return new InternalServerErrorException(
      (error as Error).message ?? customMessages?.internal ?? "Error interno.",
    );
  }
}

export const prescanServer = new PrescanServer();
