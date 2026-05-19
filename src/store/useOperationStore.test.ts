import { act } from "@testing-library/react";
import { useOperationStore } from "./useOperationStore";

function getState() {
  return useOperationStore.getState();
}

beforeEach(() => {
  act(() => {
    useOperationStore.setState({ operationInProgress: null });
  });
});

describe("useOperationStore — initial state (MFM-403)", () => {
  it("starts with no operation in progress", () => {
    expect(getState().operationInProgress).toBeNull();
  });
});

describe("useOperationStore — startSync (MFM-403)", () => {
  it("sets operationInProgress to 'sync'", () => {
    act(() => {
      getState().startSync();
    });
    expect(getState().operationInProgress).toBe("sync");
  });

  it("transitions idle → sync → idle", () => {
    expect(getState().operationInProgress).toBeNull();

    act(() => {
      getState().startSync();
    });
    expect(getState().operationInProgress).toBe("sync");

    act(() => {
      getState().clearOperation();
    });
    expect(getState().operationInProgress).toBeNull();
  });
});

describe("useOperationStore — startRevalidation (MFM-403)", () => {
  it("sets operationInProgress to 'revalidation'", () => {
    act(() => {
      getState().startRevalidation();
    });
    expect(getState().operationInProgress).toBe("revalidation");
  });

  it("transitions idle → revalidation → idle", () => {
    expect(getState().operationInProgress).toBeNull();

    act(() => {
      getState().startRevalidation();
    });
    expect(getState().operationInProgress).toBe("revalidation");

    act(() => {
      getState().clearOperation();
    });
    expect(getState().operationInProgress).toBeNull();
  });
});

describe("useOperationStore — clearOperation (MFM-403)", () => {
  it("resets to null from 'sync'", () => {
    act(() => {
      getState().startSync();
      getState().clearOperation();
    });
    expect(getState().operationInProgress).toBeNull();
  });

  it("resets to null from 'revalidation'", () => {
    act(() => {
      getState().startRevalidation();
      getState().clearOperation();
    });
    expect(getState().operationInProgress).toBeNull();
  });

  it("is a no-op when already idle", () => {
    act(() => {
      getState().clearOperation();
    });
    expect(getState().operationInProgress).toBeNull();
  });
});
