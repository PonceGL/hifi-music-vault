/**
 * Global state stores (Zustand)
 *
 * ## Convención
 * - Un archivo por store: `src/store/use[NombreStore].ts`
 * - El archivo exporta un hook: `export const use[Nombre]Store = create<...>(...)`
 * - Este barrel re-exporta todos los stores para imports limpios:
 *   `import { useShellStore } from "@/store"`
 *
 * ## Cuándo usar Zustand vs. estado local vs. TanStack Query
 * - **Zustand** → estado de UI transversal que múltiples componentes leen/escriben
 *   sin relación padre-hijo directa (ej: bloqueo del shell, tema, preferencias de usuario)
 * - **useState / useReducer** → estado local de un único componente o subtree pequeño
 * - **TanStack Query** → estado del servidor: datos que vienen de `/api/*`
 *
 * ## Importante para Next.js App Router
 * Los stores de Zustand son singletons de módulo — solo se ejecutan en el cliente.
 * Úsalos exclusivamente en Client Components (`'use client'`).
 * No accedas a un store desde un Server Component o un route handler.
 */

// Los stores se re-exportan aquí a medida que se crean:
// export { useShellStore } from "@/store/useShellStore";
