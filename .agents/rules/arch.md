---
trigger: always_on
---

# File Structure & Architecture (Modular vs Flat)
- **Scalability First**: Always ask the user if the project is a "Quick Prototype" or a "Production System" before suggesting a file structure.
- **Feature-Based**: For Production Systems, prefer `src/features/[feature-name]` over generic `src/components`, `src/hooks`.
- **Backend (Node/Next)**: Follow NestJS patterns. Isolate logic in `services`, handle HTTP in `controllers/routes`, and validate input with DTOs (Zod/TypeScript).
- **Colocation**: Keep tests, styles, and sub-components inside the same folder as the parent component.
- **Clean Exports**: Use `index.ts` files in feature folders to export only the public interface.
- **Path Aliases**: Enforce the use of `@/` for all internal imports. No deep relative paths allowed.

Scaling Assessment. Before creating a folder, the architect should ask: “Is this a rapid MVP or a scalable system?” If it's an MVP, prioritize a flat structure. If it's scalable, apply Feature-Based Architecture.

Domain-Based Structure. Instead of grouping by type (all hooks together), group by functionality (e.g., features/auth, features/player). Each “feature” folder should contain its own components, hooks, and local types.

Backend by Layers. In Node/Next-API, follow the NestJS pattern: route/controller -> service -> data-access/repository. Business logic never resides in the controller.

File Co-location. Keep files as close as possible to where they are used. If a component is only used in one place, it should reside in a subfolder of that location, not in /components/common.

Alias Requirement. The use of deep relative paths (../../..) is prohibited. Always use @/ or ~ to reference from the root of src or the project.

One Index.ts per Module. Each feature folder must have an index.ts that acts as a “Public API,” exporting only what is necessary to the outside. This prevents excessive coupling.