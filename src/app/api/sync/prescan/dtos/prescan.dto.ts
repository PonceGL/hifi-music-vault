import { z } from "zod";

export const prescanResponseDto = z.object({
  toMove: z.number().int().nonnegative(),
  ignored: z.object({
    duplicates: z.number().int().nonnegative(),
    missingMetadata: z.number().int().nonnegative(),
  }),
  tagFolders: z.array(z.string()),
  depthExceededCount: z.number().int().nonnegative(),
  longPathWarnings: z.number().int().nonnegative(),
});

export type PrescanResponseDto = z.infer<typeof prescanResponseDto>;
