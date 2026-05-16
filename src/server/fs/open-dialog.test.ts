/**
 * @jest-environment node
 *
 * Server-side tests run in Node.js environment (not jsdom) because
 * this module uses child_process and other Node.js built-ins.
 */

import { UnsupportedPlatformError } from "../errors";

// Mock child_process before importing the module under test.
// jest.mock is hoisted — the mock is in place before any imports execute,
// so the module's `const execAsync = promisify(exec)` uses the mocked exec.
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

import { exec } from "child_process";
import { openFolderDialog } from "./open-dialog";

const mockExec = exec as jest.MockedFunction<typeof exec>;

/** Helper that makes the mock resolve with a given stdout value. */
function mockExecSuccess(stdout: string): void {
  mockExec.mockImplementation((_cmd, callback) => {
    (callback as (err: null, stdout: string, stderr: string) => void)(
      null,
      stdout,
      ""
    );
    return {} as ReturnType<typeof exec>;
  });
}

/** Helper that makes the mock reject with a given error.
 *  The real exec always calls callback(error, stdout, stderr) with all three
 *  arguments — we replicate that here so the service can read stderr from
 *  the callback arguments rather than only from the error object.
 */
function mockExecFailure(stderr: string, code = 1): void {
  mockExec.mockImplementation((_cmd, callback) => {
    const error = Object.assign(new Error("Command failed"), { code });
    (
      callback as (
        err: Error,
        stdout: string,
        stderr: string
      ) => void
    )(error, "", stderr);
    return {} as ReturnType<typeof exec>;
  });
}

// Store original platform to restore between tests
const ORIGINAL_PLATFORM = process.platform;

function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, "platform", {
    value: platform,
    configurable: true,
  });
}

afterEach(() => {
  setPlatform(ORIGINAL_PLATFORM);
  jest.clearAllMocks();
});

// ─── macOS ────────────────────────────────────────────────────────────────────

describe("openFolderDialog — macOS", () => {
  beforeEach(() => setPlatform("darwin"));

  it("returns the trimmed path when osascript succeeds", async () => {
    mockExecSuccess("/Users/juan/Downloads\n");
    const result = await openFolderDialog("Seleccionar carpeta");
    expect(result).toBe("/Users/juan/Downloads");
  });

  it("passes the prompt text in the osascript command", async () => {
    mockExecSuccess("/Users/juan/Music\n");
    await openFolderDialog("Elige tu biblioteca");
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain("Elige tu biblioteca");
  });

  it("returns null when the user cancels (exit code 1, stderr contains 'User canceled')", async () => {
    mockExecFailure("User canceled.\n");
    const result = await openFolderDialog("Seleccionar");
    expect(result).toBeNull();
  });

  it("re-throws when osascript fails for an unexpected reason", async () => {
    mockExecFailure("execution error: osascript not found", 127);
    await expect(openFolderDialog("Seleccionar")).rejects.toThrow();
  });

  it("returns null when stdout is empty string", async () => {
    mockExecSuccess("");
    const result = await openFolderDialog("Seleccionar");
    expect(result).toBeNull();
  });

  it("escapes double quotes in the prompt", async () => {
    mockExecSuccess("/path\n");
    await openFolderDialog('Di "hola"');
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain('\\"hola\\"');
  });
});

// ─── Windows ──────────────────────────────────────────────────────────────────

describe("openFolderDialog — Windows", () => {
  beforeEach(() => setPlatform("win32"));

  it("returns the trimmed path when PowerShell succeeds", async () => {
    mockExecSuccess("C:\\Users\\juan\\Downloads\n");
    const result = await openFolderDialog("Seleccionar carpeta");
    expect(result).toBe("C:\\Users\\juan\\Downloads");
  });

  it("uses the -EncodedCommand flag for PowerShell", async () => {
    mockExecSuccess("C:\\path\n");
    await openFolderDialog("Seleccionar");
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain("-EncodedCommand");
    expect(calledCmd).toContain("powershell");
  });

  it("returns null when the user cancels (empty stdout, no stderr)", async () => {
    mockExecSuccess("");
    const result = await openFolderDialog("Seleccionar");
    expect(result).toBeNull();
  });

  it("returns null when PowerShell exits without stderr (dialog dismissed)", async () => {
    mockExecFailure("", 1);
    const result = await openFolderDialog("Seleccionar");
    expect(result).toBeNull();
  });

  it("re-throws when PowerShell fails with a meaningful stderr", async () => {
    mockExecFailure("powershell : command not found", 127);
    await expect(openFolderDialog("Seleccionar")).rejects.toThrow();
  });
});

// ─── Unsupported OS ───────────────────────────────────────────────────────────

describe("openFolderDialog — unsupported platform", () => {
  it("throws UnsupportedPlatformError on Linux", async () => {
    setPlatform("linux");
    await expect(openFolderDialog("Seleccionar")).rejects.toThrow(
      UnsupportedPlatformError
    );
  });

  it("error message includes the platform name", async () => {
    setPlatform("linux");
    await expect(openFolderDialog("Seleccionar")).rejects.toThrow("linux");
  });

  it("throws UnsupportedPlatformError on other unknown platforms", async () => {
    setPlatform("freebsd");
    await expect(openFolderDialog("Seleccionar")).rejects.toThrow(
      UnsupportedPlatformError
    );
  });
});
