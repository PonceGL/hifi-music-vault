export const API = {
  fs: {
    dialog: "/api/fs/dialog",
    validate: "/api/fs/validate*",
    config: "/api/fs/config",
  },
} as const;

export const COOKIE = {
  folderConfigured: "folder-configured",
} as const;
