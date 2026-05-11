# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.
Read it fully before writing any code, creating any file, or suggesting any architecture.

@AGENTS.md

---

## Commands

```bash
npm run dev      # development server (Turbopack, port 3000)
npm run build    # production build (Turbopack)
npm run start    # serve production build
npm run lint     # ESLint
npm run test     # Vitest (not yet configured — do not create test infra without instruction)
```

---

## Stack

- **Next.js 16** — App Router, Turbopack by default, React Compiler enabled (`reactCompiler: true`)
- **React 19** with TypeScript 5 — strict mode, path alias `@/*` → `./src/*`
- **Tailwind CSS v4** — no `tailwind.config.*`; all theme tokens live in `src/app/globals.css` as CSS custom properties
- **shadcn/ui** — component primitives installed per component, not as a full library. Each installed component is cleaned and refactored after install (see Component Rules below)
- **Lucide React** — icon library, the only icon system used in this project
- **Geist Sans + Geist Mono** — the only two typefaces used. Geist Mono is exclusively for technical data

---

## Next.js 16 — Critical Differences

**Turbopack is the default** for both `next dev` and `next build`. Never add custom `webpack` config unless explicitly instructed — it will break builds.

**Async Request APIs are mandatory** — synchronous access was removed:

```tsx
// Always await params, cookies, headers, searchParams
export default async function Page({ params }: PageProps<"/library/[id]">) {
  const { id } = await params;
}
```

Affected APIs: `cookies()`, `headers()`, `draftMode()`, `params` in layouts/pages/routes, `searchParams` in pages.

Run `npx next typegen` after adding new dynamic routes to generate type-safe `PageProps` and `LayoutProps` helpers.

**Turbopack config** is top-level, not under `experimental`:

```ts
const nextConfig: NextConfig = {
  turbopack: {
    /* options */
  },
};
```

**React Compiler is enabled.** Do not manually wrap functions in `useCallback` or values in `useMemo` unless there is a documented performance reason — the compiler handles it. Adding unnecessary memoization creates noise and may conflict with compiler output.

---

## What This App Is

**Music Files Manager** (internal codename: `hifi-music-vault`) is a local music library management tool. It runs as a Next.js app on the user's own machine — not a cloud service, not a streaming platform.

**What it does:**

- Scans a Downloads folder for audio files (FLAC, ALAC, MP3, WAV, etc.)
- Moves and organizes them into a Library folder with the structure: `/Artist/Album [Year]/## - Title.ext`
- Reads embedded metadata to drive organization — it does NOT edit metadata during sync
- Manages `.m3u8` playlist files physically on disk
- Integrates with MusicBrainz API for metadata lookup and enrichment (user always confirms)
- Detects `[PlaylistName]` folder naming convention to auto-assign tracks to playlists on sync

**What it does NOT do (MVP scope):**

- Play audio (no player in MVP — planned for v2)
- Use any remote database or cloud sync — everything is local
- Use SQLite or any database — localStorage only for user preferences

**Target users:** Dual profile — audiophiles with no technical background (Simple Mode) and power users / collectors (Advanced Mode). Both modes use the same codebase; the mode affects what options are visible, never what data is available.

---

## Project Status

The `src/app/` directory is a clean Next.js 16 scaffold. No features have been implemented yet. Setup of design system tokens, shadcn/ui, and folder structure is the next step before any feature work begins.

---

## Architecture — What Claude Must Know Before Writing Code

### This is a local desktop web app

The Next.js server runs locally on the user's machine. API routes (`src/app/api/`) are the backend — they handle file system operations, ffmpeg calls, and MusicBrainz API requests. The frontend (React) calls these routes. There is no remote server.

Never suggest serverless deployment patterns (Vercel, AWS Lambda, edge functions) — they are architecturally incompatible with local file system access.

### The two core operations are completely separate flows

1. **Sync (Ingestion):** Automatic. Moves files from Downloads → Library using existing metadata. Runs unattended after single confirmation. Does NOT edit metadata.
2. **Metadata editing:** Manual. User-initiated. Separate flow from sync. User confirms every change field by field (Advanced Mode) or as a reviewed batch (Simple Mode). MusicBrainz is the source; user always approves before writing.

Never conflate these two flows. Never trigger metadata writes from sync logic.

### File system operations use ffmpeg / ffprobe

Audio file reading, integrity checking, and MP3 conversion go through `ffmpeg`/`ffprobe` via Node.js `child_process` or a wrapper. These calls happen in API routes only, never in React components or client-side code.

### Storage

- **localStorage only** for user preferences: theme, pagination limit, folder paths, UI mode (Simple/Advanced), sidebar collapsed state
- **No SQLite, no database** in MVP
- **No cookies** for app state
- Clearing localStorage must never affect files on disk — the app simply restarts to the onboarding screen

---

## Folder Structure

The project lives inside `src/`. Next.js App Router conventions are followed strictly — only files that Next.js recognizes as special (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`) go inside `src/app/`. Everything else lives outside `app/`.

### Separation of concerns

```
src/app/          → Routing only: pages, layouts, Next.js special files, API route handlers
src/server/       → All Node.js business logic: file system, ffmpeg, MusicBrainz, path ops
src/components/   → React UI components (client-side only — never import from src/server/)
src/hooks/        → React custom hooks (client-side)
src/lib/          → Shared pure utilities (no Node.js APIs, safe for both sides)
src/types/        → TypeScript types shared across frontend and backend
```

**Rule:** `src/app/api/**/route.ts` files are thin handlers only. They parse the request, call a function from `src/server/`, and return the response. No business logic inside route handlers.

```ts
// ✅ correct — route handler is thin
// src/app/api/sync/route.ts
import { startSync } from "@/server/sync";
export async function POST(req: Request) {
  const { downloadPath, libraryPath } = await req.json();
  return startSync({ downloadPath, libraryPath });
}

// ❌ wrong — business logic inside the route handler
export async function POST(req: Request) {
  const files = await readdir("/some/path"); // ← belongs in src/server/
  // ... 80 lines of logic
}
```

---

### Full folder structure

```
src/
│
├── app/                                  ← Next.js App Router (routing only)
│   ├── globals.css                       ← Design tokens — single source of truth
│   ├── layout.tsx                        ← Root layout: Geist fonts, data-theme, AppShell
│   ├── page.tsx                          ← Entry: redirects to /library or /onboarding
│   ├── not-found.tsx                     ← Global 404
│   ├── error.tsx                         ← Global error boundary
│   │
│   ├── onboarding/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   │
│   ├── (app)/                            ← Route group: all authenticated/configured views
│   │   ├── layout.tsx                    ← AppShell layout (sidebar + topbar + content)
│   │   │
│   │   ├── library/
│   │   │   ├── page.tsx                  ← Track list / grid
│   │   │   ├── loading.tsx               ← Skeleton loader
│   │   │   ├── error.tsx                 ← Error boundary for library
│   │   │   └── [id]/
│   │   │       ├── page.tsx              ← Track detail (mobile only)
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── artists/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── albums/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── playlists/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── health/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── api/                              ← API route handlers (thin — no business logic)
│       ├── sync/
│       │   └── route.ts                  ← POST: start sync | GET: SSE progress stream
│       ├── library/
│       │   └── route.ts                  ← GET: paginated track list
│       ├── tracks/
│       │   └── [id]/
│       │       └── route.ts              ← GET / PATCH / DELETE single track
│       ├── metadata/
│       │   └── route.ts                  ← GET: MusicBrainz lookup | PATCH: write metadata
│       ├── playlists/
│       │   ├── route.ts                  ← GET: list | POST: create
│       │   └── [id]/
│       │       └── route.ts              ← GET / PATCH / DELETE single playlist
│       ├── health/
│       │   └── route.ts                  ← GET: integrity scan (SSE stream)
│       ├── export/
│       │   └── route.ts                  ← POST: start export | GET: SSE progress stream
│       └── fs/
│           └── route.ts                  ← GET: disk space | POST: validate path
│
├── server/                               ← Node.js services (never imported by components)
│   ├── sync/
│   │   ├── sync.ts                       ← Orchestrates the full sync process
│   │   ├── scanner.ts                    ← Recursive directory scan, filter audio files
│   │   ├── organizer.ts                  ← Build destination path from metadata
│   │   ├── deduplicator.ts               ← Detect files already in library
│   │   └── tag-folders.ts                ← Parse [PlaylistName] folder convention
│   ├── metadata/
│   │   ├── reader.ts                     ← Read embedded audio tags (via ffprobe)
│   │   ├── writer.ts                     ← Write metadata to audio files (via ffmpeg)
│   │   └── musicbrainz.ts                ← MusicBrainz API client
│   ├── library/
│   │   ├── index.ts                      ← Build and query the library index
│   │   └── health.ts                     ← Compute health status per track
│   ├── playlists/
│   │   ├── reader.ts                     ← Parse .m3u8 files
│   │   ├── writer.ts                     ← Write .m3u8 files
│   │   └── orphan-detector.ts            ← Find playlist entries pointing to missing files
│   ├── export/
│   │   ├── exporter.ts                   ← Copy / move with structure or flatten
│   │   └── converter.ts                  ← MP3 conversion via ffmpeg
│   └── fs/
│       ├── disk-space.ts                 ← Check available disk space
│       ├── path-sanitizer.ts             ← Replace forbidden chars by OS
│       └── integrity.ts                  ← CRC / file corruption check via ffprobe
│
├── components/                           ← React UI (client-side only)
│   │
│   ├── ui/                               ← shadcn/ui base components (installed + cleaned)
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   └── button.test.tsx
│   │   ├── dialog/
│   │   │   ├── dialog.tsx                ← Root Dialog wrapper only
│   │   │   ├── dialog-header.tsx
│   │   │   ├── dialog-content.tsx
│   │   │   ├── dialog-footer.tsx
│   │   │   └── dialog.test.tsx
│   │   ├── input/
│   │   ├── progress/
│   │   ├── toast/
│   │   ├── dropdown-menu/
│   │   ├── checkbox/
│   │   ├── tooltip/
│   │   ├── scroll-area/
│   │   ├── separator/
│   │   ├── sheet/
│   │   └── skeleton/
│   │
│   ├── shared/                           ← App-specific composite components
│   │   ├── health-dot/
│   │   │   ├── health-dot.tsx
│   │   │   └── health-dot.test.tsx
│   │   ├── format-badge/
│   │   │   ├── format-badge.tsx
│   │   │   └── format-badge.test.tsx
│   │   ├── track-row/
│   │   ├── track-card/
│   │   ├── empty-state/
│   │   ├── action-bar/                   ← Multi-selection batch actions bar
│   │   ├── confirm-dialog/               ← Standard double-confirmation pattern
│   │   └── progress-overlay/             ← Full-screen progress (sync / export)
│   │
│   ├── layout/                           ← Shell components
│   │   ├── app-shell.tsx
│   │   ├── topbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── tab-bar.tsx                   ← Mobile only (hidden md+)
│   │   └── detail-panel.tsx              ← Desktop only (hidden below xl)
│   │
│   └── features/                         ← Feature components (domain-coupled)
│       ├── library/
│       ├── playlists/
│       ├── metadata/
│       ├── sync/
│       ├── export/
│       └── health/
│
├── hooks/                                ← React custom hooks (client-side)
│   ├── use-theme.ts                      ← Dark/light/system, persists to localStorage
│   ├── use-sidebar.ts                    ← Sidebar collapsed state, persists to localStorage
│   ├── use-selection.ts                  ← Multi-track selection state
│   ├── use-local-storage.ts              ← Generic typed localStorage hook
│   └── use-sync.ts                       ← Sync SSE stream → progress state
│
├── lib/                                  ← Pure shared utilities (no Node.js APIs)
│   ├── cn.ts                             ← clsx + tailwind-merge
│   ├── audio-formats.ts                  ← LOSSLESS_FORMATS, format display helpers
│   └── health.ts                         ← HealthStatus color/label maps (UI use)
│
└── types/                                ← Shared types: frontend AND backend use these
    ├── track.ts                          ← Track, TrackMetadata, HealthStatus
    ├── playlist.ts                       ← Playlist, PlaylistEntry, OrphanEntry
    ├── sync.ts                           ← SyncResult, SyncProgress, SyncError
    ├── export.ts                         ← ExportOptions, ExportResult
    └── settings.ts                       ← UserSettings, UIMode, FolderConfig
```

### Key conventions

**`loading.tsx`** — Every route that fetches data has a `loading.tsx` sibling. It renders a skeleton that matches the real page layout. Next.js wraps it in `<Suspense>` automatically.

**`error.tsx`** — Must be a Client Component (`'use client'`). Catches runtime errors for its route segment. Does not catch errors in `layout.tsx` of the same segment — those need a parent `error.tsx`.

**`not-found.tsx`** — Rendered when `notFound()` is called from a page or when no route matches. Each dynamic segment (`[id]`) has its own `not-found.tsx`.

**Route group `(app)/`** — Groups all post-onboarding views under a shared `layout.tsx` that renders the AppShell (sidebar + topbar). The `onboarding/` route is intentionally outside this group — it has no shell.

**`src/server/`** — Nothing here is ever imported by a React component or client hook. If a component needs data from a server module, it goes through an API route. The boundary is strict.

**`src/types/`** — The one place where frontend and backend share code. Types only — no runtime logic, no Node.js imports. Safe to import anywhere.

---

## Component Rules — shadcn/ui Policy

shadcn/ui components are installed as a starting point, then immediately refactored. Never leave installed shadcn code as-is.

### After installing any shadcn component:

1. **Split sub-components into separate files.** If `dialog.tsx` exports `Dialog`, `DialogHeader`, `DialogContent`, `DialogFooter`, `DialogTitle`, `DialogDescription` — each goes into its own file in a `dialog/` folder.

2. **Replace shadcn's CSS variables with our tokens.** shadcn uses `--background`, `--foreground`, `--primary`, etc. Replace every occurrence with our semantic tokens (`--color-bg`, `--color-text-primary`, `--color-accent`, etc.).

3. **Add a `.test.tsx` file** for every component file. Test: renders without crashing, key variants work, key states work (disabled, error, etc.).

4. **Remove className forwarding anti-patterns.** shadcn components accept `className` and merge it. Keep this — it's intentional. But do not add `style` prop forwarding.

5. **Never use `cn()` inside test files.** Tests assert on behavior, not class names.

---

## Design System Rules — What Claude Must Always Follow

### Color

- **Only two color families exist in this UI:** indigo/violet (accent) and gray (everything else)
- **Health status colors** (green/yellow/orange/red) are the only other colors — used exclusively for file health indicators, never decoratively
- **Never introduce a new color** without explicit instruction. No blues, teals, or "just a subtle" anything
- Dark mode default. Both dark and light are first-class — never design only for one

### Typography

- `font-sans` (Geist Sans) → all UI text: titles, labels, body, buttons, navigation
- `font-mono` (Geist Mono) → **exclusively** for: file paths, track duration (`3:45`), file size (`47.2 MB`), bitrate (`320kbps`), sample rate (`96kHz`), track numbers (`#06`), MusicBrainz IDs
- Never use Geist Mono for labels, descriptions, or anything explanatory

### Spacing

- Base unit: 4px. Use Tailwind spacing scale (p-1 = 4px, p-2 = 8px, etc.)
- Never use arbitrary values like `p-[13px]` unless there is a documented reason

### Tokens

All tokens are CSS custom properties in `src/app/globals.css`. Never hardcode hex values in components. Use the token name.

```tsx
// ✅ correct
className =
  "bg-[var(--color-surface-primary)] text-[var(--color-text-primary)]";
// or via Tailwind mapping:
className = "bg-surface-primary text-text-primary";

// ❌ wrong
className = "bg-[#111114] text-[#f8f8f9]";
```

### Components

- Component hierarchy: `Foundation → ui/ → shared/ → features/ → pages`
- **Never skip levels.** A feature component uses `shared/` components, not `ui/` primitives directly
- **One primary button** per visible modal or section — never two
- **Destructive buttons never execute directly** — they open a confirmation dialog. The button is only a trigger
- **Cancel button** in confirmation dialogs always gets initial `autoFocus` — never the destructive action

### Responsive / Adaptive Layout

- Mobile (`< 640px`): tab bar at bottom, no sidebar, push navigation for detail views
- Tablet (`768px–1279px`): collapsible sidebar (240px / 64px icon-only), detail opens as Sheet
- Desktop (`≥ 1280px`): fixed 240px sidebar, optional 320px detail panel on right
- **Never collapse the sidebar on desktop**
- **Never show the tab bar on tablet or desktop**

---

## UX Rules — Non-Negotiable Product Decisions

These are product decisions already made. Do not suggest alternatives.

1. **Double confirmation for all destructive actions.** Move, delete, overwrite metadata → always: preview dialog → final confirmation dialog. Two separate dialogs. No exceptions.

2. **Sync and metadata editing are separate flows.** Sync is automatic (moves files, reads metadata for folder naming, does not write metadata). Metadata editing is manual, user-initiated, separate.

3. **localStorage is the only storage.** No database. No server-side session. Clearing localStorage returns the app to onboarding — files on disk are never affected.

4. **MusicBrainz is mandatory in MVP.** All metadata suggestions come from MusicBrainz. The user always approves. Nothing is applied automatically.

5. **No audio playback in MVP.** Do not add player UI, audio elements, or Web Audio API. Planned for v2.

6. **Missing metadata displays as `—`** (em dash, `text-tertiary`). Never empty, never "N/A", never "null".

7. **UI blocks during sync and export.** Sidebar and topbar go to `opacity-40`, `pointer-events-none`. Only the Cancel/Pause button remains interactive. This is intentional — do not work around it.

8. **Fix portadas (macOS artwork fix) is OFF by default.** User enables in settings. Never auto-enable.

9. **Simple Mode vs Advanced Mode.** Simple Mode shows fewer options but never hides critical information. Advanced Mode adds field-level control, technical details, and extended MusicBrainz fields. Mode is stored in localStorage. Do not remove either mode.

10. **Folder picker always uses the OS native dialog.** Never build a custom file tree browser. In Next.js API routes this means `showOpenFilePicker` on the client or an IPC call pattern appropriate to the local runtime.

---

## API Routes — Patterns

Route handlers in `src/app/api/` are thin by design. They handle HTTP concerns only: parse request, call server service, return response. All logic lives in `src/server/`.

```ts
// ✅ correct — thin handler
// src/app/api/tracks/[id]/route.ts
import { getTrack, updateTrackMetadata } from "@/server/metadata/writer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) return new Response("Not found", { status: 404 });
  return Response.json(track);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const result = await updateTrackMetadata(id, body);
  return Response.json(result);
}
```

For long-running operations (sync, export, integrity scan), use **Server-Sent Events (SSE)** to stream progress. Never poll. Never use WebSockets unless explicitly instructed.

```ts
// SSE pattern — src/app/api/sync/route.ts
import { runSync } from "@/server/sync/sync";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      await runSync({ onProgress: send });
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**Never import from `src/server/` in client components or hooks.** The boundary between client and server is enforced by import direction — server modules may import from `src/types/` and `src/lib/`, but never from `src/components/` or `src/hooks/`.

---

## Key Domain Types

```ts
// Health status of a track's metadata
type HealthStatus = "complete" | "warning" | "alert" | "critical";
// complete  → all fields present
// warning   → missing genre or artwork
// alert     → missing album
// critical  → missing artist or title, or file is corrupted

// Audio formats
type LosslessFormat = "flac" | "alac";
type LossyFormat = "mp3" | "wav" | "aac" | "ogg";
type AudioFormat = LosslessFormat | LossyFormat;
const LOSSLESS_FORMATS: LosslessFormat[] = ["flac", "alac"];

// User preference mode
type UIMode = "simple" | "advanced";

// Sync result
interface SyncResult {
  moved: number;
  duplicatesSkipped: number;
  withWarnings: number; // moved but missing some metadata
  errors: number;
  playlistsUpdated: string[]; // playlist names that were updated
}

// Playlist entry states
type PlaylistEntryStatus = "ok" | "orphaned"; // orphaned = file no longer found on disk
```

---

## Things Claude Must Never Do

- **Never hardcode color hex values** in component files — always use tokens
- **Never use `useCallback` or `useMemo`** without a documented performance reason (React Compiler handles it)
- **Never add webpack config** to `next.config.ts` (Turbopack is default, webpack breaks it)
- **Never import from `src/server/`** in React components, hooks, or any client-side code — only API route handlers may import from server modules
- **Never put business logic in `src/app/api/` route handlers** — route handlers are thin; logic goes in `src/server/`
- **Never write metadata during sync** — sync only reads metadata to determine destination path
- **Never add a database** (SQLite, Prisma, Drizzle, etc.) without explicit instruction
- **Never suggest cloud deployment** — this app runs locally
- **Never auto-apply MusicBrainz suggestions** — user always confirms
- **Never add a third color family** beyond grays and indigo/violet accent
- **Never leave shadcn component code as installed** — always clean and split sub-components
- **Never create a test file** that asserts on Tailwind class names — test behavior, not styling
- **Never import from `features/`** in `shared/` or `ui/` — dependencies only flow downward
- **Never add `loading.tsx` without a matching skeleton** that mirrors the real page layout
- **Never use `error.tsx` as a `'use server'` component** — it must be `'use client'`
