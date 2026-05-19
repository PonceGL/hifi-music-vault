import { act } from "@testing-library/react";
import { useOperationStore } from "@/store";
import { apiClient, OperationBusyError } from "./index";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function setOperation(op: "sync" | "revalidation" | null): void {
  act(() => {
    useOperationStore.setState({ operationInProgress: op });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true, status: 200 });
  setOperation(null);
});

describe("apiClient — GET requests (MFM-404)", () => {
  it("passes GET through when no operation is active", async () => {
    await apiClient("/api/library");
    expect(mockFetch).toHaveBeenCalledWith("/api/library", {});
  });

  it("passes GET through even when sync is in progress", async () => {
    setOperation("sync");
    await apiClient("/api/library");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("passes GET through even when revalidation is in progress", async () => {
    setOperation("revalidation");
    await apiClient("/api/library");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("apiClient — write requests when idle (MFM-404)", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "passes %s through when no operation is active",
    async (method) => {
      await apiClient("/api/tracks/1", { method });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    },
  );
});

describe("apiClient — write requests blocked during sync (MFM-404)", () => {
  beforeEach(() => setOperation("sync"));

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "throws OperationBusyError for %s",
    async (method) => {
      await expect(
        apiClient("/api/tracks/1", { method }),
      ).rejects.toBeInstanceOf(OperationBusyError);
    },
  );

  it("does not call fetch when blocked", async () => {
    await expect(
      apiClient("/api/tracks/1", { method: "POST" }),
    ).rejects.toBeInstanceOf(OperationBusyError);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("error message names the blocking operation", async () => {
    await expect(
      apiClient("/api/tracks/1", { method: "POST" }),
    ).rejects.toThrow(/sync/);
  });
});

describe("apiClient — write requests blocked during revalidation (MFM-404)", () => {
  beforeEach(() => setOperation("revalidation"));

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "throws OperationBusyError for %s",
    async (method) => {
      await expect(
        apiClient("/api/tracks/1", { method }),
      ).rejects.toBeInstanceOf(OperationBusyError);
    },
  );

  it("error message names the blocking operation", async () => {
    await expect(
      apiClient("/api/tracks/1", { method: "DELETE" }),
    ).rejects.toThrow(/revalidation/);
  });
});
