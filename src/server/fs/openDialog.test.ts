/**
 * @jest-environment node
 *
 * Server-side tests run in Node.js environment (not jsdom) because
 * this module uses child_process and other Node.js built-ins.
 */

import { UnsupportedPlatformError, ValidationError } from "@/server/errors";

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

import { exec } from "child_process";
import { openFolderDialogService } from "./openDialog";

const mockExec = exec as jest.MockedFunction<typeof exec>;

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

/**
 * The real exec always calls callback(error, stdout, stderr) with all three
 * arguments — we replicate that so the service can read stderr correctly.
 */
function mockExecFailure(stderr: string, code = 1): void {
  mockExec.mockImplementation((_cmd, callback) => {
    const error = Object.assign(new Error("Command failed"), { code });
    (callback as (err: Error, stdout: string, stderr: string) => void)(
      error,
      "",
      stderr
    );
    return {} as ReturnType<typeof exec>;
  });
}

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

// ─── Input validation ─────────────────────────────────────────────────────────

describe("openFolderDialogService — input validation", () => {
  beforeEach(() => setPlatform("darwin"));

  it("throws ValidationError when prompt is not a string", async () => {
    mockExecSuccess("/path\n");
    await expect(
      openFolderDialogService({ prompt: 123 })
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError when prompt is an empty string", async () => {
    await expect(
      openFolderDialogService({ prompt: "" })
    ).rejects.toThrow(ValidationError);
  });

  it("accepts a valid prompt string", async () => {
    mockExecSuccess("/Users/test\n");
    const result = await openFolderDialogService({ prompt: "Seleccionar" });
    expect(result.path).toBe("/Users/test");
  });

  it("uses default prompt when prompt is omitted", async () => {
    mockExecSuccess("/Users/test\n");
    await openFolderDialogService({});
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain("Seleccionar carpeta");
  });

  it("rejects unknown fields (.strict())", async () => {
    await expect(
      openFolderDialogService({ prompt: "Ok", unknown: "field" })
    ).rejects.toThrow(ValidationError);
  });
});

// ─── macOS ────────────────────────────────────────────────────────────────────

describe("openFolderDialogService — macOS", () => {
  beforeEach(() => setPlatform("darwin"));

  it("returns the trimmed path when osascript succeeds", async () => {
    mockExecSuccess("/Users/juan/Downloads\n");
    const result = await openFolderDialogService({
      prompt: "Seleccionar carpeta",
    });
    expect(result).toEqual({ path: "/Users/juan/Downloads" });
  });

  it("returns { path: null } when the user cancels", async () => {
    mockExecFailure("User canceled.\n");
    const result = await openFolderDialogService({ prompt: "Seleccionar" });
    expect(result).toEqual({ path: null });
  });

  it("re-throws when osascript fails for an unexpected reason", async () => {
    mockExecFailure("execution error: osascript not found", 127);
    await expect(
      openFolderDialogService({ prompt: "Seleccionar" })
    ).rejects.toThrow();
  });

  it("returns { path: null } when stdout is empty", async () => {
    mockExecSuccess("");
    const result = await openFolderDialogService({ prompt: "Seleccionar" });
    expect(result).toEqual({ path: null });
  });

  it("escapes double quotes in the prompt", async () => {
    mockExecSuccess("/path\n");
    await openFolderDialogService({ prompt: 'Di "hola"' });
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain('\\"hola\\"');
  });
});

// ─── Windows ──────────────────────────────────────────────────────────────────

describe("openFolderDialogService — Windows", () => {
  beforeEach(() => setPlatform("win32"));

  it("returns the trimmed path when PowerShell succeeds", async () => {
    mockExecSuccess("C:\\Users\\juan\\Downloads\n");
    const result = await openFolderDialogService({
      prompt: "Seleccionar carpeta",
    });
    expect(result).toEqual({ path: "C:\\Users\\juan\\Downloads" });
  });

  it("uses -EncodedCommand for PowerShell", async () => {
    mockExecSuccess("C:\\path\n");
    await openFolderDialogService({ prompt: "Seleccionar" });
    const calledCmd = (mockExec.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledCmd).toContain("-EncodedCommand");
  });

  it("returns { path: null } when the user cancels (empty stdout)", async () => {
    mockExecSuccess("");
    const result = await openFolderDialogService({ prompt: "Seleccionar" });
    expect(result).toEqual({ path: null });
  });

  it("returns { path: null } when PowerShell exits without stderr", async () => {
    mockExecFailure("", 1);
    const result = await openFolderDialogService({ prompt: "Seleccionar" });
    expect(result).toEqual({ path: null });
  });

  it("re-throws when PowerShell fails with meaningful stderr", async () => {
    mockExecFailure("powershell : command not found", 127);
    await expect(
      openFolderDialogService({ prompt: "Seleccionar" })
    ).rejects.toThrow();
  });
});

// ─── Unsupported OS ───────────────────────────────────────────────────────────

describe("openFolderDialogService — unsupported platform", () => {
  it("throws UnsupportedPlatformError on Linux", async () => {
    setPlatform("linux");
    await expect(
      openFolderDialogService({ prompt: "Seleccionar" })
    ).rejects.toThrow(UnsupportedPlatformError);
  });

  it("error message includes the platform name", async () => {
    setPlatform("linux");
    await expect(
      openFolderDialogService({ prompt: "Seleccionar" })
    ).rejects.toThrow("linux");
  });
});
