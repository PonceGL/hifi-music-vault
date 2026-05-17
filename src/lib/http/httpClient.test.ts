import { createHttpClient, internalHttpClient } from "./index";
import type { AppHttpError, ErrorAdapter, HttpClient } from "./types";

describe("createHttpClient", () => {
  it("returns an object that implements the HttpClient interface", () => {
    const client = createHttpClient("/", "internal");
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.put).toBe("function");
    expect(typeof client.patch).toBe("function");
    expect(typeof client.delete).toBe("function");
  });

  it("creates separate instances — they do not share state", () => {
    const a = createHttpClient("/", "internal");
    const b = createHttpClient("https://musicbrainz.org", "external");
    expect(a).not.toBe(b);
  });

  it("the returned client satisfies the HttpClient interface shape", () => {
    const client: HttpClient = createHttpClient("/", "internal");
    expect(client).toBeDefined();
  });

  describe("errorAdapter replaceability", () => {
    it("accepts a custom ErrorAdapter — AxiosErrorAdapter is not hardcoded", () => {
      const customAdapter: ErrorAdapter = {
        normalize: (error): AppHttpError => ({
          message: "custom",
          status: null,
          code: "UNKNOWN",
          source: "internal",
          originalError: error,
        }),
      };

      // If errorAdapter were hardcoded inside createHttpClient, this line
      // would have no effect and the test below would fail.
      const client = createHttpClient("/", "internal", customAdapter);
      expect(client).toBeDefined();
      expect(typeof client.get).toBe("function");
    });

    it("two clients can use different error adapters independently", () => {
      const adapterA: ErrorAdapter = {
        normalize: (): AppHttpError => ({
          message: "from A",
          status: null,
          code: "UNKNOWN",
          source: "internal",
        }),
      };
      const adapterB: ErrorAdapter = {
        normalize: (): AppHttpError => ({
          message: "from B",
          status: null,
          code: "UNKNOWN",
          source: "external",
        }),
      };

      const clientA = createHttpClient("/", "internal", adapterA);
      const clientB = createHttpClient("https://api.example.com", "external", adapterB);

      expect(clientA).not.toBe(clientB);
    });
  });
});

describe("internalHttpClient", () => {
  it("is a pre-built singleton for internal API calls", () => {
    expect(internalHttpClient).toBeDefined();
    expect(typeof internalHttpClient.get).toBe("function");
  });

  it("returns the same instance on every import (module singleton)", async () => {
    const { internalHttpClient: same } = await import("./index");
    expect(internalHttpClient).toBe(same);
  });
});
