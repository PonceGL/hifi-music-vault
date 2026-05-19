import { useOperationStore } from "@/store";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class OperationBusyError extends Error {
  constructor(method: string, url: string, operation: string) {
    super(
      `Cannot execute ${method} ${url}: "${operation}" operation is in progress.`,
    );
    this.name = "OperationBusyError";
  }
}

export async function apiClient(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();

  if (WRITE_METHODS.has(method)) {
    const { operationInProgress } = useOperationStore.getState();
    if (operationInProgress !== null) {
      throw new OperationBusyError(method, url, operationInProgress);
    }
  }

  return fetch(url, init);
}
