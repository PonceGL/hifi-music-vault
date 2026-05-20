import type { SyncProgress, SyncResult } from "@/types/sync";

export interface SyncProgressEvent {
  type: "progress";
  data: SyncProgress;
}

export interface SyncCompleteEvent {
  type: "complete";
  data: SyncResult;
}

export interface SyncCancelledEvent {
  type: "cancelled";
  data: { moved: number };
}

export interface SyncErrorEvent {
  type: "error";
  data: { message: string };
}

export type SyncEvent =
  | SyncProgressEvent
  | SyncCompleteEvent
  | SyncCancelledEvent
  | SyncErrorEvent;
