---
trigger: always_on
---

# 1. ABSOLUTE PRIORITY: PLANNING & WORKFLOW
- **STOP & PLAN**: Do not write code immediately. Analyze requirements, explain the solution logic, and outline implementation steps. Wait for user acknowledgment.
- **Trunk-Based Development (TBD)**: Deliver small, atomic, and frequent changes. Code must be merge-ready at all times.
- **Simplicity**: Solve today's problems. Avoid over-engineering for hypothetical futures.

# 2. ARCHITECTURE & FILE STRUCTURE
- **Scalability Check**: For small projects, keep it flat. For production, use Feature-Based Architecture (`src/features/`).
- **Backend (Node/Next)**: Follow NestJS patterns (Controller -> Service -> Data Access).
- **Colocation**: Keep hooks, types, and sub-components within the feature folder they belong to.
- **Path Aliases**: Use `@/` for all internal imports. No relative paths like `../../`.

# 3. COMPONENT & HOOK STANDARDS
- **Component Declaration**: Always use `function ComponentName() {}`. Reserved `const` for internal logic only.
- **Exports**: Strictly use Named Exports. Prohibit `export default`.
- **Headless Hooks**: Logic-only hooks. No UI/CSS coupling.
- **Stability**: Memoize all returned functions (`useCallback`) and derived objects (`useMemo`).
- **TypeScript**: Use Discriminated Unions for state to avoid "impossible states" (e.g., `{ status: 'loading' | 'error' | 'success' }`).

# 4. DESIGN SYSTEM: MATERIAL 3 EXPRESSIVE
- **Visual Style**: Apply Material Design 3 Expressive. Use bold shapes (rounded-2xl/3xl) and tonal palettes.
- **Color Roles**: Use M3 semantic roles (Primary, Primary Container, Surface, etc.).
- **Responsive UX**: Mobile-First interaction. Implement M3 adaptive patterns (Bottom Nav for mobile, Nav Rail for desktop).
- **No Inline Styles**: Use Tailwind CSS. Check package.json for styling libraries before suggesting code.

# 5. LANGUAGE & DOCUMENTATION
- **Naming**: Variables, functions, and classes must be in ENGLISH.
- **UI Strings**: User-facing text must be in SPANISH (Neutral) by default.
- **No Magic Strings**: Extract all UI text and logic constants to a central file.
- **JSDoc**: Document the "Why" and "How" for hooks and reusable props. No workflow comments (e.g., "// TODO") in the source code.