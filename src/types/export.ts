import type { CollisionStrategy } from "./settings";

export type { CollisionStrategy };

export type ExportAction = "copy" | "move";
export type ExportStructure = "preserve" | "flatten";
export type ExportFormat = "original" | "mp3_320";

export interface ExportOptions {
  action: ExportAction;
  structure: ExportStructure;
  format: ExportFormat;
  collisionStrategy: CollisionStrategy;
  destinationPath: string;
  trackIds: string[];
}

export interface ExportResult {
  copied: number;
  converted: number;
  errors: number;
  skipped: number;
}
