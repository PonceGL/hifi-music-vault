# Design System — Music Files Manager

## Brand Identity

**Product name:** Music Files Manager
**Concept:** Technical Elegance
**Description:** A local music library management tool for audiophiles and collectors. The interface communicates precision and power while remaining approachable to any user. Album artwork is always the visual protagonist. Information density is high but never overwhelming.
**Visual references:** Linear (technical precision), Apple Music (artwork-first), Apple HIG (adaptive layout transforms per device)
**Tone:** Minimal, refined, serious. No decorative color. No gradients. No playfulness that conflicts with precision.

---

## Color Palette

### Dark Mode (default)

| Token | Hex | Usage |
|-------|-----|-------|
| background | #0a0a0d | App base background |
| surface-primary | #111114 | Cards, sidebar, topbar |
| surface-secondary | #18181c | Inputs, hover states, alternating rows |
| surface-elevated | #1e1e22 | Dropdowns, tooltips, modals |
| surface-overlay | #323238 | Critical modal overlays |
| border | #1e1e22 | Soft dividers, card borders |
| border-strong | #4e4e58 | Input borders, visible dividers |
| text-primary | #f8f8f9 | Primary text |
| text-secondary | #9898a2 | Artists, subtitles, metadata |
| text-tertiary | #4e4e58 | Placeholders, low-hierarchy labels |
| text-on-accent | #ffffff | Text on accent-colored elements |
| accent | #6366f1 | Primary accent — buttons, selection, active states |
| accent-hover | #818cf8 | Accent hover state |
| accent-subtle | rgba(99,102,241,0.12) | Lossless badge backgrounds, selected rows |

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| background | #f8f8f9 | App base background |
| surface-primary | #ffffff | Cards, sidebar, topbar |
| surface-secondary | #f0f0f2 | Inputs, hover states |
| surface-elevated | #ffffff | Modals, dropdowns (differentiated by shadow) |
| surface-overlay | #e2e2e6 | Overlays |
| border | #e2e2e6 | Soft dividers |
| border-strong | #c8c8ce | Input borders |
| text-primary | #111114 | Primary text |
| text-secondary | #6e6e78 | Subtitles, metadata |
| text-tertiary | #9898a2 | Placeholders |
| text-on-accent | #ffffff | Text on accent |
| accent | #4f46e5 | Primary accent (darker for light bg contrast) |
| accent-hover | #6366f1 | Accent hover |
| accent-subtle | rgba(79,70,229,0.10) | Subtle accent backgrounds |

### Semantic Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| health-green | #22c55e | Complete file — all metadata present |
| health-yellow | #eab308 | Minor issues — missing genre or artwork |
| health-orange | #f97316 | Missing album |
| health-red | #ef4444 | Critical — missing artist/title or corrupted file |

> **Rule:** Health colors are the ONLY chromatic colors in the UI besides accent indigo/violet. Never use health colors decoratively.

### Audio Format Colors

| Format | Text Color | Background |
|--------|-----------|------------|
| FLAC | #818cf8 (indigo-light) | accent-subtle |
| ALAC | #a78bfa (violet-light) | accent-subtle |
| MP3 | #6b7280 (gray) | surface-secondary |
| WAV | #6b7280 (gray) | surface-secondary |

---

## Typography

### Font Families

| Role | Family | Usage |
|------|--------|-------|
| UI / Display | Geist Sans | All interface text: titles, labels, body, buttons, nav |
| Technical / Mono | Geist Mono | File paths, track duration (3:45), bitrate (320kbps), sample rate (96kHz), file size (47.2 MB), track numbers (#06), MusicBrainz IDs |

> **Critical rule:** Geist Mono is used EXCLUSIVELY for technical data. Never for labels, titles, or descriptive text.

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| display | 30px / 1.875rem | 700 | 1.25 | -0.025em | Onboarding titles only |
| heading-xl | 24px / 1.5rem | 600 | 1.25 | -0.025em | Page section titles |
| heading-lg | 20px / 1.25rem | 600 | 1.25 | -0.025em | Modal titles, panel titles |
| heading-md | 18px / 1.125rem | 600 | 1.25 | 0 | Sub-section headings |
| body-md | 16px / 1rem | 400 | 1.5 | 0 | Long-form reading text |
| body-sm | 14px / 0.875rem | 400 | 1.5 | 0 | Primary list text, track titles |
| body-sm-medium | 14px / 0.875rem | 500 | 1.5 | 0 | Track titles in list (emphasized) |
| label-sm | 12px / 0.75rem | 500 | 1.25 | 0 | Badges, chips, secondary labels |
| label-xs | 12px / 0.75rem | 600 | 1 | 0.05em | UPPERCASE section labels (ALL CAPS) |
| mono-sm | 14px / 0.875rem | 400 | 1.5 | 0 | Durations, sizes (Geist Mono) |
| mono-xs | 12px / 0.75rem | 400 | 1.25 | 0 | File paths, IDs, bitrates (Geist Mono) |

---

## Spacing

Base unit: 4px

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| space-1 | 4px | p-1 / gap-1 | Minimal inline gap |
| space-2 | 8px | p-2 / gap-2 | Badge padding, compact row gap |
| space-3 | 12px | p-3 / gap-3 | Button padding sm |
| space-4 | 16px | p-4 / gap-4 | Card padding, standard gap |
| space-5 | 20px | p-5 / gap-5 | Panel inner padding |
| space-6 | 24px | p-6 / gap-6 | Section padding horizontal |
| space-8 | 32px | p-8 / gap-8 | Between major sections |
| space-12 | 48px | p-12 / gap-12 | Between groups |
| space-16 | 64px | p-16 / gap-16 | Generous breathing room (onboarding) |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Badges, small tags, format chips |
| radius-md | 8px | Inputs, buttons, cards, rows |
| radius-lg | 12px | Modals, large panels, section cards |
| radius-xl | 16px | Album artwork in detail panel |
| radius-full | 9999px | Pill buttons, avatar circles, health dots |

---

## Elevation & Shadows

Dark mode: elevation is communicated primarily through surface color (lighter = higher). Shadows are minimal.
Light mode: shadows are necessary to separate layers.

| Level | Surface | Shadow (dark) | Shadow (light) | Examples |
|-------|---------|---------------|----------------|---------|
| 0 — Base | background | none | none | App background |
| 1 — Content | surface-primary | 0 1px 2px rgba(0,0,0,0.4) | 0 1px 3px rgba(0,0,0,0.08) | Cards, sidebar, topbar |
| 2 — Interactive | surface-secondary | 0 1px 2px rgba(0,0,0,0.4) | 0 2px 4px rgba(0,0,0,0.06) | Inputs, hover rows |
| 3 — Elevated | surface-elevated | 0 4px 12px rgba(0,0,0,0.5) | 0 4px 12px rgba(0,0,0,0.10) | Dropdowns, popovers |
| 4 — Floating | surface-elevated | 0 8px 24px rgba(0,0,0,0.6) | 0 8px 24px rgba(0,0,0,0.12) | Modals, sheets |
| 5 — Critical | surface-overlay | 0 16px 40px rgba(0,0,0,0.7) | 0 16px 40px rgba(0,0,0,0.15) | Blocking modals |

**Focus ring:** `0 0 0 2px {background}, 0 0 0 4px {accent}` — applied to all interactive elements on keyboard focus.

---

## Layout

### Breakpoints

| Name | Range | Navigation Pattern |
|------|-------|--------------------|
| mobile | < 640px | Tab bar fixed bottom (4 items max) |
| tablet | 768px – 1279px | Collapsible sidebar left (240px expanded / 64px icons-only) |
| desktop | ≥ 1280px | Fixed sidebar 240px + optional detail panel 320px right |

### Fixed Dimensions

| Element | Value |
|---------|-------|
| Topbar height | 52px |
| Sidebar width (expanded) | 240px |
| Sidebar width (collapsed) | 64px |
| Tab bar height (mobile) | 64px + safe-area-inset-bottom |
| Detail panel width | 320px |
| Track row height | 52px |
| Modal max-width sm | 360px |
| Modal max-width md | 480px |
| Modal max-width lg | 640px |

### Content Padding

| Breakpoint | Horizontal padding |
|------------|-------------------|
| Mobile | 16px |
| Tablet | 24px |
| Desktop | 32px |

---

## Components

### Button

**Variants:**

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| primary | accent | text-on-accent | none | Main action per screen — only one visible at a time |
| secondary | surface-secondary | text-primary | border | Secondary action |
| destructive | health-red | white | none | Irreversible destructive actions |
| ghost | transparent | text-secondary | none | Tertiary actions, toolbars |
| link | transparent | accent | none | Inline navigation |

**Sizes:**

| Size | Height | Padding H | Font | Icon size | Usage |
|------|--------|-----------|------|-----------|-------|
| sm | 32px | 12px | 12px | 14px | Secondary actions in lists |
| md (default) | 36px | 16px | 14px | 16px | Most buttons |
| lg | 44px | 24px | 16px | 18px | Primary CTAs, onboarding |
| icon | 36px | 0 (square) | — | 18px | Icon-only buttons (require tooltip) |

**States:** default → hover (150ms transition) → active (scale 0.98) → focus (ring) → disabled (opacity-50, cursor-not-allowed)

**Safety rule:** Destructive buttons never execute directly. They always open a confirmation dialog. The button is only the trigger.

---

### Input

**Default:**
- Height: 36px
- Padding: 0 12px
- Font: body-sm (14px)
- Background: surface-secondary
- Border: 1px border
- Border-radius: radius-md (8px)
- Placeholder: text-tertiary

**States:**
- Focus: border-color → accent, box-shadow → focus ring
- Error: border-color → health-red
- Warning: border-color → health-yellow
- Disabled: opacity-50, cursor-not-allowed

**Search input variant:**
- Height: 40px
- Padding-left: 36px (space for Search icon at left-3)
- Icon: Search 16px at absolute left-3, color text-tertiary

---

### Track Row

The most important component. Height: 52px.

**Anatomy (left to right):**
1. Checkbox (16px) — hidden until any row is selected; appears on hover individually
2. Health dot (8px circle, solid) — always visible, flush left
3. Album thumbnail (36×36px, radius-md) — artwork or placeholder
4. Text block (flex, truncate): Title (body-sm-medium, text-primary) / Artist (body-sm, text-secondary)
5. Flexible spacer
6. Format badge (label-sm, Geist Mono)
7. Duration (mono-sm, text-secondary, Geist Mono)
8. More options menu trigger (MoreHorizontal icon, 18px, appears on hover)

**Column visibility by breakpoint:**
- Mobile: thumbnail + title/artist + duration + ⋯
- Tablet: health-dot + thumbnail + title + artist + duration + ⋯
- Desktop: checkbox + health-dot + thumbnail + title + artist + album + year + format + duration + ⋯

**States:**

| State | Background | Left border |
|-------|-----------|-------------|
| Default | transparent | none |
| Hover | surface-secondary | none |
| Selected | accent-subtle | 2px solid accent |
| Error/Corrupted | transparent (opacity-70) | none |

**Transition:** background 100ms ease

---

### Track Card (Grid View)

**Dimensions:** ~160px wide, variable height.

**Structure:**
1. Album artwork (aspect-square, 100% width, radius-lg top, square bottom)
   - With image: object-cover
   - Without image: surface-secondary background + Music icon 28px centered, text-tertiary
   - Health dot: 10px, absolute top-right corner with 2px surface-primary border
   - Hover overlay: rgba(0,0,0,0.20) + MoreHorizontal button centered
2. Info section (padding 10px 12px):
   - Format badge
   - Title (body-sm-medium, truncate)
   - Artist (label-sm, text-secondary, truncate)

**Hover state:** scale(1.02), shadow-md, 150ms ease

---

### Health Dot

**Sizes:**
- Standard (list): 8px solid circle
- Large (cards, health view): 10px solid circle with 2px surface-primary border

**Colors:** health-green / health-yellow / health-orange / health-red

**Tooltip on hover:** "Complete" / "Missing: genre" / "Missing: album" / "Corrupted file"

**Accessibility:** Always has `aria-label="Health: [status]"`. Color alone is never the only indicator — paired with tooltip text.

---

### Format Badge

- Font: Geist Mono, label-sm, uppercase
- Padding: 2px 8px
- Border-radius: radius-sm (4px)
- FLAC: color #818cf8, background accent-subtle
- ALAC: color #a78bfa, background accent-subtle
- MP3 / WAV: color #6b7280, background surface-secondary

---

### Health Badge (detail panel)

Larger version for use in the detail panel and health view.

- Layout: health-dot (8px) + text
- Background: health-color at 15% opacity
- Border: 1px health-color at 30% opacity
- Text: health-color, label-sm
- Example: "⚠ Missing: genre"

---

### Sidebar Nav Item

**Expanded (240px):**
- Height: 40px
- Padding: 0 12px
- Layout: icon (18px) + label (body-sm) + count badge (optional, Geist Mono label-xs, text-tertiary)
- States: default (text-secondary, transparent bg) / hover (text-primary, surface-secondary) / active (text-accent, accent-subtle, 2px left border solid accent)

**Collapsed (64px, tablet):**
- Only icon centered (18px)
- Tooltip on hover with label name
- Active state: icon in accent color, accent-subtle background

---

### Modal / Dialog

**Structure:**
- Header: title + optional close button (✕)
- Content: scrollable if needed
- Footer: always sticky at bottom — Cancel (left) + Action (right)

**Overlay opacity by type:**

| Type | Overlay | Close on Esc | Close on backdrop click |
|------|---------|-------------|------------------------|
| Informational | rgba(0,0,0,0.50) | Yes | Yes |
| Confirmation | rgba(0,0,0,0.60) | Yes | No |
| Critical blocking | rgba(0,0,0,0.80) | No | No |
| Process in progress | rgba(0,0,0,0.90) | No | No |

**Focus rule:** In confirmation modals, initial focus is always on the Cancel button, never on the destructive action.

---

### Progress Bar

**Determinate (known percentage):**
- Height: 8px (h-2)
- Track: surface-secondary, radius-full
- Fill: accent, radius-full
- Animation: shimmer effect on active fill
- Percentage shown in Geist Mono text-sm text-secondary to the right

**Indeterminate (unknown duration):**
- Same dimensions
- Animated block moving left-to-right, 1.5s loop

---

### Toast Notifications

**Position:** Bottom-right desktop/tablet. Bottom-center full-width mobile.
**Max stack:** 3 visible. Newest on top.

| Variant | Icon | Color | Auto-dismiss |
|---------|------|-------|-------------|
| success | CheckCircle2 | health-green | 4 seconds |
| info | Info | accent | 4 seconds |
| warning | AlertCircle | health-yellow | 6 seconds |
| error | XCircle | health-red | Never — manual dismiss required |

**Structure:** icon (left, top-aligned) + title (body-sm semibold) + description (label-sm text-secondary) + dismiss button ✕ (top-right)

---

### Empty State

Used when a view has no content. Always includes a suggested action.

**Structure:**
1. Illustrative icon — 48px, text-tertiary (exception: health-green for "all healthy" state)
2. Title — heading-md, text-primary
3. Description — body-sm, text-secondary, max-width 280px, centered
4. CTA button — primary or ghost depending on context

---

### Action Bar (multi-selection)

Appears fixed at bottom of content area when ≥1 track is selected.

- Background: surface-elevated
- Border-top: 1px border-strong
- Shadow: 0 -4px 20px rgba(0,0,0,0.3)
- Padding: 12px 24px
- Layout: [count label] [actions with dividers] [Cancel right]
- Entry animation: slide-up 200ms ease-out
- Exit animation: slide-down 150ms ease-in

---

### Skeleton Loading

Used when list/grid data is loading. Matches exact dimensions of real content.

- Color: surface-secondary
- Animation: pulse — opacity 0.4 → 1.0 → 0.4, 1.5s linear infinite
- Stagger delay: 50ms between rows (cascade effect)
- Track row skeleton: same 52px height, approximate widths for each column element

---

## Icons

**Library:** Lucide React — consistent stroke weight, 1500+ icons.

**Sizes:**
- 16px: inline with text-xs, badge icons
- 18px: sidebar navigation, topbar
- 20px: action buttons, list actions
- 24px: standalone actions
- 48px: empty states, illustrative

**Icon map:**

| Context | Icon name |
|---------|-----------|
| Library | Library |
| Artists | Mic2 |
| Albums | Disc3 |
| Playlists | ListMusic |
| Health | HeartPulse |
| Settings | Settings2 |
| Sync | RefreshCw |
| Edit metadata | Tag |
| Search | Search |
| Show in Finder | FolderOpen |
| Add to playlist | ListPlus |
| Export | Upload |
| Convert audio | FileAudio |
| Delete | Trash2 |
| Health OK | CheckCircle2 |
| Warning | AlertCircle |
| Error / Corrupt | XCircle |
| No artwork | ImageOff |
| No tags | TagOff |
| Close | X |
| Detail panel open | PanelRightOpen |
| List view | LayoutList |
| Grid view | LayoutGrid |
| More options | MoreHorizontal |
| Sort | ArrowUpDown |
| Filter | Filter |
| Toggle sidebar | PanelLeftClose / PanelLeftOpen |
| Drag handle | GripVertical |
| External link | ArrowUpRight |
| Music / Audio | Music |
| Waves / Lossless | Waves |
| Folder | Folder |
| Playlist file | FileText |
| Back | ArrowLeft |
| Download | Download |

---

## Motion & Animation

### Principle
Animations are functional, not decorative. Every animation communicates something: an element appeared, moved, or completed. If removing an animation makes the UI confusing, it's a good animation. If removing it changes nothing, it shouldn't exist.

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| instant | 0ms | Immediate state changes (active/inactive) |
| fast | 100ms | Hover, focus rings, color transitions |
| normal | 200ms | Element appearance, expand/collapse |
| slow | 300ms | Modals, sheets, panels |
| x-slow | 500ms | Onboarding animations, empty states |

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| default | cubic-bezier(0.16, 1, 0.3, 1) | Natural spring — most transitions |
| ease-in | cubic-bezier(0.4, 0, 1, 1) | Exiting elements |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | Entering elements |
| linear | linear | Progress bars only |

### Component-specific animations

| Component | Animation |
|-----------|-----------|
| Track row hover | Background 100ms ease-default |
| Modal open | opacity 0→1 + scale 0.96→1, 200ms ease-out |
| Modal close | opacity 1→0 + scale 1→0.96, 150ms ease-in |
| Detail panel | translateX 100%→0, 300ms ease-out |
| Toast appear | translateY 100%→0 + opacity, 200ms ease-out |
| Toast dismiss | translateX 0→100%, 150ms ease-in |
| Action bar appear | translateY 100%→0, 200ms ease-out |
| Sidebar collapse | width 240px→64px, 200ms ease-default |
| Skeleton | opacity 0.4→1→0.4, 1.5s linear infinite |
| Spinner | rotate 360deg, 0.8s linear infinite |

**Reduced motion:** All animations disabled when `prefers-reduced-motion: reduce` is active.

---

## Interaction Patterns

### Double Confirmation (all destructive actions)

Standard flow — no exceptions:

1. **Trigger button** in UI (verb in infinitive: "Delete", "Move", "Apply")
2. **Preview dialog** — shows exactly what will happen. Button: "Yes, [verb]". Cancel always left. Initial focus on Cancel.
3. **Final confirmation dialog** (if irreversible) — "This action cannot be undone." Button: "Confirm" (destructive variant). Cancel always available.

### Multi-selection

- Checkboxes are hidden in resting state
- On first row selection: all checkboxes become visible across the entire list
- Action bar slides up from bottom
- Table header shows indeterminate checkbox if partial selection
- On deselect all: checkboxes hide, action bar slides down

### Empty data display

- Always show `—` (em dash) in text-tertiary for missing values
- Never show "null", "undefined", or empty strings
- Placeholder images: surface-secondary background + Music icon centered, always same border-radius as real artwork

---

## Accessibility

**Standard:** WCAG 2.1 Level AA minimum.

**Contrast ratios (dark mode):**
- text-primary / background: 15.8:1 (AAA)
- text-secondary / background: 4.8:1 (AA)
- accent / background: 4.5:1 (AA)
- health-red / background: 5.1:1 (AA)

**Keyboard navigation:**
- All interactive elements reachable via Tab in DOM order
- Modals implement focus trap (Radix UI/shadcn handles this)
- Escape closes: modals, sheets, dropdowns, search overlay, detail panel

**Global shortcuts:**
- Cmd/Ctrl + K → Global search
- Cmd/Ctrl + , → Settings
- Escape → Close panel / cancel selection

**ARIA requirements:**
- Health dots: `aria-label="Health: [status]"` — color alone is not sufficient
- Format badges: `aria-label="Format: FLAC"`
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Toasts: `role="status"` (info/success/warning) or `role="alert"` (error)
- Active sidebar item: `aria-current="page"`
- Blocking modals: `aria-modal="true"` + focus trap
- Decorative icons: `aria-hidden="true"`
- Functional icon-only buttons: `aria-label` required

---

## Design Rules (Non-negotiable)

1. **One primary button** per visible section or modal at a time.
2. **Destructive actions** never execute on single click. Always require a confirmation dialog.
3. **Cancel button** in confirmation modals always receives initial keyboard focus — never the destructive action.
4. **Geist Mono** is used exclusively for technical data (paths, durations, sizes, bitrates, IDs). Never for labels or descriptive text.
5. **Album artwork** is the visual protagonist whenever present. Design around it.
6. **Missing data** is displayed as `—` (text-tertiary), never as empty space or "N/A".
7. **The only chromatic colors** in the UI are: accent indigo/violet and the 4 health status colors. Everything else is grayscale.
8. **No gradients** of chromatic colors. Background gradients using grays are acceptable for overlays only.
9. **Sidebar** is always visible on desktop (never collapses). Collapsible on tablet. Replaced by tab bar on mobile.
10. **UI blocking** during sync/export: sidebar opacity-40, topbar buttons opacity-40, cursor: default everywhere except active Cancel/Pause button.
