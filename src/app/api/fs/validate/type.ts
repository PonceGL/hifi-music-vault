export interface ValidatePathResult {
  path: string;
  exists: boolean;
  isDirectory: boolean;
  isFile: boolean;
  hasPermissions: boolean;
}
