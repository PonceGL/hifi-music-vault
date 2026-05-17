import { promises as fs, constants } from "fs";
import path from "path";
import { HttpError, InternalServerErrorException } from "@/lib/httpErrors";
import { ZodError } from "zod";
import {
  ValidateDto,
  validateDto,
} from "@/app/api/fs/validate/dtos/validate.dto";
import { ValidatePathResult } from "@/app/api/fs/validate/type";

class ValidateServer {
  public async validate(dto: ValidateDto): Promise<ValidatePathResult> {
    try {
      const parsedPath = validateDto.parse(dto);

      return await this.checkPath(parsedPath);
    } catch (error) {
      throw this.handleServiceError(error);
    }
  }

  /**
   * Verifica la existencia, el tipo (archivo o directorio) y los permisos
   * de lectura/escritura/ejecución para la ruta proporcionada.
   */
  public async checkPath(targetPath: string): Promise<ValidatePathResult> {
    const result: ValidatePathResult = {
      path: targetPath,
      exists: false,
      isDirectory: false,
      isFile: false,
      hasPermissions: false,
    };

    try {
      const stats = await fs.stat(targetPath);
      result.exists = true;
      result.isDirectory = stats.isDirectory();
      result.isFile = stats.isFile();

      if (result.isDirectory) {
        // Validar Lectura, Escritura y Ejecución (atravesar carpetas)
        await fs.access(
          targetPath,
          constants.R_OK | constants.W_OK | constants.X_OK,
        );

        // Verificación robusta en directorios: intentamos crear y borrar un archivo temporal
        const tempFile = path.join(targetPath, `.hmv_test_${Date.now()}`);
        await fs.writeFile(tempFile, "");
        result.hasPermissions = true;
        // Cleanup best-effort: unlink failure does not invalidate the permission check
        await fs.unlink(tempFile).catch(() => {});
      } else if (result.isFile) {
        // Validar Lectura y Escritura en archivos
        await fs.access(targetPath, constants.R_OK | constants.W_OK);
        result.hasPermissions = true;
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        result.exists = false;
      } else if (code === "EPERM" || code === "EACCES" || code === "EROFS") {
        result.hasPermissions = false;
      } else {
        // Si es otro error del FS (ej. disco corrupto, symlink roto, etc.) lo lanzamos
        throw new InternalServerErrorException(
          (error as Error).message ??
            "Error desconocido en el sistema de archivos.",
        );
      }
    }

    return result;
  }

  private handleServiceError(
    error: unknown,
    customMessages?: { [key: string]: string },
  ): Error {
    const defaultMessage = customMessages?.internal || "Error interno.";
    if (error instanceof HttpError || error instanceof ZodError) {
      return error;
    }

    return new InternalServerErrorException(
      (error as Error).message ?? defaultMessage,
    );
  }
}

export const validateServer = new ValidateServer();
