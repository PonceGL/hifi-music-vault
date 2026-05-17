import { exec } from "child_process";
import {
  openDialogResponseDto,
  OpenDialogResponseDto,
  openDialogBodyDto,
  OpenDialogBodyDto,
} from "@/app/api/fs/dialog/dtos/dialog.dto";
import {
  HttpError,
  InternalServerErrorException,
  UnsupportedPlatformError,
  UserCanceledDialogException,
} from "@/lib/httpErrors";
import { ZodError } from "zod";

class DialogServer {
  public async openDialog(
    rawInput: OpenDialogBodyDto,
  ): Promise<OpenDialogResponseDto> {
    try {
      const parsed = openDialogBodyDto.parse(rawInput);
      const { platform } = process;

      let path: string | null;
      if (platform === "darwin") {
        path = await this.openFolderDialogMacOS(parsed.prompt);
      } else if (platform === "win32") {
        path = await this.openFolderDialogWindows(parsed.prompt);
      } else {
        throw new UnsupportedPlatformError(
          `La plataforma '${platform}' no está soportada.`,
        );
      }

      return openDialogResponseDto.parse({ path });
    } catch (error) {
      throw this.handleServiceError(error, {
        internal: "Error al abrir el dialog.",
      });
    }
  }

  private async execAsync(
    cmd: string,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(Object.assign(error, { stdout, stderr }));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  private async openFolderDialogMacOS(prompt: string): Promise<string | null> {
    const escaped = prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const cmd = `osascript -e 'POSIX path of (choose folder with prompt "${escaped}")'`;

    try {
      const { stdout } = await this.execAsync(cmd);
      return stdout.trim() || null;
    } catch (error) {
      const err = error as { stderr?: string };
      if (
        err.stderr?.toLowerCase().includes("canceled") ||
        err.stderr?.toLowerCase().includes("cancelado")
      ) {
        throw new UserCanceledDialogException();
      }
      throw error;
    }
  }

  private async openFolderDialogWindows(
    prompt: string,
  ): Promise<string | null> {
    const escaped = prompt.replace(/'/g, "''");

    const script = [
      "Add-Type -AssemblyName System.Windows.Forms",
      "$d = New-Object System.Windows.Forms.FolderBrowserDialog",
      `$d.Description = '${escaped}'`,
      "$d.ShowNewFolderButton = $true",
      "if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $d.SelectedPath }",
    ].join("; ");

    const encoded = Buffer.from(script, "utf16le").toString("base64");
    const cmd = `powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`;

    try {
      const { stdout } = await this.execAsync(cmd);
      return stdout.trim() || null;
    } catch (error) {
      const err = error as { stderr?: string };
      if (!err.stderr?.trim()) return null;
      throw error;
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

export const dialogServer = new DialogServer();
