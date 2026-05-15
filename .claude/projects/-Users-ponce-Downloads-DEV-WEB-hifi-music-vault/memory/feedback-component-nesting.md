---
name: feedback-component-nesting
description: Never nest a component folder inside another component's folder, even if it's only used by one parent
metadata:
  type: feedback
---

Never create a component folder inside another component's folder (e.g., `DetailPanel/HealthBadge/` or `TabBar/TabBarItem/` are wrong).

**Why:** Breaks the colocation and organization conventions of the project. Every component, regardless of how narrowly it's used, lives in its own folder directly under its category (`layout/`, `shared/`, `ui/`).

**How to apply:** When a component needs a sub-component, create the sub-component as a sibling folder at the same level. For example:
- ✅ `src/components/layout/HealthBadge/`
- ✅ `src/components/layout/TabBarItem/`
- ❌ `src/components/layout/DetailPanel/HealthBadge/`
- ❌ `src/components/layout/TabBar/TabBarItem/`
