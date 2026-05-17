import axios from "axios";
import { AxiosErrorAdapter } from "./index";

const adapter = new AxiosErrorAdapter();

function makeAxiosError(
  status: number | undefined,
  responseData: unknown = {},
  axiosCode?: string
) {
  const error = new axios.AxiosError(
    "Request failed",
    axiosCode ?? "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    status !== undefined
      ? ({
          data: responseData,
          status,
          headers: {},
          config: {},
          statusText: String(status),
        } as never)
      : undefined
  );
  return error;
}

describe("AxiosErrorAdapter.normalize", () => {
  describe("HTTP response errors — internal source", () => {
    it.each([
      [400, "HTTP_400"],
      [401, "HTTP_401"],
      [403, "HTTP_403"],
      [404, "HTTP_404"],
      [409, "HTTP_409"],
      [422, "HTTP_422"],
      [429, "HTTP_4XX"],
      [500, "HTTP_500"],
      [502, "HTTP_502"],
      [503, "HTTP_503"],
      [504, "HTTP_5XX"],
    ] as const)(
      "maps HTTP %i to code '%s'",
      (status, expectedCode) => {
        const result = adapter.normalize(
          makeAxiosError(status),
          "internal"
        );
        expect(result.code).toBe(expectedCode);
        expect(result.status).toBe(status);
        expect(result.source).toBe("internal");
      }
    );
  });

  describe("network-level errors", () => {
    it("maps no-response error to NETWORK_ERROR", () => {
      const error = makeAxiosError(undefined);
      const result = adapter.normalize(error, "external");
      expect(result.code).toBe("NETWORK_ERROR");
      expect(result.status).toBeNull();
      expect(result.source).toBe("external");
    });

    it("maps ECONNABORTED to TIMEOUT", () => {
      const error = makeAxiosError(undefined, {}, "ECONNABORTED");
      const result = adapter.normalize(error, "internal");
      expect(result.code).toBe("TIMEOUT");
      expect(result.status).toBeNull();
    });

    it("maps cancelled request to CANCELLED", () => {
      const error = new axios.CanceledError("Request cancelled");
      const result = adapter.normalize(error, "internal");
      expect(result.code).toBe("CANCELLED");
      expect(result.status).toBeNull();
    });
  });

  describe("message extraction", () => {
    it("uses message from response body when available", () => {
      const error = makeAxiosError(422, { message: "Campo requerido" });
      const result = adapter.normalize(error, "internal");
      expect(result.message).toBe("Campo requerido");
    });

    it("uses error field from response body as fallback", () => {
      const error = makeAxiosError(400, { error: "Bad input" });
      const result = adapter.normalize(error, "internal");
      expect(result.message).toBe("Bad input");
    });

    it("falls back to axios error message when body has no message", () => {
      const error = makeAxiosError(500, {});
      const result = adapter.normalize(error, "internal");
      expect(result.message).toBe("Request failed");
    });
  });

  describe("non-Axios errors", () => {
    it("maps a plain Error to UNKNOWN with null status", () => {
      const error = new Error("Something went wrong");
      const result = adapter.normalize(error, "external");
      expect(result.code).toBe("UNKNOWN");
      expect(result.status).toBeNull();
      expect(result.message).toBe("Something went wrong");
    });

    it("maps an unknown thrown value to UNKNOWN", () => {
      const result = adapter.normalize("oops", "internal");
      expect(result.code).toBe("UNKNOWN");
      expect(result.message).toBe("Unexpected error");
    });
  });

  describe("originalError field", () => {
    it("preserves the original error for debugging", () => {
      const error = makeAxiosError(404);
      const result = adapter.normalize(error, "internal");
      expect(result.originalError).toBe(error);
    });
  });
});
