import { exec } from "child_process";
import { UnsupportedPlatformError } from "@/server/errors";
import {
  openDialogBodyDto,
  openDialogResponseDto,
  type OpenDialogBodyDto,
  type OpenDialogResponseDto,
} from "@/app/api/fs/openDialog/dtos/openDialog.dto";
import { ValidationError } from "@/server/errors";

/**
 * Promise-based wrapper around child_process.exec.
 * Rejects with an error object that includes stdout and stderr so catch
 * blocks can inspect both when deciding how to handle failures.
 */
function execAsync(
  cmd: string
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

// ─── macOS ────────────────────────────────────────────────────────────────────

async function openFolderDialogMacOS(
  prompt: string
): Promise<string | null> {
  const escaped = prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const cmd = `osascript -e 'POSIX path of (choose folder with prompt "${escaped}")'`;

  try {
    const { stdout } = await execAsync(cmd);
    return stdout.trim() || null;
  } catch (error) {
    const err = error as { stderr?: string };
    if (err.stderr?.includes("User canceled")) return null;
    throw error;
  }
}

// ─── Windows ──────────────────────────────────────────────────────────────────

async function openFolderDialogWindows(
  prompt: string
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
    const { stdout } = await execAsync(cmd);
    return stdout.trim() || null;
  } catch (error) {
    const err = error as { stderr?: string };
    if (!err.stderr?.trim()) return null;
    throw error;
  }
}

// ─── Public service ───────────────────────────────────────────────────────────

/**
 * Opens the native OS folder-picker dialog.
 *
 * Validates raw input with Zod before executing any OS command.
 * Validates the output shape before returning, ensuring the response
 * contract is always honored.
 *
 * @param rawInput - Unparsed request body from the route handler.
 * @returns The selected absolute path, or null if the user cancelled.
 * @throws {ValidationError} When the input fails schema validation.
 * @throws {UnsupportedPlatformError} When running on an unsupported OS.
 */
export async function openFolderDialogService(
  rawInput: unknown
): Promise<OpenDialogResponseDto> {
  const parsed = openDialogBodyDto.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.format());
  }

  const input: OpenDialogBodyDto = parsed.data;
  const prompt = input.prompt ?? "Seleccionar carpeta";

  const { platform } = process;

  let path: string | null;
  if (platform === "darwin") {
    path = await openFolderDialogMacOS(prompt);
  } else if (platform === "win32") {
    path = await openFolderDialogWindows(prompt);
  } else {
    throw new UnsupportedPlatformError(platform);
  }

  return openDialogResponseDto.parse({ path });
}
