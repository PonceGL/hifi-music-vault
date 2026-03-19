---
trigger: always_on
---

# General Coding & UX Standards
- **Naming**: All code symbols (variables, functions, components) must be in English.
- **UI Text**: All user-facing strings must be in Spanish by default.
- **No Magic Strings**: Never use hardcoded strings for logic or UI. Use a centralized constants file. Check for existing constants before creating new ones.
- **Documentation**: Use JSDoc for logic, hooks, and reusable component props. Focus on "why" and "how to use". Do not leave workflow comments (e.g., "Next step here") in the source code.
- **Styling**: Absolutely no inline styles. Use Tailwind CSS classes if available. Check `package.json` for styling libraries before suggesting CSS.
- **Responsive UX**: Implementation must be Mobile-First. Consider touch targets for mobile and hover states/keyboard shortcuts for desktop. Layouts should adapt from vertical (mobile) to horizontal (desktop) meaningfully.


Code in English, UI in Spanish. All naming conventions (variables, functions, classes, components) must be in English. User-facing text must be in Spanish (Mexico/Neutral) by default, unless an i18n configuration is detected.

No Magic Strings. Do not use string literals for UI labels or comparison logic. They must be extracted to a constants file (e.g., constants/texts.ts or constants/config.ts). Before creating a new one, check if the value already exists.

Intent Documentation. Use JSDoc to document the purpose and parameters of Hooks, Functions, and Classes. In components, document the props (especially variants and reusable components). Do not leave “to-do list” comments in the code; those belong in the chat.

No inline styles. The use of `style={{...}}` is prohibited. The template must detect the installed library (prioritizing Tailwind CSS) and use its utilities. If it does not detect any, it must prompt the user before suggesting a styling solution.

Interaction Design (not just Layout). Prioritize Mobile-First. Consider touch-based interactions for mobile/tablet and cursor precision for desktop. Elements should stack vertically on mobile and expand horizontally on desktop, adapting scrolling and gestures.