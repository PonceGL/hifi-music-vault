import { z } from "zod";

// ─── Request ──────────────────────────────────────────────────────────────────

export const openDialogBodyDto = z
  .object({
    prompt: z
      .string({
        error: "El prompt debe ser un texto",
      })
      .min(10, { error: "El prompt debe tener al menos 10 caracteres" }),
  })
  .strict();

export type OpenDialogBodyDto = z.infer<typeof openDialogBodyDto>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const openDialogResponseDto = z.object({
  path: z.string().nonempty(),
});

export type OpenDialogResponseDto = z.infer<typeof openDialogResponseDto>;
