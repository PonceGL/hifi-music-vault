import { exec } from "child_process";
import { dialogServer } from "./dialog.server";
import { ZodError } from "zod";
import {
  InternalServerErrorException,
  UnsupportedPlatformError,
  UserCanceledDialogException,
} from "@/lib/httpErrors";
import type { OpenDialogBodyDto } from "@/app/api/fs/dialog/dtos/dialog.dto";

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

const mockExec = exec as unknown as jest.Mock;

describe("DialogServer", () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
  });

  const setPlatform = (platform: string) => {
    Object.defineProperty(process, "platform", {
      value: platform,
    });
  };

  describe("openDialog", () => {
    it("should throw ZodError if input is invalid", async () => {
      await expect(
        dialogServer.openDialog({ prompt: "short" }),
      ).rejects.toThrow(ZodError);
    });

    it("should throw ZodError if body has extra fields (strict schema)", async () => {
      await expect(
        dialogServer.openDialog({
          prompt: "Select a valid folder",
          extra: "field",
        } as unknown as OpenDialogBodyDto),
      ).rejects.toThrow(ZodError);
    });

    it("should throw UnsupportedPlatformError if platform is unsupported", async () => {
      setPlatform("linux");
      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(UnsupportedPlatformError);
    });

    it("should return parsed path for macOS success", async () => {
      setPlatform("darwin");
      mockExec.mockImplementation((cmd, callback) => {
        callback(null, "/Users/test/folder\n", "");
      });

      const result = await dialogServer.openDialog({
        prompt: "Select a valid folder",
      });
      expect(result).toEqual({ path: "/Users/test/folder" });
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining("osascript"),
        expect.any(Function),
      );
    });

    it("should return parsed path for Windows success", async () => {
      setPlatform("win32");
      mockExec.mockImplementation((cmd, callback) => {
        callback(null, "C:\\Users\\test\\folder\r\n", "");
      });

      const result = await dialogServer.openDialog({
        prompt: "Select a valid folder",
      });
      expect(result).toEqual({ path: "C:\\Users\\test\\folder" });
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining("powershell"),
        expect.any(Function),
      );
    });

    it("should throw ZodError when macOS returns null path (empty stdout)", async () => {
      setPlatform("darwin");
      mockExec.mockImplementation((cmd, callback) => {
        callback(null, "   \n", "");
      });
      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(ZodError);
    });

    it("should throw ZodError when Windows returns null path (user dismisses dialog)", async () => {
      setPlatform("win32");
      mockExec.mockImplementation((cmd, callback) => {
        callback(null, "  \r\n", "");
      });
      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(ZodError);
    });

    it("should propagate UserCanceledDialogException when macOS user cancels", async () => {
      setPlatform("darwin");
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Command failed");
        callback(
          Object.assign(error, { stderr: "User canceled the operation." }),
          "",
          "User canceled the operation.",
        );
      });

      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(UserCanceledDialogException);
    });

    it("should throw InternalServerErrorException when macOS exec fails", async () => {
      setPlatform("darwin");
      mockExec.mockImplementation((cmd, callback) => {
        callback(new Error("Random exec failure"), "", "Random exec failure");
      });

      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("should throw InternalServerErrorException when Windows exec fails with non-empty stderr", async () => {
      setPlatform("win32");
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("PowerShell access denied");
        callback(
          Object.assign(error, { stderr: "Access is denied." }),
          "",
          "Access is denied.",
        );
      });

      await expect(
        dialogServer.openDialog({ prompt: "Select a valid folder" }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("execAsync", () => {
    it("should resolve with stdout and stderr on success", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        callback(null, "output", "err_output");
      });

      const result = await dialogServer["execAsync"]("test cmd");
      expect(result).toEqual({ stdout: "output", stderr: "err_output" });
    });

    it("should reject with error containing stdout and stderr on failure", async () => {
      const error = new Error("exec fail");
      mockExec.mockImplementation((cmd, callback) => {
        callback(error, "output", "err_output");
      });

      await expect(dialogServer["execAsync"]("test cmd")).rejects.toMatchObject(
        {
          message: "exec fail",
          stdout: "output",
          stderr: "err_output",
        },
      );
    });
  });

  describe("openFolderDialogMacOS", () => {
    it("should escape backslashes and double quotes", async () => {
      mockExec.mockImplementation((cmd, callback) =>
        callback(null, "/path", ""),
      );
      await dialogServer["openFolderDialogMacOS"]('path\\to\\"folder"');
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('prompt "path\\\\to\\\\\\"folder\\""'),
        expect.any(Function),
      );
    });

    it("should return null if stdout is empty", async () => {
      mockExec.mockImplementation((cmd, callback) =>
        callback(null, "   \n", ""),
      );
      const result = await dialogServer["openFolderDialogMacOS"]("prompt");
      expect(result).toBeNull();
    });

    it("should throw UserCanceledDialogException if stderr includes 'canceled'", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Command failed");
        callback(
          Object.assign(error, { stderr: "User canceled." }),
          "",
          "User canceled.",
        );
      });

      await expect(
        dialogServer["openFolderDialogMacOS"]("prompt"),
      ).rejects.toThrow(UserCanceledDialogException);
    });

    it("should throw UserCanceledDialogException if stderr includes 'cancelado'", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Command failed");
        callback(
          Object.assign(error, { stderr: "Usuario ha cancelado." }),
          "",
          "Usuario ha cancelado.",
        );
      });

      await expect(
        dialogServer["openFolderDialogMacOS"]("prompt"),
      ).rejects.toThrow(UserCanceledDialogException);
    });

    it("should throw original error if stderr does not include cancel keywords", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Command failed");
        callback(
          Object.assign(error, { stderr: "Some other error" }),
          "",
          "Some other error",
        );
      });

      await expect(
        dialogServer["openFolderDialogMacOS"]("prompt"),
      ).rejects.toThrow("Command failed");
    });

    it("should throw original error when error has no stderr property", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("No stderr attached");
        callback(Object.assign(error, { stderr: undefined }), "", "");
      });

      await expect(
        dialogServer["openFolderDialogMacOS"]("prompt"),
      ).rejects.toThrow("No stderr attached");
    });
  });

  describe("openFolderDialogWindows", () => {
    it("should escape single quotes in prompt", async () => {
      mockExec.mockImplementation((cmd, callback) =>
        callback(null, "C:\\path", ""),
      );
      await dialogServer["openFolderDialogWindows"]("prompt's quote");

      const callArgs = mockExec.mock.calls[0][0];
      const encoded = callArgs.split(" ").pop();
      const decodedScript = Buffer.from(encoded, "base64").toString("utf16le");
      expect(decodedScript).toContain("prompt''s quote");
    });

    it("should return null if stdout is empty", async () => {
      mockExec.mockImplementation((cmd, callback) =>
        callback(null, "  \r\n", ""),
      );
      const result = await dialogServer["openFolderDialogWindows"]("prompt");
      expect(result).toBeNull();
    });

    it("should return null if exec fails but stderr is empty", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Failed");
        callback(Object.assign(error, { stderr: "   " }), "", "   ");
      });

      const result = await dialogServer["openFolderDialogWindows"]("prompt");
      expect(result).toBeNull();
    });

    it("should throw original error if exec fails and stderr is not empty", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Failed completely");
        callback(
          Object.assign(error, { stderr: "Real error occurred" }),
          "",
          "Real error occurred",
        );
      });

      await expect(
        dialogServer["openFolderDialogWindows"]("prompt"),
      ).rejects.toThrow("Failed completely");
    });

    it("should return null when exec fails and error has no stderr property", async () => {
      mockExec.mockImplementation((cmd, callback) => {
        const error = new Error("Failed");
        callback(Object.assign(error, { stderr: undefined }), "", "");
      });

      const result = await dialogServer["openFolderDialogWindows"]("prompt");
      expect(result).toBeNull();
    });
  });

  describe("handleServiceError", () => {
    it("should return the HttpError if the error is an instance of HttpError", () => {
      const error = new UnsupportedPlatformError("test error");
      const result = dialogServer["handleServiceError"](error);
      expect(result).toBe(error);
    });

    it("should return the ZodError if the error is an instance of ZodError", () => {
      const error = new ZodError([]);
      const result = dialogServer["handleServiceError"](error);
      expect(result).toBe(error);
    });

    it("should return InternalServerErrorException with custom message for standard Error", () => {
      const error = new Error("Custom internal failure");
      const result = dialogServer["handleServiceError"](error);
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("Custom internal failure");
    });

    it("should return InternalServerErrorException with default custom internal message for unknown object without message", () => {
      const error = {};
      const result = dialogServer["handleServiceError"](error, {
        internal: "Custom default internal",
      });
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("Custom default internal");
    });

    it("should return InternalServerErrorException with 'Error interno.' for unknown object if no custom internal message", () => {
      const error = {};
      const result = dialogServer["handleServiceError"](error);
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("Error interno.");
    });
  });
});
