---
trigger: always_on
---

Separate logic from presentation. Hooks should not return JSX elements, CSS classes, or style objects. They should return only data (state) and control functions (handlers). The component is solely responsible for the UI.

Single Responsibility Principle. Avoid “God Hooks.” If a hook exceeds 100 lines or handles more than two domains (e.g., fetching + form validation), it should be split into atomic hooks and combined into a composition hook if necessary.

Ensure stability by contract. Every function returned by a hook must be wrapped in `useCallback`, and every derived object/array in `useMemo`. This prevents unnecessary re-renders in child components that use these values as dependencies.

Avoid impossible states. Do not use multiple `useState` hooks to handle loading/error states (e.g., `isLoading`, `isError`). Use a single state object with a discriminated union (TypeScript) or `useReducer` to ensure state consistency (e.g., `status: ‘loading’ | ‘success’ | ‘error’`).

Derived state based on synchronization. Do not use useEffect to update local state based on changes to props or other states. If a value can be computed at render time (using useMemo if it is expensive), it must be done outside of an effect.

Dependency integrity. Do not manually omit dependencies. If a dependency causes infinite cycles, the problem lies in the code structure or lack of referential stability, not the linter. Refactor before using // eslint-disable-line.

Environment awareness (Next.js/SSR). Validate whether the hook’s logic requires the `window` or `document` object. If so, ensure the hook runs only on the client and issue a warning if it is attempted to be imported into a Server Component.