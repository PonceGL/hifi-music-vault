import { NextResponse as MockNextResponse } from "@mocks/next-server";
import { z } from "zod";
import { HttpError } from "@/lib/httpErrors";

jest.mock("next/server", () => ({
  NextResponse: MockNextResponse,
}));

import { handleHttpError } from "@/lib/errorResponse";

describe("handleHttpError", () => {
  it("should handle HttpError correctly", async () => {
    const httpError = new HttpError(404, "Not Found");
    const response = handleHttpError(httpError);

    expect(response).toBeInstanceOf(MockNextResponse);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      message: "Not Found",
      data: null,
    });
  });

  it("should handle ZodError correctly in development mode", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    try {
      schema.parse({ name: 123, age: "invalid" });
    } catch (error) {
      const response = handleHttpError(error);

      expect(response).toBeInstanceOf(MockNextResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: "Datos invalidos",
        data: expect.any(Array),
      });
      expect(data.data.length).toBe(2);
      expect(data.data[0]).toHaveProperty("name");
      expect(data.data[1]).toHaveProperty("age");
    }
  });

  it("should handle unknown errors correctly", async () => {
    const error = new Error("Unknown error occurred");
    const response = handleHttpError(error);

    expect(response).toBeInstanceOf(MockNextResponse);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      message: "Unknown error occurred",
      data: null,
    });
  });

  it("should handle error without message correctly", async () => {
    const error = new Error();
    const response = handleHttpError(error);

    expect(response).toBeInstanceOf(MockNextResponse);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      message: "Error desconocido",
      data: null,
    });
  });
});
