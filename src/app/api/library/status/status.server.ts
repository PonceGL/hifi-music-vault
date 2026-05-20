import { promises as fs } from "fs";
import path from "path";
import { ZodError } from "zod";
import { validateServer } from "@/app/api/fs/validate/validate.server";
import {
  BadRequestError,
  HttpError,
  InternalServerErrorException,
} from "@/lib/httpErrors";
import {
  statusResponseDto,
  type FolderStatus,
  type StatusResponseDto,
} from "@/app/api/library/status/dtos/status.dto";
import { EXT_TO_FORMAT } from "@/lib/audioFormats";

class StatusServer {
  public async getStatus(
    downloadsPath: string,
    libraryPath: string,
  ): Promise<StatusResponseDto> {
    try {
      const [downloadsResult, libraryResult] = await Promise.all([
        validateServer.checkPath(downloadsPath),
        validateServer.checkPath(libraryPath),
      ]);

      if (!downloadsResult.exists || !downloadsResult.hasPermissions) {
        throw new BadRequestError(
          `La carpeta de Descargas no está disponible: ${downloadsPath}`,
        );
      }

      if (!libraryResult.exists || !libraryResult.hasPermissions) {
        throw new BadRequestError(
          `La carpeta de Biblioteca no está disponible: ${libraryPath}`,
        );
      }

      const [downloads, library] = await Promise.all([
        this.countAudioFiles(downloadsPath),
        this.countAudioFiles(libraryPath),
      ]);

      return statusResponseDto.parse({ downloads, library });
    } catch (error) {
      throw this.handleServiceError(error, {
        internal: "Error al obtener el estado de la biblioteca.",
      });
    }
  }

  private async countAudioFiles(dir: string): Promise<FolderStatus> {
    const byFormat: Record<string, number> = {};
    let count = 0;

    await this.walkDir(dir, (ext) => {
      const format = EXT_TO_FORMAT[ext];
      if (format) {
        count++;
        byFormat[format] = (byFormat[format] ?? 0) + 1;
      }
    });

    return { count, byFormat };
  }

  private async walkDir(
    dir: string,
    onFile: (ext: string) => void,
  ): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.walkDir(full, onFile);
        } else if (entry.isFile()) {
          onFile(path.extname(entry.name).toLowerCase());
        }
      }),
    );
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

export const statusServer = new StatusServer();
