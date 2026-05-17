/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { dialogServer } from "@/app/api/fs/dialog/dialog.server";
import {
  InternalServerErrorException,
  UserCanceledDialogException,
  UnsupportedPlatformError,
} from "@/lib/httpErrors";
import { ZodError } from "zod";

jest.mock("@/app/api/fs/dialog/dialog.server", () => ({
  dialogServer: {
    openDialog: jest.fn(),
  },
}));

const mockOpenDialog = dialogServer.openDialog as jest.Mock;

const makePostRequest = (body?: unknown): NextRequest =>
  new NextRequest("http://localhost/api/fs/dialog", {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : "{invalid}",
    headers: { "Content-Type": "application/json" },
  });

describe("GET /api/fs/dialog", () => {
  it("should return 200 with the dialog service health message", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Dialog service working");
    expect(body.data).toBe("working");
  });
});

describe("POST /api/fs/dialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── successful response ──────────────────────────────────────────────────

  it("should return 200 with the selected path for a valid request", async () => {
    mockOpenDialog.mockResolvedValueOnce({ path: "/Users/test/music" });

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Path successfully selected");
    expect(body.data).toEqual({ path: "/Users/test/music" });
  });

  it("should forward the parsed body to dialogServer.openDialog", async () => {
    mockOpenDialog.mockResolvedValueOnce({ path: "/Users/test/music" });
    const prompt = "Select a valid folder";

    await POST(makePostRequest({ prompt }));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog).toHaveBeenCalledWith({ prompt });
  });

  // ─── fallback to DEFAULT_BODY ─────────────────────────────────────────────

  it("should use the default prompt when body is malformed JSON", async () => {
    mockOpenDialog.mockResolvedValueOnce({ path: "/Users/test/music" });

    const request = new NextRequest("http://localhost/api/fs/dialog", {
      method: "POST",
      body: "{not valid json",
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);

    expect(mockOpenDialog).toHaveBeenCalledWith({
      prompt: "Selecciona una carpeta",
    });
  });

  // ─── service errors ───────────────────────────────────────────────────────

  it("should return 500 when dialogServer throws InternalServerErrorException", async () => {
    mockOpenDialog.mockRejectedValueOnce(
      new InternalServerErrorException("Disk error"),
    );

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Disk error");
    expect(body.data).toBeNull();
  });

  it("should return 409 when dialogServer throws UserCanceledDialogException", async () => {
    mockOpenDialog.mockRejectedValueOnce(new UserCanceledDialogException());

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it("should return 500 when dialogServer throws UnsupportedPlatformError", async () => {
    mockOpenDialog.mockRejectedValueOnce(
      new UnsupportedPlatformError("linux is not supported"),
    );

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("linux is not supported");
  });

  it("should return 400 with Datos invalidos when dialogServer throws ZodError", async () => {
    mockOpenDialog.mockRejectedValueOnce(new ZodError([]));

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Datos invalidos");
  });

  it("should return 500 for unexpected errors not extending HttpError", async () => {
    mockOpenDialog.mockRejectedValueOnce(new Error("Unhandled crash"));

    const response = await POST(
      makePostRequest({ prompt: "Select a valid folder" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Unhandled crash");
  });
});
