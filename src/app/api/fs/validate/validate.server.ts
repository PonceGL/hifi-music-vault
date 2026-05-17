import { promises as fs } from "fs";
import {
  BadRequestError,
  HttpError,
  InternalServerErrorException,
} from "@/lib/httpErrors";
import { ZodError } from "zod";
import {
  ValidateDto,
  validateDto,
} from "@/app/api/fs/validate/dtos/validate.dto";
import { ValidateFolderResult } from "@/app/api/fs/validate/type";

class ValidateServer {
  public async validate(path: ValidateDto): Promise<ValidateFolderResult> {
    try {
      const parsed = validateDto.parse(path);

      const directory = await this.checkIfExistAndPermission(parsed);

      return {
        path: parsed,
        isValid: directory,
      };
    } catch (error) {
      throw this.handleServiceError(error);
    }
  }

  private async checkIfExistAndPermission(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);
      if (!stats.isDirectory()) {
        throw new BadRequestError("El path debe ser una carpeta");
      }

      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new BadRequestError("El archivo o directorio no existe.");
      } else if ((error as NodeJS.ErrnoException).code === "EPERM") {
        throw new BadRequestError(
          "No tienes permisos para acceder a este archivo.",
        );
      } else {
        throw new InternalServerErrorException(
          (error as Error).message ?? "Error desconocido",
        );
      }
    }
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
