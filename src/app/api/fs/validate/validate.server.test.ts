import { promises as fs, constants } from "fs";
import { validateServer } from "./validate.server";
import { ZodError } from "zod";
import { InternalServerErrorException } from "@/lib/httpErrors";

jest.mock("fs", () => ({
  promises: {
    stat: jest.fn(),
    access: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
  constants: {
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  },
}));

const mockStat = fs.stat as jest.Mock;
const mockAccess = fs.access as jest.Mock;
const mockWriteFile = fs.writeFile as jest.Mock;
const mockUnlink = fs.unlink as jest.Mock;

const makeStats = (isDirectory: boolean) => ({
  isDirectory: () => isDirectory,
  isFile: () => !isDirectory,
});

const makeErrnoError = (code: string, message = code) =>
  Object.assign(new Error(message), { code });

describe("ValidateServer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── validate ─────────────────────────────────────────────────────────────

  describe("validate", () => {
    it("should throw ZodError when path is shorter than 10 characters", async () => {
      await expect(validateServer.validate("/tmp")).rejects.toThrow(ZodError);
    });

    it("should throw ZodError when input is not a string", async () => {
      await expect(
        validateServer.validate(12345 as unknown as string),
      ).rejects.toThrow(ZodError);
    });

    it("should call checkPath with the validated path and return its result", async () => {
      mockStat.mockResolvedValueOnce(makeStats(true));
      mockAccess.mockResolvedValueOnce(undefined);
      mockWriteFile.mockResolvedValueOnce(undefined);
      mockUnlink.mockResolvedValueOnce(undefined);

      const result = await validateServer.validate("/Users/test/music/library");

      expect(result.path).toBe("/Users/test/music/library");
      expect(result.exists).toBe(true);
    });

    it("should propagate InternalServerErrorException from checkPath", async () => {
      mockStat.mockRejectedValueOnce(makeErrnoError("EIO", "Disk I/O error"));

      await expect(
        validateServer.validate("/Users/test/music/library"),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── checkPath ────────────────────────────────────────────────────────────

  describe("checkPath", () => {
    const DIR_PATH = "/Users/test/music/library";
    const FILE_PATH = "/Users/test/music/track.flac";

    // ── non-existent path ──────────────────────────────────────────────────

    describe("non-existent path", () => {
      it("should return all-false result when stat throws ENOENT", async () => {
        mockStat.mockRejectedValueOnce(makeErrnoError("ENOENT"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result).toEqual({
          path: DIR_PATH,
          exists: false,
          isDirectory: false,
          isFile: false,
          hasPermissions: false,
        });
      });
    });

    // ── directory ─────────────────────────────────────────────────────────

    describe("directory", () => {
      it("should return full success result for accessible directory", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockResolvedValueOnce(undefined);
        mockUnlink.mockResolvedValueOnce(undefined);

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result).toEqual({
          path: DIR_PATH,
          exists: true,
          isDirectory: true,
          isFile: false,
          hasPermissions: true,
        });
      });

      it("should check access with R_OK | W_OK | X_OK bitmask", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockResolvedValueOnce(undefined);
        mockUnlink.mockResolvedValueOnce(undefined);

        await validateServer.checkPath(DIR_PATH);

        expect(mockAccess).toHaveBeenCalledWith(
          DIR_PATH,
          constants.R_OK | constants.W_OK | constants.X_OK,
        );
      });

      it("should write and delete a temp file inside the directory to probe write access", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockResolvedValueOnce(undefined);
        mockUnlink.mockResolvedValueOnce(undefined);

        await validateServer.checkPath(DIR_PATH);

        expect(mockWriteFile).toHaveBeenCalledWith(
          expect.stringContaining(DIR_PATH),
          "",
        );
        expect(mockUnlink).toHaveBeenCalledWith(
          expect.stringContaining(DIR_PATH),
        );
      });

      it("should return hasPermissions: false when access throws EPERM", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockRejectedValueOnce(makeErrnoError("EPERM"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.exists).toBe(true);
        expect(result.isDirectory).toBe(true);
        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when access throws EACCES", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockRejectedValueOnce(makeErrnoError("EACCES"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when writeFile throws EPERM", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockRejectedValueOnce(makeErrnoError("EPERM"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.exists).toBe(true);
        expect(result.isDirectory).toBe(true);
        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when writeFile throws EACCES", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockRejectedValueOnce(makeErrnoError("EACCES"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when writeFile throws EROFS (read-only filesystem)", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockRejectedValueOnce(makeErrnoError("EROFS"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.hasPermissions).toBe(false);
      });

      it("should keep hasPermissions: true when unlink fails after successful writeFile", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockResolvedValueOnce(undefined);
        mockUnlink.mockRejectedValueOnce(new Error("Unexpected cleanup failure"));

        const result = await validateServer.checkPath(DIR_PATH);

        expect(result.hasPermissions).toBe(true);
        expect(result.exists).toBe(true);
        expect(result.isDirectory).toBe(true);
      });

      it("should throw InternalServerErrorException for unknown FS errors on directory", async () => {
        mockStat.mockResolvedValueOnce(makeStats(true));
        mockAccess.mockResolvedValueOnce(undefined);
        mockWriteFile.mockRejectedValueOnce(makeErrnoError("EIO", "Disk I/O error"));

        await expect(validateServer.checkPath(DIR_PATH)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    // ── file ──────────────────────────────────────────────────────────────

    describe("file", () => {
      it("should return full success result for accessible file", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockResolvedValueOnce(undefined);

        const result = await validateServer.checkPath(FILE_PATH);

        expect(result).toEqual({
          path: FILE_PATH,
          exists: true,
          isDirectory: false,
          isFile: true,
          hasPermissions: true,
        });
      });

      it("should check access with R_OK | W_OK bitmask (no X_OK) for files", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockResolvedValueOnce(undefined);

        await validateServer.checkPath(FILE_PATH);

        expect(mockAccess).toHaveBeenCalledWith(
          FILE_PATH,
          constants.R_OK | constants.W_OK,
        );
      });

      it("should not probe write access with a temp file for files", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockResolvedValueOnce(undefined);

        await validateServer.checkPath(FILE_PATH);

        expect(mockWriteFile).not.toHaveBeenCalled();
        expect(mockUnlink).not.toHaveBeenCalled();
      });

      it("should return hasPermissions: false when access throws EACCES", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockRejectedValueOnce(makeErrnoError("EACCES"));

        const result = await validateServer.checkPath(FILE_PATH);

        expect(result.exists).toBe(true);
        expect(result.isFile).toBe(true);
        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when access throws EPERM", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockRejectedValueOnce(makeErrnoError("EPERM"));

        const result = await validateServer.checkPath(FILE_PATH);

        expect(result.hasPermissions).toBe(false);
      });

      it("should return hasPermissions: false when access throws EROFS", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockRejectedValueOnce(makeErrnoError("EROFS"));

        const result = await validateServer.checkPath(FILE_PATH);

        expect(result.hasPermissions).toBe(false);
      });

      it("should throw InternalServerErrorException for unknown FS errors on file", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockRejectedValueOnce(makeErrnoError("ETIMEDOUT", "Network FS timeout"));

        await expect(validateServer.checkPath(FILE_PATH)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    // ── result.path ──────────────────────────────────────────────────────

    describe("result.path", () => {
      it("should echo the input path in result.path for a missing path", async () => {
        mockStat.mockRejectedValueOnce(makeErrnoError("ENOENT"));
        const custom = "/Volumes/ExternalHDD/Music/Library";

        const result = await validateServer.checkPath(custom);

        expect(result.path).toBe(custom);
      });

      it("should echo the input path in result.path for an existing path", async () => {
        mockStat.mockResolvedValueOnce(makeStats(false));
        mockAccess.mockResolvedValueOnce(undefined);

        const result = await validateServer.checkPath(FILE_PATH);

        expect(result.path).toBe(FILE_PATH);
      });
    });
  });

  // ─── handleServiceError (private) ────────────────────────────────────────

  describe("handleServiceError", () => {
    it("should return the HttpError instance as-is", () => {
      const error = new InternalServerErrorException("original message");
      const result = validateServer["handleServiceError"](error);
      expect(result).toBe(error);
    });

    it("should return the ZodError instance as-is", () => {
      const error = new ZodError([]);
      const result = validateServer["handleServiceError"](error);
      expect(result).toBe(error);
    });

    it("should wrap a standard Error in InternalServerErrorException preserving its message", () => {
      const error = new Error("disk full");
      const result = validateServer["handleServiceError"](error);
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("disk full");
    });

    it("should use the customMessages.internal when error has no message", () => {
      const result = validateServer["handleServiceError"](
        {},
        { internal: "Custom fallback message" },
      );
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("Custom fallback message");
    });

    it("should fall back to 'Error interno.' when error has no message and no customMessages", () => {
      const result = validateServer["handleServiceError"]({});
      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.message).toBe("Error interno.");
    });
  });
});
