import { createHttpClient, internalHttpClient } from "./index";
import type { HttpClient } from "./types";

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
