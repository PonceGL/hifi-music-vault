export type UIMode = "simple" | "advanced";

export type Theme = "dark" | "light" | "system";

export type ViewMode = "list" | "grid";

export type CollisionStrategy = "album" | "numeric" | "ask";

export type PageSize = 25 | 50 | 100 | 200;

export interface FolderConfig {
  downloadsPath: string | null;
  libraryPath: string | null;
}

export interface UserSettings {
  theme: Theme;
  uiMode: UIMode;
  viewMode: ViewMode;
  pageSize: PageSize;
  fixAlbumArtMacOS: boolean;
  collisionStrategy: CollisionStrategy;
  folders: FolderConfig;
}
