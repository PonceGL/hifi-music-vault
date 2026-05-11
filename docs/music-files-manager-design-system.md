# Music Files Manager — Design System
> Versión: 1.0 | Stack: Next.js · Tailwind CSS · shadcn/ui · Lucide React
> Audiencia: Desarrollador único + herramientas AI (Google Stitch, Lovable)

---

## Índice

1. [Filosofía y Principios](#1-filosofía-y-principios)
2. [Adaptive Layout System](#2-adaptive-layout-system)
3. [Tokens de Diseño — Fundación](#3-tokens-de-diseño--fundación)
4. [Tipografía](#4-tipografía)
5. [Sistema de Color](#5-sistema-de-color)
6. [Espaciado y Tamaños](#6-espaciado-y-tamaños)
7. [Elevación y Sombras](#7-elevación-y-sombras)
8. [Componentes Base](#8-componentes-base)
9. [Patrones de Interacción](#9-patrones-de-interacción)
10. [Iconografía](#10-iconografía)
11. [Motion y Animación](#11-motion-y-animación)
12. [Accesibilidad](#12-accesibilidad)
13. [Implementación Técnica](#13-implementación-técnica)
14. [Guía para AI Tools (Stitch / Lovable)](#14-guía-para-ai-tools-stitch--lovable)
15. [Glosario del Design System](#15-glosario-del-design-system)

---

## 1. Filosofía y Principios

### Concepto Visual: "Technical Elegance"

Music Files Manager es una herramienta de poder con cara amable. La interfaz debe comunicar dos cosas simultáneamente: **"puedo manejar miles de archivos con precisión quirúrgica"** y **"cualquier persona puede usarme sin manual"**.

La referencia no es una sola app — es la intersección de tres:
- **Linear**: precisión técnica, densidad de información cómoda, micro-interacciones cuidadas
- **Apple Music**: la portada como protagonista visual, el audio merece respeto estético
- **Apple HIG**: el layout se transforma según el contexto, no solo se estira

### Los 5 Principios del Design System

**1. Adaptive, no solo Responsive**
El layout no se escala — se transforma. En mobile la navegación está abajo. En tablet aparece un sidebar. En desktop hay hasta tres columnas. Cada breakpoint tiene su propia lógica de uso, no solo su propio tamaño.

**2. Dark y Light como ciudadanos de primera clase**
No hay un modo "principal" y uno "alternativo". Ambos tienen el mismo nivel de cuidado. El sistema de tokens asegura que un componente diseñado en dark funcione perfectamente al cambiar a light sin ajustes manuales.

**3. Tokens semánticos, no valores hardcoded**
Ningún componente usa `#1a1a1a` directamente. Usa `--color-surface-primary`. Esto permite que las herramientas de AI generen pantallas coherentes y que el sistema evolucione sin refactoring masivo.

**4. Información densa, nunca abrumadora**
Esta app maneja miles de archivos. El diseño debe ser capaz de mostrar mucha información en poco espacio sin que el usuario sienta que está leyendo una hoja de cálculo. La densidad se logra con tipografía bien calibrada y jerarquía clara, no con tamaño grande.

**5. El audio como elemento visual**
La portada del álbum no es un thumbnail pequeño — es el punto focal de cualquier pantalla donde aparece. El diseño construye alrededor de ella, no al revés.

---

## 2. Adaptive Layout System

### Breakpoints

```
xs:  < 640px   → Mobile phones
sm:  640–767px → Large phones / small tablets
md:  768–1023px → Tablets (iPad, etc.)
lg:  1024–1279px → Small laptops / large tablets landscape
xl:  1280–1535px → Desktop
2xl: ≥ 1536px  → Large desktop / ultrawide
```

En Tailwind, estos son los breakpoints por defecto. No se redefinen — se usan semánticamente.

### Modelo de Layout por Dispositivo

#### 📱 Mobile (xs / sm) — Tab Bar Navigation

```
┌─────────────────────────┐
│     TOPBAR (48px)       │  Logo + Búsqueda
├─────────────────────────┤
│                         │
│                         │
│    CONTENT AREA         │
│    (full width)         │
│                         │
│                         │
├─────────────────────────┤
│   TAB BAR (64px)        │  Biblioteca · Playlists · Salud · Config
└─────────────────────────┘
```

- La Tab Bar está fija en la parte inferior, respeta el Safe Area de iOS/Android.
- El contenido hace scroll verticalmente.
- No hay paneles laterales ni paneles de detalle — el detalle abre una vista nueva (push navigation).
- La búsqueda en topbar se expande a full width al activarse.

**Regla de Tab Bar en Mobile:**
Solo 4 ítems máximo. El orden es: Biblioteca (home), Playlists, Salud, Configuración. Si hay más secciones, van dentro de Configuración.

---

#### 📟 Tablet (md / lg) — Sidebar Navigation

```
┌───────────┬─────────────────────────┐
│           │    TOPBAR (52px)        │
│ SIDEBAR   ├─────────────────────────┤
│ (240px    │                         │
│ colaps.   │    CONTENT AREA         │
│ a 64px)   │                         │
│           │                         │
│           │                         │
└───────────┴─────────────────────────┘
```

- El sidebar tiene ancho completo (240px) o colapsado (solo iconos, 64px).
- El usuario puede togglear el sidebar. El estado persiste en localStorage.
- Al seleccionar un ítem con detalle (track individual), este se abre en un sheet desde la derecha (slide-over), no en una pantalla nueva.
- La topbar tiene el botón de toggle del sidebar.

**Estado colapsado del sidebar:**
Solo muestra iconos. Al hacer hover sobre un ícono aparece un tooltip con el nombre. No hay texto visible.

---

#### 🖥 Desktop (xl / 2xl) — Three-Column Layout

```
┌─────────────────────────────────────────────────────────┐
│                    TOPBAR (52px)                        │
├──────────┬───────────────────────────────┬──────────────┤
│          │                              │              │
│ SIDEBAR  │       CONTENT AREA           │ DETAIL PANEL │
│ (240px)  │       (flexible)             │ (320px)      │
│ fijo     │                              │ aparece al   │
│          │                              │ seleccionar  │
│          │                              │              │
│  [stats] │                              │              │
└──────────┴───────────────────────────────┴──────────────┘
```

- El sidebar es fijo, siempre visible, nunca colapsado en desktop.
- El detail panel aparece cuando el usuario selecciona un track o álbum. Si no hay selección, el content area ocupa todo el espacio.
- El detail panel puede cerrarse con Escape o con el botón ✕.

### Implementación de Layout con Tailwind

```tsx
// app/layout.tsx — Shell adaptativo

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Topbar — siempre visible */}
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — oculto en mobile, visible en md+ */}
        <aside className="hidden md:flex md:w-60 md:flex-col border-r border-border">
          <Sidebar />
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Detail panel — solo desktop, condicional */}
        <DetailPanel />
      </div>

      {/* Tab bar — solo mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur">
        <TabBar />
      </nav>
    </div>
  )
}
```

### Zonas de Contenido y Márgenes

| Breakpoint | Padding horizontal | Max width de contenido |
|------------|-------------------|------------------------|
| Mobile | 16px (px-4) | 100% |
| Tablet | 24px (px-6) | 100% |
| Desktop | 32px (px-8) | 100% (flexible) |
| Detail Panel | 24px (px-6) | 320px fijo |

---

## 3. Tokens de Diseño — Fundación

Los tokens son la capa más importante del sistema. Todo valor visual (color, espacio, radio, sombra) debe estar definido aquí. **Nunca** hardcodear valores en componentes.

### Arquitectura de Tokens

El sistema tiene dos capas:

```
Capa 1: Tokens Primitivos (escala de valores absolutos)
  ej: --gray-900: #0f0f11

Capa 2: Tokens Semánticos (propósito, referencia a primitivos)
  ej: --color-surface-primary: var(--gray-900)  [en dark]
      --color-surface-primary: var(--gray-50)   [en light]
```

Los componentes **solo usan tokens semánticos**. Los primitivos solo existen para construir los semánticos.

### Definición en CSS (globals.css)

```css
/* ─── TOKENS PRIMITIVOS ─────────────────────────── */
:root {
  /* Escala de grises */
  --gray-0:   #ffffff;
  --gray-50:  #f8f8f9;
  --gray-100: #f0f0f2;
  --gray-200: #e2e2e6;
  --gray-300: #c8c8ce;
  --gray-400: #9898a2;
  --gray-500: #6e6e78;
  --gray-600: #4e4e58;
  --gray-700: #323238;
  --gray-800: #1e1e22;
  --gray-850: #18181c;
  --gray-900: #111114;
  --gray-950: #0a0a0d;

  /* Accent — Indigo frío, preciso */
  --accent-50:  #eef2ff;
  --accent-100: #e0e7ff;
  --accent-200: #c7d2fe;
  --accent-300: #a5b4fc;
  --accent-400: #818cf8;
  --accent-500: #6366f1;  /* ← Primary accent */
  --accent-600: #4f46e5;
  --accent-700: #4338ca;
  --accent-800: #3730a3;
  --accent-900: #312e81;

  /* Salud / Estados */
  --health-green:  #22c55e;
  --health-yellow: #eab308;
  --health-orange: #f97316;
  --health-red:    #ef4444;

  /* Formatos de audio */
  --format-flac:  #818cf8;  /* indigo — lossless premium */
  --format-alac:  #a78bfa;  /* violet — lossless apple */
  --format-mp3:   #6b7280;  /* gray — lossy */
  --format-other: #6b7280;
}

/* ─── TOKENS SEMÁNTICOS — DARK MODE (default) ───── */
:root,
[data-theme="dark"] {
  /* Superficies */
  --color-bg:                var(--gray-950);
  --color-surface-primary:   var(--gray-900);
  --color-surface-secondary: var(--gray-850);
  --color-surface-elevated:  var(--gray-800);
  --color-surface-overlay:   var(--gray-700);

  /* Bordes */
  --color-border:            var(--gray-800);
  --color-border-strong:     var(--gray-600);
  --color-border-focus:      var(--accent-500);

  /* Texto */
  --color-text-primary:      var(--gray-50);
  --color-text-secondary:    var(--gray-400);
  --color-text-tertiary:     var(--gray-600);
  --color-text-disabled:     var(--gray-700);
  --color-text-inverse:      var(--gray-950);
  --color-text-on-accent:    var(--gray-0);

  /* Accent */
  --color-accent:            var(--accent-500);
  --color-accent-hover:      var(--accent-400);
  --color-accent-subtle:     color-mix(in srgb, var(--accent-500) 12%, transparent);

  /* Estados */
  --color-success:           var(--health-green);
  --color-warning:           var(--health-yellow);
  --color-error:             var(--health-red);
  --color-info:              var(--accent-400);

  /* Sidebar */
  --color-sidebar-bg:        var(--gray-950);
  --color-sidebar-item-hover:  color-mix(in srgb, var(--gray-0) 5%, transparent);
  --color-sidebar-item-active: color-mix(in srgb, var(--accent-500) 15%, transparent);

  /* Topbar */
  --color-topbar-bg:         color-mix(in srgb, var(--gray-950) 85%, transparent);

  /* Componentes específicos */
  --color-track-row-hover:   color-mix(in srgb, var(--gray-0) 4%, transparent);
  --color-track-row-selected:color-mix(in srgb, var(--accent-500) 10%, transparent);
  --color-health-green:      var(--health-green);
  --color-health-yellow:     var(--health-yellow);
  --color-health-orange:     var(--health-orange);
  --color-health-red:        var(--health-red);
}

/* ─── TOKENS SEMÁNTICOS — LIGHT MODE ────────────── */
[data-theme="light"] {
  /* Superficies */
  --color-bg:                var(--gray-50);
  --color-surface-primary:   var(--gray-0);
  --color-surface-secondary: var(--gray-100);
  --color-surface-elevated:  var(--gray-0);
  --color-surface-overlay:   var(--gray-200);

  /* Bordes */
  --color-border:            var(--gray-200);
  --color-border-strong:     var(--gray-300);
  --color-border-focus:      var(--accent-500);

  /* Texto */
  --color-text-primary:      var(--gray-900);
  --color-text-secondary:    var(--gray-500);
  --color-text-tertiary:     var(--gray-400);
  --color-text-disabled:     var(--gray-300);
  --color-text-inverse:      var(--gray-0);
  --color-text-on-accent:    var(--gray-0);

  /* Accent */
  --color-accent:            var(--accent-600);
  --color-accent-hover:      var(--accent-700);
  --color-accent-subtle:     color-mix(in srgb, var(--accent-500) 10%, transparent);

  /* Sidebar */
  --color-sidebar-bg:        var(--gray-0);
  --color-sidebar-item-hover:  var(--gray-100);
  --color-sidebar-item-active: color-mix(in srgb, var(--accent-500) 10%, transparent);

  /* Topbar */
  --color-topbar-bg:         color-mix(in srgb, var(--gray-0) 90%, transparent);

  /* Componentes */
  --color-track-row-hover:   var(--gray-50);
  --color-track-row-selected:color-mix(in srgb, var(--accent-500) 8%, transparent);
}
```

### Mapeo a Tailwind (tailwind.config.ts)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos como clases de Tailwind
        background:    'var(--color-bg)',
        surface: {
          primary:   'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          elevated:  'var(--color-surface-elevated)',
          overlay:   'var(--color-surface-overlay)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
          focus:   'var(--color-border-focus)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary:  'var(--color-text-tertiary)',
          disabled:  'var(--color-text-disabled)',
          inverse:   'var(--color-text-inverse)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          subtle:  'var(--color-accent-subtle)',
        },
        health: {
          green:  'var(--color-health-green)',
          yellow: 'var(--color-health-yellow)',
          orange: 'var(--color-health-orange)',
          red:    'var(--color-health-red)',
        },
        format: {
          flac:  'var(--format-flac)',
          alac:  'var(--format-alac)',
          mp3:   'var(--format-mp3)',
        },
        sidebar: {
          bg:     'var(--color-sidebar-bg)',
          hover:  'var(--color-sidebar-item-hover)',
          active: 'var(--color-sidebar-item-active)',
        },
      },
    },
  },
}

export default config
```

---

## 4. Tipografía

### Fuentes

El sistema usa dos fuentes complementarias:

| Rol | Fuente | Uso |
|-----|--------|-----|
| **Display / UI** | [Geist](https://vercel.com/font) | Títulos, labels, navegación, botones |
| **Mono** | [Geist Mono](https://vercel.com/font) | Rutas de archivo, IDs, duración, bitrate, datos técnicos |

**Por qué Geist:** Es la fuente del ecosistema Next.js/Vercel. Tiene excelente legibilidad en tamaños pequeños, variante mono para datos técnicos, y es ligera en carga. Evita la genericidad de Inter sin ser extravagante.

> **Para diseñadores en Stitch/Lovable:** Geist está disponible en Google Fonts. En mockups usar `font-family: 'Geist', sans-serif` y `font-family: 'Geist Mono', monospace`.

### Escala Tipográfica

```css
/* Tokens de tipografía */
:root {
  /* Tamaños */
  --text-xs:   0.75rem;   /* 12px — metadata, labels secundarios */
  --text-sm:   0.875rem;  /* 14px — body principal, listas */
  --text-base: 1rem;      /* 16px — texto de lectura */
  --text-lg:   1.125rem;  /* 18px — títulos de sección */
  --text-xl:   1.25rem;   /* 20px — títulos de página */
  --text-2xl:  1.5rem;    /* 24px — títulos grandes */
  --text-3xl:  1.875rem;  /* 30px — display (onboarding) */

  /* Pesos */
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  /* Line heights */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal:  0em;
  --tracking-wide:    0.05em;  /* para labels en mayúsculas */
}
```

### Uso por Contexto

| Elemento | Size | Weight | Font | Color |
|----------|------|--------|------|-------|
| Page title | xl / 2xl | semibold | Geist | text-primary |
| Section heading | lg | semibold | Geist | text-primary |
| Track title en lista | sm | medium | Geist | text-primary |
| Artist / Album | sm | normal | Geist | text-secondary |
| Label / Badge | xs | medium | Geist | text-secondary |
| UPPERCASE label | xs | semibold | Geist | text-tertiary — tracking-wide |
| Ruta de archivo | xs | normal | Geist Mono | text-secondary |
| Bitrate / Sample rate | xs | normal | Geist Mono | text-tertiary |
| Duración | sm | normal | Geist Mono | text-secondary |
| Número de track | sm | normal | Geist Mono | text-tertiary |
| Metadata técnica | xs | normal | Geist Mono | text-tertiary |

### Instalación en Next.js

```tsx
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

```ts
// tailwind.config.ts — agregar a theme.extend
fontFamily: {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'monospace'],
},
```

---

## 5. Sistema de Color

### Paleta Completa por Modo

#### Modo Dark

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#0a0a0d` | Fondo base de toda la app |
| `--color-surface-primary` | `#111114` | Cards, sidebar, topbar |
| `--color-surface-secondary` | `#18181c` | Inputs, filas en hover |
| `--color-surface-elevated` | `#1e1e22` | Dropdowns, tooltips, modales |
| `--color-surface-overlay` | `#323238` | Overlays sobre modales |
| `--color-border` | `#1e1e22` | Separadores, bordes de card |
| `--color-border-strong` | `#4e4e58` | Bordes de input, divisores |
| `--color-text-primary` | `#f8f8f9` | Texto principal |
| `--color-text-secondary` | `#9898a2` | Subtítulos, artistas |
| `--color-text-tertiary` | `#4e4e58` | Placeholders, metadata |
| `--color-accent` | `#6366f1` | Botones primarios, links, selección |

#### Modo Light

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#f8f8f9` | Fondo base |
| `--color-surface-primary` | `#ffffff` | Cards, sidebar |
| `--color-surface-secondary` | `#f0f0f2` | Inputs, hover |
| `--color-surface-elevated` | `#ffffff` | Modales, dropdowns (con sombra) |
| `--color-border` | `#e2e2e6` | Bordes suaves |
| `--color-border-strong` | `#c8c8ce` | Bordes de input |
| `--color-text-primary` | `#111114` | Texto principal |
| `--color-text-secondary` | `#6e6e78` | Subtítulos |
| `--color-text-tertiary` | `#9898a2` | Placeholders |
| `--color-accent` | `#4f46e5` | Botones, links (más oscuro para contraste) |

### Indicadores de Salud de Archivos

Los colores de salud tienen significado específico y son los únicos colores "calientes" en la interfaz. Se usan exclusivamente para estados de archivos — no para decoración.

```
🟢 health-green  (#22c55e) — Archivo completo, sin problemas
🟡 health-yellow (#eab308) — Faltan campos menores (género, portada)
🟠 health-orange (#f97316) — Falta álbum
🔴 health-red    (#ef4444) — Falta artista/título, archivo corrupto
```

**Regla de uso:** Los indicadores de salud se muestran siempre como un punto (●) de 8px al inicio de la fila del track. En el detalle, como un badge con texto.

### Badges de Formato de Audio

Los formatos tienen colores propios para identificación rápida:

```
FLAC  → text-format-flac  (indigo claro) + bg-accent-subtle
ALAC  → text-format-alac  (violet claro) + bg-accent-subtle
MP3   → text-format-mp3   (gray)          + bg-surface-secondary
WAV   → text-format-mp3   (gray)          + bg-surface-secondary
```

---

## 6. Espaciado y Tamaños

### Escala de Espaciado

El sistema usa la escala de Tailwind directamente (base 4px). Los valores clave:

| Token Tailwind | Valor | Uso típico |
|----------------|-------|------------|
| `space-1` | 4px | Gap mínimo entre elementos inline |
| `space-2` | 8px | Padding interno de badges, gap en filas compactas |
| `space-3` | 12px | Padding horizontal de botones sm |
| `space-4` | 16px | Padding de cards, gap estándar entre elementos |
| `space-5` | 20px | Espacio entre secciones pequeñas |
| `space-6` | 24px | Padding horizontal de paneles |
| `space-8` | 32px | Espacio entre secciones mayores |
| `space-12` | 48px | Separación entre grupos |
| `space-16` | 64px | Espacios de respiro en onboarding |

### Alturas de Componentes Fijos

```
Topbar:              52px  (h-13)
Sidebar ancho:       240px (w-60)
Sidebar colapsado:   64px  (w-16)
Tab bar mobile:      64px  (h-16) + safe-area-inset-bottom
Detail panel:        320px (w-80)
Track row (lista):   52px  (h-13)
Track card (grid):   180px (h-45, variable por portada)
Modal max-width:     480px (max-w-md + custom)
Toast:               auto  (max-w-sm)
```

### Radio de Bordes

```css
:root {
  --radius-sm:   4px;   /* badges, tags pequeños */
  --radius-md:   8px;   /* inputs, botones, cards */
  --radius-lg:   12px;  /* modales, panels grandes */
  --radius-xl:   16px;  /* portadas en detail panel */
  --radius-full: 9999px;/* pills, avatares circulares */
}
```

En Tailwind: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`.

---

## 7. Elevación y Sombras

En dark mode, la elevación se comunica principalmente con el color de superficie (más claro = más elevado), no con sombras. En light mode, las sombras son necesarias para separar capas.

```css
:root {
  /* Dark mode — elevación por color, sombras sutiles */
  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-xl:  0 16px 40px rgba(0, 0, 0, 0.7);

  /* Focus ring */
  --shadow-focus: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-border-focus);
}

[data-theme="light"] {
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-xl:  0 16px 40px rgba(0, 0, 0, 0.15);
}
```

**Jerarquía de elevación:**

| Nivel | Surface token | Sombra | Ejemplos |
|-------|--------------|--------|----------|
| 0 — Base | `bg` | ninguna | Fondo de la app |
| 1 — Contenido | `surface-primary` | sm | Cards, sidebar, topbar |
| 2 — Interactivo | `surface-secondary` | sm | Inputs, filas hover |
| 3 — Elevado | `surface-elevated` | md | Dropdowns, popovers |
| 4 — Flotante | `surface-elevated` | lg | Modales, sheets |
| 5 — Crítico | `surface-overlay` | xl | Modales bloqueantes |

---

## 8. Componentes Base

### Jerarquía de Componentes

```
Foundation (tokens CSS)
└── Primitives (shadcn/ui — Radix sin estilos)
    └── Base Components (estilizados con tokens)
        └── Composite Components (combinaciones)
            └── Feature Components (específicos de la app)
                └── Pages / Views
```

**Regla:** Nunca saltarse niveles. Un Feature Component usa Base Components, no Primitives directamente.

---

### 8.1 Botones

**Variantes:**

```tsx
// Variante Primary — acción principal de cada pantalla
<Button variant="primary">Sincronizar</Button>

// Variante Secondary — acción secundaria
<Button variant="secondary">Cancelar</Button>

// Variante Destructive — acciones que eliminan o mueven permanentemente
<Button variant="destructive">Eliminar de biblioteca</Button>

// Variante Ghost — acciones terciarias, en listas
<Button variant="ghost">Ver detalles</Button>

// Variante Link — navegación inline
<Button variant="link">Ver en MusicBrainz</Button>
```

**Tamaños:**
```
sm:  h-8  px-3  text-xs   — acciones secundarias en listas
md:  h-9  px-4  text-sm   — default, mayoría de botones
lg:  h-11 px-6  text-base — CTAs principales, onboarding
icon: h-9  w-9            — botones de solo icono
```

**Estados:**
- Default → Hover (transition 150ms) → Active (scale 0.98) → Focus (ring) → Disabled (opacity-50, cursor-not-allowed)

**Regla de uso:**
- Una sola acción `primary` por sección/modal visible.
- Botones `destructive` siempre requieren un dialog de confirmación — el botón en sí no ejecuta la acción directamente.
- Los botones `ghost` nunca tienen borde en reposo.

---

### 8.2 Inputs y Formularios

```
Input text standard:
- h-9, px-3, text-sm
- border border-border rounded-md
- bg-surface-secondary
- focus: border-border-focus + ring shadow-focus
- placeholder: text-tertiary

Search input (global):
- h-10, pl-9 (espacio para icono Search), pr-4
- Icono Search en posición absoluta, left-3
- En mobile: se expande a full width al activarse
- Shortcut visible: Cmd+K / Ctrl+K en el placeholder
```

**Reglas de validación visual:**
- Error: `border-health-red` + mensaje de error en `text-health-red` debajo del input
- Success: solo cuando es importante confirmar (ej: ruta de carpeta válida)
- Warning: `border-health-yellow`
- Los mensajes de error/validación siempre en texto, nunca solo color

---

### 8.3 Track Row (Lista de Canciones)

El componente más importante de la app. Debe soportar muchos estados.

```
Anatomía de una Track Row (52px de alto):

[●] [portada 36px] [título — artista] [.......] [formato] [duración] [⋯]
 ↑       ↑                ↑                          ↑          ↑       ↑
health  thumb       text block              badge    mono    menu
dot                 (flex, truncate)

Columnas en desktop:
☐ · ● · [portada] · Título (flex) · Artista · Álbum · Formato · Duración · ⋯

Columnas en tablet:
☐ · ● · [portada] · Título (flex) · Artista · Duración · ⋯

Columnas en mobile (no existe — es una vista diferente):
Vista de lista compacta: [portada] · [Título / Artista] · [⋯]
```

**Estados:**
```
default:   bg-transparent
hover:     bg-track-row-hover (transition 100ms)
selected:  bg-track-row-selected + indicador izquierdo 2px accent
playing:   texto en accent color (para cuando haya reproductor en v2)
error:     fila con opacity-70, ● en health-red
```

**Selección múltiple:**
Al activar el primer checkbox, todos los track rows muestran su checkbox. Al deseleccionar todos, los checkboxes desaparecen de nuevo.

---

### 8.4 Track Card (Vista Grid)

```
Anatomía (180px de ancho, variable alto):

┌──────────────────┐
│                  │  ← Portada (aspect-square, rounded-lg)
│    [portada]     │     Placeholder: icono Music en surface-secondary
│                  │
│              [●] │  ← Health dot en esquina superior derecha
├──────────────────┤
│ FLAC             │  ← Badge de formato
│ Título canción   │  ← text-sm font-medium truncate
│ Artista          │  ← text-xs text-secondary truncate
└──────────────────┘
```

**Hover state:** Overlay oscuro sobre la portada (20% opacity) + botón ⋯ aparece centrado.

---

### 8.5 Sidebar Nav Item

```tsx
// Estado activo
<SidebarItem
  icon={<Library />}
  label="Biblioteca"
  count={2341}      // opcional — número de tracks
  isActive={true}
/>

// Estructura visual:
[icono 18px]  Biblioteca  [2,341]
              ↑ text-sm    ↑ text-xs font-mono text-tertiary
```

**Estados:**
```
default: text-secondary, bg-transparent
hover:   text-primary, bg-sidebar-hover
active:  text-accent, bg-sidebar-active, barra izquierda 2px accent
```

**En sidebar colapsado (tablet):** Solo muestra el icono centrado. El label y el count desaparecen. Tooltip al hover.

---

### 8.6 Modales y Dialogs

Todos los modales siguen el patrón de shadcn/ui `Dialog`. Las extensiones propias:

```
Tamaños de modal:
- sm:  max-w-sm  (360px)  — confirmaciones simples
- md:  max-w-md  (480px)  — default, mayoría de acciones
- lg:  max-w-lg  (640px)  — editores de metadatos, previews
- xl:  max-w-xl  (800px)  — pantalla de sincronización, resultados

Estructura de modal:
┌──────────────────────────┐
│ Título del modal     [✕] │  ← Dialog.Header
├──────────────────────────┤
│                          │
│   Contenido              │  ← Dialog.Content (scrollable si largo)
│                          │
├──────────────────────────┤
│ [Cancelar]  [Acción]     │  ← Dialog.Footer (siempre sticky)
└──────────────────────────┘
```

**Tipos de modal por contexto:**

| Tipo | Overlay | Cierre con Esc | Cierre al click fuera |
|------|---------|----------------|----------------------|
| Informativo | bg-black/50 | ✅ | ✅ |
| Confirmación | bg-black/60 | ✅ | ❌ |
| Crítico bloqueante | bg-black/80 | ❌ | ❌ |
| Proceso en curso | bg-black/90 | ❌ | ❌ |

---

### 8.7 Toast Notifications

Sistema de 4 niveles que corresponde a la jerarquía de errores:

```
success  — ✅ verde  — "Sincronización completada"        — 4 segundos
info     — ℹ️ accent — "12 archivos ignorados"            — 4 segundos
warning  — ⚠️ amarillo — "Nombre sanitizado: AC/DC→AC-DC" — 6 segundos
error    — ❌ rojo   — "No se pudo mover el archivo"      — persiste hasta dismiss
```

**Posición:** Bottom-right en desktop y tablet. Bottom-center (full width) en mobile.
**Stack:** Máximo 3 toasts visibles. El más nuevo arriba. Los anteriores se apilan hacia abajo con offset.

---

### 8.8 Progress Bar

Para sincronización y exportación:

```
Variante lineal (proceso en progreso):
┌────────────────────────────────────┐
│ ████████████████░░░░░░░░░░░░░░  62%│
└────────────────────────────────────┘
h-2, rounded-full
bg-accent en progreso, bg-surface-secondary en fondo
Animación: shimmer sobre el progreso activo

Variante indeterminada (cuando no hay % calculable):
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░     │
Bloque que se mueve de izquierda a derecha (animación 1.5s loop)
```

---

### 8.9 Health Indicator

```tsx
// Dot — en listas y cards
<HealthDot status="green" />   // ● 8px, color correspondiente
<HealthDot status="yellow" />
<HealthDot status="orange" />
<HealthDot status="red" />

// Badge — en detail panel y vista de salud
<HealthBadge status="yellow" label="Falta género" />
// → pequeño badge con ● + texto en text-xs

// Tooltip al hover sobre el dot:
// "Archivo completo" / "Falta: género, portada" / "Archivo corrupto"
```

---

### 8.10 Format Badge

```tsx
<FormatBadge format="FLAC" />  // FLAC — indigo
<FormatBadge format="ALAC" />  // ALAC — violet
<FormatBadge format="MP3"  />  // MP3  — gray

// Estructura: px-2 py-0.5 rounded-sm text-xs font-mono font-medium
// bg: accent-subtle para lossless, surface-secondary para lossy
```

---

## 9. Patrones de Interacción

### Confirmación Doble — Patrón Estándar

Toda acción destructiva sigue este flujo exacto. No hay variaciones.

```
Paso 1 — El botón de acción en la UI
  → Texto: verbo en infinitivo ("Eliminar", "Mover", "Aplicar")
  → Variante: destructive o primary según contexto

Paso 2 — Dialog de Preview (primer confirm)
  → Muestra exactamente qué va a pasar
  → Botón de confirmación: "Sí, [verbo]" (ej: "Sí, eliminar")
  → Botón de cancelación: "Cancelar" (siempre a la izquierda)
  → Foco inicial: botón Cancelar (seguro por defecto)

Paso 3 — Si es irreversible: Dialog de confirmación final (segundo confirm)
  → Texto directo: "Esta acción no se puede deshacer."
  → Botón: "Confirmar" (variant destructive si elimina, primary si mueve)
  → Cancelar siempre disponible
```

**Regla de foco:** En modales de confirmación, el foco inicial siempre va al botón "Cancelar", no al botón de acción. Esto previene confirmaciones accidentales con Enter.

---

### Selección — Patrón de Checkboxes

```
Estado inicial de la lista:
→ No hay checkboxes visibles
→ Al hacer hover sobre una fila: aparece el checkbox de esa fila

Al seleccionar la primera fila:
→ Todos los checkboxes se vuelven visibles en toda la lista
→ Aparece la Action Bar en la parte inferior
→ El header de la tabla muestra un checkbox de "seleccionar todos"

Al deseleccionar todas:
→ Los checkboxes desaparecen de nuevo
→ La Action Bar desaparece con animación slide-down
```

---

### Estado de Carga

```
Skeleton loading — para listas y grids al cargar datos:
→ Filas con bg-surface-secondary animadas (pulse animation)
→ Misma altura y estructura que el contenido real
→ No usar spinners en listas — solo skeletons

Spinner — solo para acciones puntuales (botón en carga):
→ Spinner de 16px en lugar del texto del botón
→ El botón mantiene su tamaño para evitar layout shift

Empty states — cuando no hay datos:
→ Icono ilustrativo (Lucide, 48px, text-tertiary)
→ Título: qué está vacío (text-primary, text-lg)
→ Descripción: qué hacer (text-secondary, text-sm)
→ CTA primario cuando hay una acción clara
```

---

### Drag and Drop

Para reordenar playlists y para la funcionalidad futura:

```
Indicadores:
→ Cursor: grab (default) → grabbing (dragging)
→ El elemento arrastrado: opacity-50, escala 1.02
→ Drop target: borde 2px accent con bg-accent-subtle
→ Insert line: línea 2px accent entre ítems
```

---

## 10. Iconografía

### Librería: Lucide React

Lucide es el estándar. Es la librería incluida por defecto en shadcn/ui, con consistencia de trazo y más de 1500 iconos.

**Instalación:**
```bash
npm install lucide-react
```

### Tamaños de Iconos

```
16px (size={16}) — iconos en badges, inline con texto xs
18px (size={18}) — iconos en sidebar, navegación
20px (size={20}) — iconos en botones, listas
24px (size={24}) — iconos standalone, actions
48px (size={48}) — empty states, ilustraciones
```

**Regla:** El ícono siempre va acompañado de texto, excepto en: botones icon-only con tooltip, sidebar colapsado, y acciones muy establecidas (✕ para cerrar, ← para volver).

### Mapa de Iconos por Contexto

```
Navegación:
  Biblioteca     → Library
  Artistas       → Mic2
  Álbumes        → Disc3
  Playlists      → ListMusic
  Salud          → HeartPulse
  Configuración  → Settings2

Acciones:
  Sincronizar    → RefreshCw
  Editar metadatos → Tag
  Buscar MusicBrainz → Search
  Mostrar en Finder → FolderOpen
  Agregar a playlist → ListPlus
  Exportar       → Upload
  Convertir MP3  → FileAudio
  Eliminar       → Trash2
  Cancelar (proceso) → X

Estados de archivo:
  Salud OK       → CheckCircle2
  Advertencia    → AlertCircle
  Error/Corrupto → XCircle
  Sin portada    → ImageOff
  Sin metadatos  → TagOff

Formatos:
  Audio genérico → Music
  FLAC/Lossless  → Waves
  Carpeta        → Folder
  Playlist       → ListMusic
  Archivo m3u8   → FileText

UI:
  Cerrar         → X
  Expandir panel → PanelRightOpen
  Vista lista    → LayoutList
  Vista grid     → LayoutGrid
  Más opciones   → MoreHorizontal
  Ordenar        → ArrowUpDown
  Filtrar        → Filter
  Toggle sidebar → PanelLeftClose / PanelLeftOpen
```

---

## 11. Motion y Animación

### Principios

Las animaciones tienen un propósito: **reducir la carga cognitiva**, no decorar. Cada animación debe comunicar algo (un elemento apareció, se movió, algo terminó).

**Regla de oro:** Si quitar la animación hace la UI confusa, es una buena animación. Si quitarla no cambia nada, sobra.

### Duraciones

```css
:root {
  --duration-instant: 0ms;    /* cambios de estado inmediatos (activo/inactivo) */
  --duration-fast:    100ms;  /* hover, focus rings, color transitions */
  --duration-normal:  200ms;  /* aparición de elementos, expand/collapse */
  --duration-slow:    350ms;  /* modales, sheets, paneles */
  --duration-xslow:  500ms;   /* animaciones de onboarding, estados vacíos */
}
```

### Easing

```css
:root {
  --ease-default:   cubic-bezier(0.16, 1, 0.3, 1);    /* spring natural */
  --ease-in:        cubic-bezier(0.4, 0, 1, 1);        /* elementos que salen */
  --ease-out:       cubic-bezier(0, 0, 0.2, 1);        /* elementos que entran */
  --ease-linear:    linear;                             /* progress bars */
}
```

### Animaciones por Componente

```
Track row hover:    background transition 100ms ease-default
Modal open:         opacity 0→1 + scale 0.96→1, 200ms ease-out
Modal close:        opacity 1→0 + scale 1→0.96, 150ms ease-in
Sheet (detail panel): translateX 100%→0, 300ms ease-out
Toast appear:       translateY 100%→0 + opacity, 200ms ease-out
Toast dismiss:      translateX 0→100% + opacity, 150ms ease-in
Progress bar:       width transition, linear (sincronizado con progreso real)
Sidebar collapse:   width 240px→64px, 200ms ease-default
Skeleton pulse:     opacity 0.4→1→0.4, 1.5s linear infinite
Action bar appear:  translateY 100%→0, 200ms ease-out (al seleccionar tracks)
Spinner:            rotate 360deg, 0.8s linear infinite
```

### Preferencia de Movimiento Reducido

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Accesibilidad

### Estándares

El objetivo es **WCAG 2.1 nivel AA** como mínimo para el MVP.

### Contraste de Color

| Par de colores | Ratio (dark) | Ratio (light) | Nivel |
|----------------|-------------|---------------|-------|
| text-primary / bg | 15.8:1 | 16.2:1 | AAA ✅ |
| text-secondary / bg | 4.8:1 | 4.6:1 | AA ✅ |
| text-tertiary / bg | 2.9:1 | 3.1:1 | AA (large text) ⚠️ |
| accent / bg | 4.5:1 | 5.2:1 | AA ✅ |
| health-red / bg | 5.1:1 | 4.8:1 | AA ✅ |

> `text-tertiary` solo se usa en textos decorativos o muy pequeños (metadata técnica). No se usa para texto informativo crítico.

### Foco y Navegación por Teclado

```
Focus ring: 2px offset + 2px ring en --color-border-focus (accent)
Todos los elementos interactivos: tabIndex natural del DOM
Modales: focus trap obligatorio (shadcn/ui Dialog lo maneja)
Esc: cierra modales, sheets, dropdowns, cancela búsqueda expandida
Shortcuts globales:
  Cmd/Ctrl + K → Búsqueda global
  Cmd/Ctrl + , → Configuración
  Escape       → Cierra panel de detalle / cancela selección
```

### ARIA y Semántica

```
Track rows:      role="row" en tabla, aria-selected para selección
Health dots:     aria-label="Salud: [estado]" (el color no es suficiente)
Format badges:   aria-label="Formato: FLAC"
Progress bar:    role="progressbar" aria-valuenow aria-valuemin aria-valuemax
Toast:           role="status" (informativo) / role="alert" (errores)
Sidebar activo:  aria-current="page"
Modal bloqueante: aria-modal="true" + focus trap
Iconos solos:    aria-label obligatorio / aria-hidden si es decorativo
```

---

## 13. Implementación Técnica

### Estructura de Carpetas del Design System

```
src/
├── styles/
│   ├── globals.css          ← Tokens CSS (la única fuente de verdad)
│   └── animations.css       ← Keyframes globales
│
├── lib/
│   └── cn.ts                ← Utility: clsx + tailwind-merge
│
├── components/
│   ├── ui/                  ← Base components (shadcn/ui + customizados)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── shared/              ← Composite components reutilizables
│   │   ├── health-dot.tsx
│   │   ├── format-badge.tsx
│   │   ├── track-row.tsx
│   │   ├── track-card.tsx
│   │   ├── empty-state.tsx
│   │   └── ...
│   │
│   ├── layout/              ← Layout components
│   │   ├── app-shell.tsx
│   │   ├── topbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── tab-bar.tsx      ← Solo mobile
│   │   └── detail-panel.tsx ← Solo desktop
│   │
│   └── features/            ← Feature components (acoplados a dominio)
│       ├── library/
│       ├── playlists/
│       ├── metadata/
│       ├── sync/
│       └── export/
│
└── hooks/
    ├── use-theme.ts          ← Toggle dark/light + persistencia
    ├── use-sidebar.ts        ← Estado del sidebar
    └── use-selection.ts      ← Selección múltiple de tracks
```

### Utility: cn()

```ts
// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Uso en componentes:
// className={cn('base-classes', condition && 'conditional-class', props.className)}
```

### Hook de Tema

```ts
// src/hooks/use-theme.ts
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('theme') as Theme) ?? 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    const resolvedTheme = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme

    root.setAttribute('data-theme', resolvedTheme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
```

### Configuración de shadcn/ui

```bash
# Instalación inicial
npx shadcn@latest init

# Respuestas recomendadas:
# Style: Default
# Base color: Neutral (sobreescribiremos con nuestros tokens)
# CSS variables: Yes

# Componentes del MVP — instalar todos:
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add progress
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add tooltip
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add sheet           # para el detail panel en tablet
npx shadcn@latest add skeleton
```

**Importante:** Después de instalar shadcn, sobreescribir las variables CSS de shadcn en `globals.css` con nuestros tokens. shadcn usa `--background`, `--foreground`, etc. — mapearlos a nuestros tokens semánticos.

```css
/* En globals.css, después de nuestros tokens */
/* Mapeo de variables shadcn → nuestros tokens */
:root, [data-theme="dark"] {
  --background:       var(--color-bg);
  --foreground:       var(--color-text-primary);
  --card:             var(--color-surface-primary);
  --card-foreground:  var(--color-text-primary);
  --popover:          var(--color-surface-elevated);
  --popover-foreground: var(--color-text-primary);
  --primary:          var(--color-accent);
  --primary-foreground: var(--color-text-on-accent);
  --secondary:        var(--color-surface-secondary);
  --secondary-foreground: var(--color-text-primary);
  --muted:            var(--color-surface-secondary);
  --muted-foreground: var(--color-text-secondary);
  --accent:           var(--color-surface-secondary);
  --accent-foreground: var(--color-text-primary);
  --destructive:      var(--color-error);
  --border:           var(--color-border);
  --input:            var(--color-border);
  --ring:             var(--color-border-focus);
  --radius:           var(--radius-md);
}
```

---

## 14. Guía para AI Tools (Stitch / Lovable)

Esta sección está escrita específicamente para cuando uses herramientas de AI generativa de UI. El objetivo es que Stitch o Lovable generen pantallas coherentes con el design system sin necesitar instrucciones visuales caso por caso.

### Prompt Base para Cualquier Pantalla

Usar como base en todos los prompts de Stitch/Lovable:

```
Design system: Music Files Manager
Tech stack: Next.js + Tailwind CSS + shadcn/ui + Lucide React
Fuente: Geist Sans (UI) + Geist Mono (datos técnicos: rutas, duraciones, bitrate)

MODO DE COLOR: [dark | light] — ambos deben verse igualmente bien
BREAKPOINT: [mobile | tablet | desktop]

Tokens clave:
- bg: #0a0a0d (dark) / #f8f8f9 (light)
- surface-primary: #111114 / #ffffff
- surface-secondary: #18181c / #f0f0f2
- text-primary: #f8f8f9 / #111114
- text-secondary: #9898a2 / #6e6e78
- accent: #6366f1 / #4f46e5
- border: #1e1e22 / #e2e2e6
- health: green #22c55e · yellow #eab308 · orange #f97316 · red #ef4444
- format-flac: #818cf8 · format-alac: #a78bfa · format-mp3: #6b7280

TONO VISUAL: Technical Elegance — minimalista pero con profundidad, 
elegante, preciso. No colorido. El único color de acento es el indigo.
Las portadas de álbum son el protagonista visual.

LAYOUT según breakpoint:
- mobile: tab bar abajo (Library, Playlists, Health, Settings), topbar arriba, sin sidebar
- tablet: sidebar izquierdo 240px (colapsable a 64px con solo iconos), topbar arriba
- desktop: sidebar fijo 240px, topbar, content area flexible, detail panel 320px (condicional)
```

### Convenciones para Prompts

**Para Track Lists:**
```
Genera una lista de tracks con:
- Health dot de 8px a la izquierda (colores: green/yellow/orange/red)
- Thumbnail de portada 36x36px con rounded-md
- Título en text-sm font-medium text-primary
- Artista en text-sm text-secondary
- Formato como badge xs (FLAC en indigo-subtle, MP3 en gray-subtle)
- Duración en font-mono text-sm text-secondary
- Menú ⋯ que aparece en hover
- Hover state: fondo ligeramente más claro
- Selección: fondo accent-subtle + borde izquierdo 2px accent
```

**Para Modales de Confirmación:**
```
Modal de confirmación destructiva:
- Max-width 480px, centered, overlay bg-black/60
- Header: icono de advertencia ⚠️ + título claro
- Body: descripción de exactamente qué va a pasar
- Footer sticky: botón "Cancelar" (secondary) a la izquierda,
  botón de acción (destructive) a la derecha
- Foco inicial en "Cancelar"
```

**Para Empty States:**
```
Empty state para [sección]:
- Icono Lucide 48px en text-tertiary
- Título en text-lg font-medium text-primary
- Descripción corta en text-sm text-secondary, max-width 280px, centrado
- CTA primario si hay una acción clara
- Centrado vertical y horizontal en el content area
```

### Checklist de Revisión para AI-Generated Screens

Antes de aceptar cualquier pantalla generada por AI, verificar:

- [ ] ¿Usa solo colores del design system? (Sin azules random, verdes, etc.)
- [ ] ¿El único acento de color es indigo/violet o los colores de salud?
- [ ] ¿Los datos técnicos (rutas, duración, bitrate) están en Geist Mono?
- [ ] ¿El layout corresponde al breakpoint indicado?
- [ ] ¿Los estados de salud usan los colores correctos (no inventados)?
- [ ] ¿Los modales tienen botón Cancelar a la izquierda, acción a la derecha?
- [ ] ¿Hay un solo botón `primary` visible por sección?
- [ ] ¿Las portadas de álbum son el elemento visual más grande/prominente donde aparecen?

---

## 15. Glosario del Design System

| Término | Definición |
|---------|------------|
| **Token primitivo** | Valor absoluto de diseño (un color hex, un número de px). No se usa directamente en componentes. |
| **Token semántico** | Nombre con propósito que referencia a un token primitivo. Ej: `--color-surface-primary`. Es lo que usan los componentes. |
| **Adaptive layout** | Layout que cambia de paradigma según el breakpoint, no solo de tamaño. |
| **Tab bar** | Barra de navegación fija en la parte inferior, solo en mobile. |
| **Detail panel** | Panel lateral derecho de 320px que aparece al seleccionar un track. Solo en desktop. |
| **Health dot** | Punto de 8px que indica el estado de completitud de los metadatos de un archivo. |
| **Format badge** | Chip pequeño que muestra el formato de audio (FLAC, ALAC, MP3). |
| **Track row** | Fila en la vista de lista que representa un archivo de audio. |
| **Track card** | Tarjeta en la vista grid que representa un archivo de audio, con portada prominente. |
| **Action bar** | Barra que aparece en la parte inferior al seleccionar múltiples tracks. |
| **Empty state** | Estado visual de una sección cuando no tiene datos. Siempre incluye una acción sugerida. |
| **Skeleton** | Placeholder animado que simula el contenido mientras carga. |
| **Technical Elegance** | El concepto visual del producto: preciso como una herramienta técnica, agradable como una app de consumo. |
| **Geist** | Familia tipográfica principal. Geist Sans para UI, Geist Mono para datos técnicos. |
| **cn()** | Utility function que combina clsx y tailwind-merge para componer clases de Tailwind condicionalmente. |
| **shadcn/ui** | Librería de componentes base accesibles (built on Radix UI) que se copian al proyecto y se personalizan con los tokens del design system. |
