import { promises as fs } from "fs";

export async function isDuplicate(destPath: string): Promise<boolean> {
  try {
    await fs.access(destPath);
    return true;
  } catch {
    return false;
  }
}
