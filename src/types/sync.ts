export type SyncPhase =
  | "scanning"
  | "organizing"
  | "moving"
  | "updating-playlists";

export type SyncStatus =
  | "idle"
  | "prescanning"
  | "confirming"
  | "running"
  | "completed"
  | "cancelled"
  | "error";

export interface SyncProgress {
  phase: SyncPhase;
  current: number;
  total: number;
  currentFile: string | null;
  percentage: number;
}

export interface SyncResult {
  moved: number;
  duplicatesSkipped: number;
  withWarnings: number;
  errors: number;
  playlistsUpdated: string[];
}

export interface SyncError {
  filePath: string;
  errorCode: string;
  message: string;
}
