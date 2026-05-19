"use client";

import { create } from "zustand";

export type OperationType = "sync" | "revalidation";

export interface OperationState {
  operationInProgress: OperationType | null;
  startSync: () => void;
  startRevalidation: () => void;
  clearOperation: () => void;
}

export const useOperationStore = create<OperationState>((set) => ({
  operationInProgress: null,

  startSync: () => set({ operationInProgress: "sync" }),

  startRevalidation: () => set({ operationInProgress: "revalidation" }),

  clearOperation: () => set({ operationInProgress: null }),
}));
