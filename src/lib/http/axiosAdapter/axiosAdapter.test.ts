import axios from "axios";
import { AxiosHttpClient } from "./index";
import type { ErrorAdapter, AppHttpError } from "../types";

// ─── Test doubles ─────────────────────────────────────────────────────────────

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

const mockAxiosInstance = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  patch: mockPatch,
  delete: mockDelete,
} as unknown as ReturnType<typeof axios.create>;

const mockNormalize = jest.fn();
const mockErrorAdapter: ErrorAdapter = { normalize: mockNormalize };

const normalizedError: AppHttpError = {
  message: "Not found",
  status: 404,
  code: "HTTP_404",
  source: "internal",
};

function makeAxiosResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    headers: { "content-type": "application/json" },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AxiosHttpClient", () => {
  let client: AxiosHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNormalize.mockReturnValue(normalizedError);
    client = new AxiosHttpClient(
      mockAxiosInstance,
      mockErrorAdapter,
      "internal",
    );
  });

  describe("GET", () => {
    it("returns mapped HttpResponse on success", async () => {
      mockGet.mockResolvedValueOnce(makeAxiosResponse({ id: 1 }));
      const result = await client.get<{ id: number }>("/tracks");
      expect(result.data).toEqual({ id: 1 });
      expect(result.status).toBe(200);
      expect(result.headers).toEqual({ "content-type": "application/json" });
    });

    it("forwards url and config to axios", async () => {
      mockGet.mockResolvedValueOnce(makeAxiosResponse({}));
      await client.get("/tracks", { params: { page: 1 } });
      expect(mockGet).toHaveBeenCalledWith(
        "/tracks",
        expect.objectContaining({ params: { page: 1 } }),
      );
    });

    it("throws normalized AppHttpError on failure", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network error"));
      await expect(client.get("/tracks")).rejects.toEqual(normalizedError);
      expect(mockNormalize).toHaveBeenCalledWith(expect.any(Error), "internal");
    });
  });

  describe("POST", () => {
    it("returns mapped HttpResponse on success", async () => {
      mockPost.mockResolvedValueOnce(makeAxiosResponse({ created: true }, 201));
      const result = await client.post("/tracks", { title: "Song" });
      expect(result.data).toEqual({ created: true });
      expect(result.status).toBe(201);
    });

    it("forwards body and config to axios", async () => {
      mockPost.mockResolvedValueOnce(makeAxiosResponse({}));
      await client.post(
        "/tracks",
        { title: "Song" },
        { headers: { "x-custom": "1" } },
      );
      expect(mockPost).toHaveBeenCalledWith(
        "/tracks",
        { title: "Song" },
        expect.objectContaining({ headers: { "x-custom": "1" } }),
      );
    });

    it("throws normalized error on failure", async () => {
      mockPost.mockRejectedValueOnce(new Error());
      await expect(client.post("/tracks")).rejects.toEqual(normalizedError);
    });
  });

  describe("PUT", () => {
    it("returns mapped response on success", async () => {
      mockPut.mockResolvedValueOnce(makeAxiosResponse({ updated: true }));
      const result = await client.put("/tracks/1", { title: "Updated" });
      expect(result.data).toEqual({ updated: true });
    });

    it("throws normalized error on failure", async () => {
      mockPut.mockRejectedValueOnce(new Error());
      await expect(client.put("/tracks/1")).rejects.toEqual(normalizedError);
    });
  });

  describe("PATCH", () => {
    it("returns mapped response on success", async () => {
      mockPatch.mockResolvedValueOnce(makeAxiosResponse({ patched: true }));
      const result = await client.patch("/tracks/1", { title: "Patched" });
      expect(result.data).toEqual({ patched: true });
    });

    it("throws normalized error on failure", async () => {
      mockPatch.mockRejectedValueOnce(new Error());
      await expect(client.patch("/tracks/1")).rejects.toEqual(normalizedError);
    });
  });

  describe("DELETE", () => {
    it("returns mapped response on success", async () => {
      mockDelete.mockResolvedValueOnce(makeAxiosResponse(null, 204));
      const result = await client.delete("/tracks/1");
      expect(result.status).toBe(204);
    });

    it("forwards config to axios", async () => {
      mockDelete.mockResolvedValueOnce(makeAxiosResponse({}));
      const signal = new AbortController().signal;
      await client.delete("/tracks/1", { signal });
      expect(mockDelete).toHaveBeenCalledWith(
        "/tracks/1",
        expect.objectContaining({ signal }),
      );
    });

    it("throws normalized error on failure", async () => {
      mockDelete.mockRejectedValueOnce(new Error());
      await expect(client.delete("/tracks/1")).rejects.toEqual(normalizedError);
    });
  });

  describe("source propagation", () => {
    it("passes 'external' source to errorAdapter when client is external", async () => {
      const externalClient = new AxiosHttpClient(
        mockAxiosInstance,
        mockErrorAdapter,
        "external",
      );
      mockGet.mockRejectedValueOnce(new Error());
      await expect(externalClient.get("/search")).rejects.toBeDefined();
      expect(mockNormalize).toHaveBeenCalledWith(expect.any(Error), "external");
    });
  });
});
