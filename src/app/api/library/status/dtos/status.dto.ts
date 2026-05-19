import { z } from "zod";

const folderStatusDto = z.object({
  count: z.number().int().nonnegative(),
  byFormat: z.record(z.string(), z.number().int().nonnegative()),
});

export const statusResponseDto = z.object({
  downloads: folderStatusDto,
  library: folderStatusDto,
});

export type FolderStatus = z.infer<typeof folderStatusDto>;
export type StatusResponseDto = z.infer<typeof statusResponseDto>;
