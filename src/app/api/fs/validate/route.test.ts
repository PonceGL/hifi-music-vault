/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { validateServer } from "@/app/api/fs/validate/validate.server";
import {
  BadRequestError,
  InternalServerErrorException,
} from "@/lib/httpErrors";
import { ZodError } from "zod";
import type { ValidatePathResult } from "@/app/api/fs/validate/type";

jest.mock("@/app/api/fs/validate/validate.server", () => ({
  validateServer: {
    validate: jest.fn(),
  },
}));

const mockValidate = validateServer.validate as jest.Mock;

const makeRequest = (path?: string): NextRequest => {
  const url = path
    ? `http://localhost/api/fs/validate?path=${encodeURIComponent(path)}`
    : "http://localhost/api/fs/validate";
  return new NextRequest(url);
};

const MOCK_RESULT: ValidatePathResult = {
  path: "/Users/test/music/library",
  exists: true,
  isDirectory: true,
  isFile: false,
  hasPermissions: true,
};

describe("GET /api/fs/validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── missing param ────────────────────────────────────────────────────────

  it("should return 400 when path query param is absent", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it("should return the BadRequestError message when path is absent", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.message).toBe("Se requiere el path para validar");
  });

  // ─── successful validation ────────────────────────────────────────────────

  it("should return 200 with success: true and data for a valid path", async () => {
    mockValidate.mockResolvedValueOnce(MOCK_RESULT);

    const response = await GET(makeRequest("/Users/test/music/library"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Path successfully validated");
    expect(body.data).toEqual(MOCK_RESULT);
  });

  it("should forward the path query param to validateServer.validate", async () => {
    mockValidate.mockResolvedValueOnce(MOCK_RESULT);
    const testPath = "/Users/test/music/library";

    await GET(makeRequest(testPath));

    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockValidate).toHaveBeenCalledWith(testPath);
  });

  // ─── service errors ───────────────────────────────────────────────────────

  it("should return 500 when validateServer throws InternalServerErrorException", async () => {
    mockValidate.mockRejectedValueOnce(
      new InternalServerErrorException("Disk I/O failure"),
    );

    const response = await GET(makeRequest("/Users/test/music/library"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Disk I/O failure");
    expect(body.data).toBeNull();
  });

  it("should return 400 when validateServer throws BadRequestError", async () => {
    mockValidate.mockRejectedValueOnce(new BadRequestError("Invalid path"));

    const response = await GET(makeRequest("/Users/test/music/library"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("should return 400 with Datos invalidos when validateServer throws ZodError", async () => {
    mockValidate.mockRejectedValueOnce(new ZodError([]));

    const response = await GET(makeRequest("/short"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Datos invalidos");
  });

  it("should return 500 for unexpected errors not extending HttpError", async () => {
    mockValidate.mockRejectedValueOnce(new Error("Unexpected internal error"));

    const response = await GET(makeRequest("/Users/test/music/library"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
