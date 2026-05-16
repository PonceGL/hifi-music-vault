import { exec } from "child_process";
import { UnsupportedPlatformError } from "../errors";

/**
 * Promise-based wrapper around child_process.exec.
 * Rejects with an error object that includes stdout and stderr,
 * so catch blocks can inspect both when deciding how to handle failures.
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

/**
 * Opens the native OS folder-picker dialog and returns the absolute path
 * selected by the user, or null if the user cancelled.
 *
 * Must be called from a server context — never from client-side code.
 *
 * @param prompt - Text displayed as the dialog title/description
 */
export async function openFolderDialog(
  prompt: string
): Promise<string | null> {
  const { platform } = process;

  if (platform === "darwin") return openFolderDialogMacOS(prompt);
  if (platform === "win32") return openFolderDialogWindows(prompt);

  throw new UnsupportedPlatformError(platform);
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
    // osascript exits with code 1 when the user clicks Cancel.
    // stderr will contain "User canceled." — this is a normal flow, not an error.
    const err = error as { stderr?: string };
    if (err.stderr?.includes("User canceled")) return null;
    throw error;
  }
}

// ─── Windows ──────────────────────────────────────────────────────────────────

async function openFolderDialogWindows(
  prompt: string
): Promise<string | null> {
  // Single-quote escaping for PowerShell string literals
  const escaped = prompt.replace(/'/g, "''");

  // Use -EncodedCommand to avoid shell quoting issues entirely.
  // The script is Base64-encoded UTF-16LE, which PowerShell decodes natively.
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
    // An empty stderr means the dialog was cancelled without a process error.
    const err = error as { stderr?: string };
    if (!err.stderr?.trim()) return null;
    throw error;
  }
}
