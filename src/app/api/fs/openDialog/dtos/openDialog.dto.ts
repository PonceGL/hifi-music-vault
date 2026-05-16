import { z } from "zod";

// ─── Request ──────────────────────────────────────────────────────────────────

export const openDialogBodyDto = z
  .object({
    prompt: z
      .string({
        error: "El prompt debe ser un texto",
      })
      .min(1, { error: "El prompt no puede estar vacío" })
      .optional(),
  })
  .strict();

export type OpenDialogBodyDto = z.infer<typeof openDialogBodyDto>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const openDialogResponseDto = z.object({
  path: z.string().nullable(),
});

export type OpenDialogResponseDto = z.infer<typeof openDialogResponseDto>;
