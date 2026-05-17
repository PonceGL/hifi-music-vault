import { z } from "zod";

// ─── Request ──────────────────────────────────────────────────────────────────

export const validateDto = z
  .string({
    error: "El path debe ser un texto",
  })
  .min(10, { error: "El path debe tener al menos 10 caracteres" });

export type ValidateDto = z.infer<typeof validateDto>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const validateResponseDto = z.object({
  path: z.string().nonempty(),
});

export type ValidateResponseDto = z.infer<typeof validateResponseDto>;
