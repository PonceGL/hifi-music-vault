# Music Files Manager — Documentación UX y Flujos Completos
> Versión: MVP 1.0 | Plataforma: macOS + Windows | Stack: Next.js + Node.js local
> **Perfil de usuario:** Dual (audiófilo no técnico + power user) | **MusicBrainz:** Obligatoria en MVP | **Confirmaciones:** Doble confirmación en toda acción destructiva | **Storage:** localStorage únicamente (sin SQLite en MVP)

---

## Índice

1. [Visión y Principios de Diseño](#1-visión-y-principios-de-diseño)
2. [Arquitectura de Navegación](#2-arquitectura-de-navegación)
3. [Flujo 0 — Onboarding y Primer Uso](#3-flujo-0--onboarding-y-primer-uso)
4. [Flujo 1 — Motor de Ingesta (Sincronización)](#4-flujo-1--motor-de-ingesta-sincronización)
5. [Flujo 2 — Biblioteca Vacía](#5-flujo-2--biblioteca-vacía)
6. [Flujo 3 — Biblioteca con Datos](#6-flujo-3--biblioteca-con-datos)
7. [Flujo 4 — Gestión de Metadatos](#7-flujo-4--gestión-de-metadatos)
8. [Flujo 5 — Playlists](#8-flujo-5--playlists)
9. [Flujo 6 — Exportación y Conversión](#9-flujo-6--exportación-y-conversión)
10. [Flujo 7 — Errores y Casos Borde](#10-flujo-7--errores-y-casos-borde)
11. [Pantallas de Configuración (Settings)](#11-pantallas-de-configuración-settings)
12. [Componentes Globales](#12-componentes-globales)
13. [Inconsistencias del PRD y Decisiones Tomadas](#13-inconsistencias-del-prd-y-decisiones-tomadas)
14. [Glosario](#14-glosario)

---

## 1. Visión y Principios de Diseño

### Propósito
Transformar carpetas de descargas caóticas en una biblioteca musical organizada, con metadatos limpios y playlists portables. El usuario **siempre tiene control total**; la app nunca hace cambios destructivos sin confirmación explícita.

### Principios
| # | Principio | Implicación en UI |
|---|-----------|-------------------|
| 1 | **Doble confirmación en todo lo destructivo** | Mover, eliminar, sobreescribir metadatos → siempre 2 pasos: preview + confirmación explícita. Sin excepciones. |
| 2 | **El usuario ve antes de que pase** | Preview obligatorio antes de cualquier operación batch. |
| 3 | **Transparencia de estado** | Siempre visible: cuántos archivos hay, su salud, qué está procesando. |
| 4 | **Lossless primero** | FLAC/ALAC tienen prioridad visual, indicadores de calidad y opciones especiales. |
| 5 | **Resiliencia de datos** | Borrar localStorage jamás toca los archivos físicos. La app vuelve al onboarding de configuración de carpetas, sin alterar nada en disco. |
| 6 | **Dual-mode UX** | Modo simple (acciones con un clic, lenguaje natural) y modo avanzado (control granular, opciones técnicas). Adaptable por tipo de usuario. |
| 7 | **MusicBrainz como backbone** | Toda sugerencia de metadatos viene de MusicBrainz. El usuario confirma campo por campo. Nunca se aplica automáticamente. |

---

## 2. Arquitectura de Navegación

```
App
├── [ONBOARDING]          → Solo se muestra si no hay carpetas configuradas
│   ├── Bienvenida
│   ├── Selección de carpeta Descargas
│   ├── Selección de carpeta Biblioteca
│   └── Resumen y confirmación
│
└── [APP PRINCIPAL]       → Panel lateral fijo + área de contenido
    ├── Biblioteca         → Vista de todos los archivos
    ├── Artistas           → Agrupación por artista
    ├── Álbumes            → Agrupación por álbum
    ├── Playlists          → Gestión de .m3u8
    ├── Salud              → Linter / archivos con problemas
    └── Configuración      → Ajustes globales
```

### Modo Simple vs. Modo Avanzado (Dual UX)

La app se adapta al perfil del usuario sin requerir configuración explícita. El modo se selecciona en Settings y puede cambiarse en cualquier momento.

| Elemento | Modo Simple | Modo Avanzado |
|----------|-------------|---------------|
| Sincronización | Un botón [Sincronizar] | Preview detallado con tabla de acciones por archivo |
| Edición de metadatos | "Completar con MusicBrainz" (1 clic) | Editor campo por campo con ✓/✗ individual |
| Exportación | Flujo guiado de 3 pasos | Matriz completa de opciones (copy/move × estructura × formato) |
| Salud | Resumen con "Reparar lo que se pueda" | Lista detallada con acción por archivo |
| Mensajes de error | Lenguaje natural, acción sugerida | Ruta exacta + código de error + log descargable |

> **Regla:** El modo nunca oculta información crítica. En modo simple, los detalles técnicos están un clic atrás (chevron "Ver detalles").

### Layout Principal (App Shell)
```
┌────────────────────────────────────────────────────────┐
│  [Logo]  Music Manager          [Buscar]  [Sincronizar] │  ← Topbar
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│  SIDEBAR │           ÁREA DE CONTENIDO                 │
│          │                                             │
│ Biblioteca│                                            │
│ Artistas │                                             │
│ Álbumes  │                                             │
│ Playlists│                                             │
│ ──────── │                                             │
│ Salud    │                                             │
│ ──────── │                                             │
│ Config.  │                                             │
│          │                                             │
│  [Stats] │                                             │  ← Stats en footer sidebar
└──────────┴─────────────────────────────────────────────┘
```

**Stats en footer del sidebar:**
- Total de tracks
- Total en FLAC/ALAC vs MP3
- Espacio en disco usado

---

## 3. Flujo 0 — Onboarding y Primer Uso

**Trigger:** localStorage vacío O carpetas configuradas ya no existen en disco.

> **Decisión de diseño:** El onboarding es mínimo y directo. Una pantalla de presentación rápida seguida inmediatamente de la selección de carpetas. Sin pasos extra, sin wizards largos.

---

### Pantalla 0.1 — Bienvenida + Configuración de Carpetas

Esta es la única pantalla de onboarding. Explica brevemente qué hace la app y solicita las dos rutas necesarias en el mismo lugar.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🎵 Music Files Manager                    │
│                                                     │
│   Organiza tu música local automáticamente.         │
│   Mueve archivos de tus Descargas a una             │
│   Biblioteca ordenada, con metadatos limpios        │
│   y playlists portables en formato .m3u8.           │
│                                                     │
│   ─── Configura tus carpetas ─────────────────────  │
│                                                     │
│   📥 Carpeta de Descargas                           │
│   ┌─────────────────────────────────────────────┐  │
│   │  /Users/juan/Downloads/Música      [Elegir] │  │
│   └─────────────────────────────────────────────┘  │
│   Aquí es donde tienes los archivos sin organizar.  │
│                                                     │
│   📚 Carpeta de Biblioteca                          │
│   ┌─────────────────────────────────────────────┐  │
│   │  (no seleccionada)                 [Elegir] │  │
│   └─────────────────────────────────────────────┘  │
│   Aquí se organizará todo con estructura            │
│   /Artista/Álbum [Año]/## - Título.ext             │
│                                                     │
│   ✅ /Downloads/Música — 247 archivos de audio      │
│   ❌ Biblioteca — pendiente de selección            │
│                                                     │
│              [Comenzar →]   ← deshabilitado         │
│                             hasta tener ambas rutas │
└─────────────────────────────────────────────────────┘
```

**Comportamientos:**
- Cada [Elegir] abre el selector nativo del sistema operativo (Finder en macOS, Explorer en Windows).
- Al seleccionar la carpeta de Descargas, la app hace un escaneo superficial inmediato (sin mover nada) y muestra el conteo de archivos de audio encontrados.
- [Comenzar →] se habilita solo cuando ambas carpetas están seleccionadas y válidas.
- Las preferencias (tema, paginación) tienen sus valores por defecto y el usuario las ajusta en Settings después de entrar.

**Validaciones en tiempo real:**
- ✅ Carpeta existe y tiene permisos de escritura
- ✅ Espacio disponible en disco de Biblioteca
- ❌ Ambas carpetas son la misma → mensaje de error inline, bloquea [Comenzar]
- ❌ Biblioteca es subcarpeta de Descargas → advertencia inline, bloquea [Comenzar]
- ❌ Sin permisos de escritura → error inline con instrucciones para macOS/Windows

---

### Pantalla 0.1-B — Carpeta Desaparecida (al iniciar la app)

**Trigger:** La app ya estaba configurada, pero al iniciar detecta que una carpeta ya no existe en disco.

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Una carpeta ya no está disponible               │
│                                                     │
│  No se encontró:                                    │
│  /Volumes/MusicDisk/Biblioteca                      │
│                                                     │
│  Posibles causas:                                   │
│  • El disco externo no está conectado               │
│  • La carpeta fue movida o renombrada               │
│                                                     │
│  [Reconectar disco y reintentar]                    │
│  [Seleccionar nueva ubicación]                      │
│  [Continuar en modo solo lectura]                   │
│                                                     │
│  ──────────────────────────────────────────────     │
│  ℹ️ Tus archivos de música no han sido modificados.  │
│     Solo se perdió la referencia a esa carpeta.     │
└─────────────────────────────────────────────────────┘
```

**Modo solo lectura:** La app carga con la biblioteca visible pero sin posibilidad de sincronizar, mover ni editar metadatos. Se muestra un banner persistente en la topbar: `⚠️ Modo solo lectura — [Reconectar carpeta]`

---

---

## 4. Flujo 1 — Motor de Ingesta (Sincronización)

**Trigger:** Usuario hace clic en [Sincronizar] en la topbar.

> **Aclaración crítica de diseño:** La sincronización y la edición de metadatos son **dos flujos completamente independientes**. La sincronización mueve y organiza los archivos físicamente de forma automática. La edición de metadatos es una acción separada que el usuario inicia cuando quiere, sobre archivos que ya están en la biblioteca.

### Qué hace la sincronización automáticamente

> **Principio central:** La sincronización es un proceso 100% automático que corre sin intervención del usuario una vez confirmado el inicio. No pregunta por cada archivo. Si algo necesita revisión posterior, queda marcado en Salud para que el usuario lo atienda cuando quiera — ese es un flujo completamente aparte.

1. Escanea recursivamente la carpeta de Descargas buscando archivos de audio.
2. Lee los metadatos embebidos de cada archivo (título, artista, álbum, año).
3. Con esos metadatos, construye la ruta de destino: `/Artista/Álbum [Año]/## - Título.ext`
4. Mueve el archivo a esa ruta dentro de la Biblioteca.
5. Detecta carpetas `[Tag]` y asigna los archivos a las playlists correspondientes.
6. Sanitiza nombres de carpetas y archivos según el OS de destino.

> La sincronización **no edita metadatos**. Solo los lee para organizar. Si un archivo tiene metadatos incompletos, se mueve igual con la información disponible y queda marcado en Salud para revisión posterior.

---

### Pantalla 1.1 — Confirmación de Inicio

**La sincronización es automática.** No hay preview archivo por archivo. Solo se muestra un resumen de cuántos archivos se encontraron y se pide confirmación para arrancar.

```
┌─────────────────────────────────────────────────────┐
│  🔄 ¿Iniciar sincronización?                         │
│                                                     │
│  Se procesarán archivos de:                         │
│  📥 /Users/juan/Downloads/Música                    │
│  → 📚 /Users/juan/Music/Biblioteca                  │
│                                                     │
│  Encontrados: 247 archivos de audio                 │
│  Ignorados:     12 (ya existen en biblioteca)       │
│  Carpetas [Tag] detectadas: [Rock] [Favoritos]      │
│                                                     │
│  Los archivos serán movidos y organizados           │
│  automáticamente. Esta acción no se puede           │
│  deshacer desde la app.                             │
│                                                     │
│  [Cancelar]              [Sí, sincronizar →]        │
└─────────────────────────────────────────────────────┘
```

> Esta pantalla es la **única confirmación** antes de que arranque el proceso. Una vez confirmado, la sincronización corre sola.

---

### Pantalla 1.2 — Sincronización en Progreso

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             ⚙️  Organizando tu biblioteca...         │
│                                                     │
│             ████████████████░░░░░░░░  65%           │
│                                                     │
│     No cierres la app ni apagues el equipo          │
│     mientras este proceso esté en curso.            │
│                                                     │
│                    [Cancelar]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Comportamientos:**
- La pantalla ocupa el área de contenido completa. El sidebar está deshabilitado.
- El único elemento interactivo es [Cancelar].
- Si el usuario intenta cerrar la ventana → dialog de advertencia (ver Componentes Globales).
- El porcentaje se calcula sobre el total de archivos encontrados al inicio.

**Estados de cancelación:** Si el usuario cancela a mitad del proceso, la app muestra cuántos archivos fueron movidos con éxito y cuántos quedaron en Descargas sin tocar. Los archivos ya movidos permanecen en la Biblioteca — no se revierten.

---

### Pantalla 1.3 — Resultado de Sincronización

```
┌─────────────────────────────────────────────────────┐
│  ✅ Sincronización completada                        │
│                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐     │
│  │  231     │  12      │  4       │  0       │     │
│  │ Movidos  │Duplicados│Con avisos│ Errores  │     │
│  └──────────┴──────────┴──────────┴──────────┘     │
│                                                     │
│  Playlists actualizadas: Rock (18) · Favoritos (6) │
│                                                     │
│  ⚠️  4 archivos tienen metadatos incompletos:       │
│  Se movieron a /Biblioteca/Unknown Artist/ y        │
│  están marcados en Salud para revisión.             │
│                                                     │
│  [Ver archivos con avisos]       [Ir a Biblioteca →]│
└─────────────────────────────────────────────────────┘
```

---

### Pantalla 1.4 — Error Crítico Durante Sincronización

**Trigger:** Disco lleno, disco desconectado, error de permisos.

```
┌─────────────────────────────────────────────────────┐
│  🔴 Sincronización interrumpida                      │
│                                                     │
│  Error: No hay espacio suficiente en disco          │
│  Disco afectado: /Users/juan/Music/                 │
│                                                     │
│  Estado al momento del error:                       │
│  ✅ 143 archivos movidos con éxito (seguros)        │
│  ⏸  88 archivos pendientes (intactos en Descargas) │
│  ❌  1 archivo en proceso (puede estar incompleto) │
│                                                     │
│  El archivo incompleto ha sido marcado en Salud     │
│  como "Verificación requerida".                     │
│                                                     │
│  [Liberar espacio y reintentar]  [Cerrar]           │
└─────────────────────────────────────────────────────┘
```

**Regla de bloqueo de UI durante errores críticos:**
El modal es bloqueante — el usuario no puede interactuar con nada más hasta resolverlo o cerrarlo. Al hacer [Cerrar], la UI se desbloquea completamente y el sidebar vuelve a funcionar. El botón [Sincronizar] en la topbar queda disponible para reintentar.

---

### Flujo de detección de carpetas `[Tag]` para Playlists

Durante la sincronización, la app detecta carpetas en Descargas cuyo nombre sigue el patrón `[NombrePlaylist]` o múltiples etiquetas `[Tag1][Tag2]`.

**Ejemplo de estructura en Descargas:**
```
📁 /Downloads/Música/
   ├── [Rock][Favoritos]/
   │   ├── Paranoid.mp3       → Biblioteca + Playlists: Rock, Favoritos
   │   └── Heroes.flac        → Biblioteca + Playlists: Rock, Favoritos
   ├── [Jazz]/
   │   └── So What.flac       → Biblioteca + Playlist: Jazz
   └── Dark Side of the Moon.flac  → Biblioteca (sin playlist)
```

**Comportamiento:**
- Si la playlist `Rock` no existe → se crea el archivo `/Biblioteca/Playlists/Rock.m3u8`
- Si la playlist `Rock` ya existe → se agregan las canciones sin duplicar
- La carpeta `[Tag]` en Descargas se elimina después de mover todos sus archivos (si quedó vacía)
- Las canciones dentro de una carpeta `[Tag]` también siguen la estructura normal de la Biblioteca (`/Artista/Álbum/`)

---

---

## 5. Flujo 2 — Biblioteca Vacía

**Trigger:** Biblioteca configurada pero sin archivos procesados todavía.

### Pantalla 2.1 — Estado Vacío Principal

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │                                          │
│          │         📭 Tu biblioteca está vacía      │
│ Biblioteca│                                         │
│ Artistas │   Aún no has sincronizado ningún archivo. │
│ Álbumes  │                                          │
│ Playlists│   Para comenzar:                         │
│          │   1. Coloca archivos de música en         │
│ Salud(0) │      /Users/juan/Downloads/Música        │
│          │   2. Haz clic en [Sincronizar]            │
│          │                                          │
│          │              [Sincronizar ahora]          │
│          │                                          │
│          │   ─────────────────────────────────────  │
│  0 tracks│   ¿Tienes música en otra carpeta?        │
│  0 GB    │   [Cambiar carpeta de Descargas]          │
└──────────┴──────────────────────────────────────────┘
```

**Notas:**
- Las secciones Artistas, Álbumes, Playlists también muestran este estado vacío si se navega a ellas.
- La sección Salud muestra (0) en el sidebar y un estado vacío diferente: "No hay archivos que revisar".

---

## 6. Flujo 3 — Biblioteca con Datos

### Pantalla 3.1 — Vista Lista (Default)

```
┌──────────┬──────────────────────────────────────────┐
│ Biblioteca│ Biblioteca                  [≡] [⊞]     │
│ Artistas │ ┌─────────────────────────────────────┐  │
│ Álbumes  │ │ 🔍 Buscar artista, álbum, canción   │  │
│ Playlists│ └─────────────────────────────────────┘  │
│          │                                          │
│ Salud(3) │ Filtros: [Todos ▾] [Formato ▾] [Salud ▾]│
│          │                                          │
│2,341tracks│ ┌──┬──────────────────┬────────┬──────┐ │
│  47.2 GB │ │☐ │ TÍTULO           │ARTISTA │DURAC │ │
│          │ ├──┼──────────────────┼────────┼──────┤ │
│          │ │☐ │🟢 Comfortably... │Pink F. │5:32  │ │
│          │ │☐ │🟡 Unknown Track  │—       │3:14  │ │
│          │ │☐ │🟢 Here Comes Sun │Beatles │3:05  │ │
│          │ │☐ │🔴 ████_corru...  │—       │ ERR  │ │
│          │ └──┴──────────────────┴────────┴──────┘ │
│          │                                          │
│          │ ← Prev   Página 1 de 47   Siguiente →   │
└──────────┴──────────────────────────────────────────┘
```

**Indicadores de Salud (puntos de color):**
| Color | Significado |
|-------|-------------|
| 🟢 Verde | Todos los campos completos |
| 🟡 Amarillo | Falta género o portada |
| 🟠 Naranja | Falta álbum |
| 🔴 Rojo | Falta artista o título / archivo corrupto |

**Columnas en Vista Lista:**
- Checkbox de selección, Portada (miniatura), Título, Artista, Álbum, Año, Formato (badge: FLAC/MP3/ALAC), Duración, Salud (icono)

---

### Pantalla 3.2 — Vista Grilla (Grid)

```
┌──────────┬──────────────────────────────────────────┐
│ Biblioteca│ Biblioteca                  [≡] [⊞]     │
│          │                                          │
│          │  ┌────────┐ ┌────────┐ ┌────────┐       │
│          │  │[portada]│ │[portada]│ │[portada]│      │
│          │  │ 🟢      │ │ 🟡      │ │ 🟢      │      │
│          │  │FLAC     │ │MP3      │ │FLAC     │      │
│          │  │Dark Side│ │Unknown  │ │Abbey Rd │      │
│          │  │Pink Floyd│ │—       │ │Beatles  │      │
│          │  └────────┘ └────────┘ └────────┘       │
│          │                                          │
│          │  ┌────────┐ ┌────────┐ ...              │
│          │  │[portada]│ │[portada]│                 │
│          │  │ 🔴 ERR  │ │ 🟢      │                 │
│          │  └────────┘ └────────┘                  │
│          │                                          │
│          │ ← Prev   Página 1 de 47   Siguiente →   │
└──────────┴──────────────────────────────────────────┘
```

---

### Pantalla 3.3 — Selección Simple (Clic en un track)

**Panel lateral derecho que se despliega:**

```
┌──────────────────────────────────────┐
│  [portada grande]                    │
│                                      │
│  Comfortably Numb                    │
│  Pink Floyd                          │
│  The Wall [1979]                     │
│                                      │
│  FLAC · 24bit/96kHz · 47.2 MB       │
│  Duración: 6:23                      │
│                                      │
│  Salud: 🟡 Falta género              │
│                                      │
│  ─────────────────────────────────   │
│  [✏️ Editar metadatos]               │
│  [📂 Mostrar en Finder]              │
│  [➕ Agregar a playlist]             │
│  [📤 Exportar/Convertir]             │
│  [🗑 Eliminar de biblioteca]         │
└──────────────────────────────────────┘
```

---

### Pantalla 3.4 — Selección Múltiple

**Barra de acciones batch que aparece abajo:**

```
┌─────────────────────────────────────────────────────┐
│  ✓ 12 archivos seleccionados                        │
│  [Editar metadatos]  [Agregar a playlist]  [Exportar] [Eliminar]  [✕ Cancelar] │
└─────────────────────────────────────────────────────┘
```

**Reglas de menú contextual:**
| Acción | 1 archivo | Múltiples |
|--------|-----------|-----------|
| Mostrar en Finder/Explorer | ✅ | ❌ |
| Editar metadatos | ✅ (quirúrgico) | ✅ (batch) |
| Agregar a playlist | ✅ | ✅ |
| Exportar/Convertir | ✅ | ✅ |
| Eliminar | ✅ (con confirm) | ✅ (doble confirm) |

---

### Pantalla 3.5 — Vista de Artistas

```
┌──────────┬──────────────────────────────────────────┐
│ Artistas │ Artistas (124)           🔍 Buscar       │
│          │                                          │
│          │  A                                       │
│          │  ┌─────────────────────────────────────┐ │
│          │  │[img] Arctic Monkeys    12 álbumes    │ │
│          │  │      48 tracks · FLAC · 🟢           │ │
│          │  └─────────────────────────────────────┘ │
│          │  ┌─────────────────────────────────────┐ │
│          │  │[img] Aphex Twin        8 álbumes     │ │
│          │  │      31 tracks · FLAC · 🟡 (2 sin género)│ │
│          │  └─────────────────────────────────────┘ │
│          │                                          │
│          │  B                                       │
│          │  ┌─────────────────────────────────────┐ │
│          │  │[img] Beatles, The      13 álbumes    │ │
│          │  │      187 tracks · FLAC+MP3 · 🟢      │ │
│          │  └─────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────┘
```

---

## 7. Flujo 4 — Gestión de Metadatos

> **MusicBrainz es obligatoria en MVP.** Toda sugerencia de campo viene de su API. El usuario siempre confirma; la app nunca aplica cambios automáticamente.

### Pantalla 4.1 — Editor Quirúrgico (1 archivo) — Modo Simple

**Trigger:** Clic en "Editar metadatos" con 1 archivo seleccionado, usuario en Modo Simple.

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Completar metadatos — Comfortably Numb.flac      │
│                                                      │
│  [portada]  MusicBrainz encontró una coincidencia:  │
│             Pink Floyd — The Wall (1979)             │
│             Confianza: 98%  [Ver en MusicBrainz ↗]  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Título    Comfortably Numb          ✅ OK     │  │
│  │  Artista   Pink Floyd                ✅ OK     │  │
│  │  Álbum     The Wall                  ✅ OK     │  │
│  │  Año       1979                      ✅ OK     │  │
│  │  Género    — → Rock                  ⚠️ Falta  │  │
│  │  Portada   — → [imagen encontrada]   ⚠️ Falta  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  2 campos nuevos serán añadidos.                     │
│  ¿Confirmas los cambios?                             │
│                                                      │
│  [Cancelar]   [Ver campo por campo]   [✅ Aplicar]   │
└──────────────────────────────────────────────────────┘
```

> [✅ Aplicar] en modo simple es el **primer paso**. Al hacer clic aparece la confirmación final (segundo paso):

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Confirmar cambios en archivo físico             │
│                                                     │
│  Se modificarán los metadatos de:                   │
│  Comfortably Numb.flac                              │
│                                                     │
│  + Género: Rock                                     │
│  + Portada: (imagen de MusicBrainz)                 │
│                                                     │
│  Esta acción modifica el archivo. No se puede       │
│  deshacer desde la interfaz en esta versión.        │
│                                                     │
│  [Cancelar]                    [Sí, aplicar cambios]│
└─────────────────────────────────────────────────────┘
```

---

### Pantalla 4.1-B — Editor Quirúrgico — Modo Avanzado

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Editar metadatos — Comfortably Numb.flac         │
│                                                      │
│  ┌─────────┬──────────────────┬───────────┬────────┐ │
│  │ CAMPO   │ VALOR ACTUAL     │ SUGERIDO  │ ACCIÓN │ │
│  ├─────────┼──────────────────┼───────────┼────────┤ │
│  │ Título  │ Comfortably Numb │ (igual)   │  —     │ │
│  │ Artista │ Pink Floyd       │ (igual)   │  —     │ │
│  │ Álbum   │ The Wall         │ (igual)   │  —     │ │
│  │ Año     │ 1979             │ (igual)   │  —     │ │
│  │ Género  │ —                │ Rock      │ [✓][✗] │ │
│  │ Portada │ —                │ [thumb]   │ [✓][✗] │ │
│  │ Track # │ —                │ 6         │ [✓][✗] │ │
│  │ Disco   │ —                │ 2         │ [✓][✗] │ │
│  │ ISRC    │ —                │ GBAYE...  │ [✓][✗] │ │
│  └─────────┴──────────────────┴───────────┴────────┘ │
│                                                      │
│  Fuente: MusicBrainz ID mb-3d374d [Ver en web ↗]    │
│  [🔍 Buscar otro resultado]  [✏️ Editar manualmente] │
│                                                      │
│  Campos seleccionados para aplicar: 2               │
│  [Cancelar]            [Aplicar campos seleccionados]│
└──────────────────────────────────────────────────────┘
```

> [Aplicar campos seleccionados] también dispara el **dialog de doble confirmación** antes de escribir al archivo.

---

### Pantalla 4.1-C — MusicBrainz sin resultados

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Editar metadatos — unknown_001.mp3               │
│                                                      │
│  🔍 MusicBrainz no encontró coincidencias para       │
│     este archivo.                                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Buscar manualmente:                          │   │
│  │ Artista  [_____________________]             │   │
│  │ Título   [_____________________]  [Buscar]   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  — o bien —                                          │
│                                                      │
│  Editar campos directamente:                         │
│  Título   [_______________________]                  │
│  Artista  [_______________________]                  │
│  Álbum    [_______________________]                  │
│  Año      [______]  Género  [_____]                 │
│                                                      │
│  [Cancelar]                       [Guardar cambios]  │
└──────────────────────────────────────────────────────┘
```

---

### Pantalla 4.2 — Editor Batch (Múltiples archivos)

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Edición batch — 12 archivos seleccionados        │
│                                                      │
│  ⚠️  Solo edita campos que sean iguales para todos.   │
│  Los campos que dejes vacíos no se modificarán.      │
│                                                      │
│  Artista:  [________________________]                │
│  Álbum:    [________________________]                │
│  Año:      [____]                                    │
│  Género:   [Rock               ▾]                    │
│                                                      │
│  [Cancelar]                [Ver preview de cambios →]│
└──────────────────────────────────────────────────────┘
```

**Paso 2 — Preview antes de aplicar (primer confirm):**

```
┌──────────────────────────────────────────────────────┐
│  📋 Preview — cambios en 12 archivos                 │
│                                                      │
│  Campo que se modificará: Género → "Rock"            │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ARCHIVO                   ANTES    DESPUÉS   │   │
│  │ Comfortably Numb.flac     —        Rock      │   │
│  │ Heroes.flac               —        Rock      │   │
│  │ Paranoid.mp3              Metal    Rock      │   │ ← sobrescribirá
│  │ ... 9 más                                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ⚠️  3 archivos ya tenían un género y será           │
│     sobrescrito.                                     │
│                                                      │
│  [← Volver]               [Confirmar y aplicar →]   │
└──────────────────────────────────────────────────────┘
```

**Paso 3 — Confirmación final (segundo confirm):**

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Última confirmación                             │
│                                                     │
│  Se modificarán 12 archivos de audio físicamente.   │
│  Esta acción no se puede deshacer.                  │
│                                                     │
│  [Cancelar]              [Sí, modificar 12 archivos]│
└─────────────────────────────────────────────────────┘
```

---

### Pantalla 4.3 — Verificador de Integridad

**Trigger:** Menú Salud → "Verificar integridad" O automático al importar.

```
┌──────────────────────────────────────────────────────┐
│  🔬 Verificador de integridad                         │
│                                                      │
│  Escaneando archivos... ████████░░ 80%               │
│  Procesando: Abbey Road [1969]/                      │
│                                                      │
│  ─── Resultados ─────────────────────────────────── │
│                                                      │
│  ✅ 2,338 archivos — Sin problemas                   │
│  ❌   3 archivos — Corrupción detectada:             │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ FILE                   PROBLEMA    ACCIÓN     │   │
│  │ ──────────────────────────────────────────── │   │
│  │ unknown_001.mp3    CRC inválido  [▾ Opciones]│   │
│  │ dark_side_v2.flac  Header roto   [▾ Opciones]│   │
│  │ thriller_copy.mp3  Truncado      [▾ Opciones]│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Exportar reporte]           [Cerrar]               │
└──────────────────────────────────────────────────────┘
```

**Menú [▾ Opciones] por archivo corrupto:**
- Conservar de todas formas (marcar como revisado)
- Eliminar de biblioteca
- Marcar para reemplazar (queda en lista de pendientes)

---

### Pantalla 4.4 — Vista de Salud (Linter)

```
┌──────────┬──────────────────────────────────────────┐
│ Salud(3) │ Salud de la Biblioteca                   │
│          │                                          │
│          │ Resumen:                                 │
│          │ 🟢 2,338 archivos — Completos            │
│          │ 🟡    52 archivos — Falta género/portada │
│          │ 🔴     3 archivos — Críticos (corruptos) │
│          │                                          │
│          │ ─── Filtrar por ─────────────────────── │
│          │ [Todos] [Críticos] [Sin género] [Sin portada] │
│          │                                          │
│          │ ┌───────────────────────────────────┐   │
│          │ │🔴 unknown_001.mp3  Archivo corrupto│   │
│          │ │   [Conservar] [Eliminar] [Reemplazar]│  │
│          │ ├───────────────────────────────────┤   │
│          │ │🟡 Heroes.flac      Sin género      │   │
│          │ │   [Editar] [Buscar en MusicBrainz] │   │
│          │ └───────────────────────────────────┘   │
│          │                                          │
│          │ [Reparar todos los que se pueda]         │
└──────────┴──────────────────────────────────────────┘
```

---

## 8. Flujo 5 — Playlists

### Pantalla 5.1 — Sin Playlists

```
┌──────────┬──────────────────────────────────────────┐
│ Playlists│ Playlists                                │
│          │                                          │
│          │          🎵 No tienes playlists           │
│          │                                          │
│          │  Puedes crear playlists de dos formas:   │
│          │                                          │
│          │  1. Manualmente desde aquí               │
│          │     [+ Crear nueva playlist]             │
│          │                                          │
│          │  2. Automáticamente con carpetas         │
│          │     Crea carpetas con nombre             │
│          │     [Rock][Favoritos] en tu carpeta de   │
│          │     Descargas y sincroniza.              │
│          │                                          │
│          │     Ejemplo:                             │
│          │     📁 [Rock][Favoritos]/                │
│          │        ├── Heroes.flac                   │
│          │        └── Paranoid.mp3                  │
│          │     → Crea playlists "Rock" y "Favoritos"│
└──────────┴──────────────────────────────────────────┘
```

---

### Pantalla 5.2 — Playlists Creadas

```
┌──────────┬──────────────────────────────────────────┐
│ Playlists│ Playlists (8)          [+ Nueva playlist] │
│          │                                          │
│          │  ┌───────────────────────────────────┐  │
│          │  │ 🎵 Favoritos              32 tracks│  │
│          │  │ auto-generada · .m3u8    ⚙️  [···] │  │
│          │  ├───────────────────────────────────┤  │
│          │  │ 🎵 Rock Clásico           18 tracks│  │
│          │  │ manual · .m3u8           ⚙️  [···] │  │
│          │  ├───────────────────────────────────┤  │
│          │  │ ⚠️ Sesión Nocturna        12 tracks│  │
│          │  │ 2 archivos faltantes     ⚙️  [···] │  │
│          │  └───────────────────────────────────┘  │
│          │                                          │
│          │  Leyenda: auto-generada = desde carpeta  │
│          │  [···] = Editar · Exportar · Eliminar    │
└──────────┴──────────────────────────────────────────┘
```

---

### Pantalla 5.3 — Detalle de Playlist

```
┌──────────┬──────────────────────────────────────────┐
│ Playlists│ ← Playlists / Favoritos                  │
│          │                                          │
│          │ 🎵 Favoritos                             │
│          │ 32 tracks · 2h 14min · .m3u8 ✅ Válido  │
│          │                                          │
│          │ [+ Agregar tracks] [Exportar] [Eliminar] │
│          │                                          │
│          │ ┌─────────────────────────────────────┐ │
│          │ │ ## TÍTULO            ARTISTA   DUR  │ │
│          │ │ ── ────────────────────────────────│ │
│          │ │ 01 Comfortably Numb  Pink Floyd 6:23│ │
│          │ │ 02 Heroes            Bowie     6:07│ │
│          │ │ ⚠️ 03 [Archivo faltante]           │ │ ← huérfano
│          │ │ 04 Paranoid          Black Sab. 2:48│ │
│          │ └─────────────────────────────────────┘ │
│          │                                          │
│          │ ⚠️ 1 archivo faltante detectado          │
│          │ [Limpiar referencias] [Localizar archivo]│
└──────────┴──────────────────────────────────────────┘
```

---

### Pantalla 5.4 — Archivo Huérfano en Playlist

**Dialog modal al hacer clic en [Archivo faltante]:**

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Archivo no encontrado                           │
│                                                     │
│  La playlist apunta a:                              │
│  /Biblioteca/David Bowie/Heroes [1977]/             │
│  03 - Waiting for the Man.flac                      │
│                                                     │
│  Este archivo ya no existe en esa ubicación.        │
│                                                     │
│  ¿Qué deseas hacer?                                 │
│                                                     │
│  [🔍 Buscar archivo en biblioteca]                  │
│  [🗑 Eliminar esta entrada de la playlist]          │
│  [Ignorar por ahora]                               │
└─────────────────────────────────────────────────────┘
```

---

### Pantalla 5.5 — Crear / Editar Playlist

```
┌──────────────────────────────────────────────────────┐
│  ➕ Nueva playlist                                    │
│                                                      │
│  Nombre:  [________________________]                 │
│                                                      │
│  Agregar tracks:                                     │
│  🔍 [Buscar en biblioteca...]                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ SELECCIONADOS (0)                            │   │
│  │ Arrastra tracks aquí o búscalos arriba       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  El archivo .m3u8 se guardará en:                    │
│  /Biblioteca/Playlists/[nombre].m3u8                 │
│                                                      │
│  [Cancelar]                        [Crear playlist]  │
└──────────────────────────────────────────────────────┘
```

---

## 9. Flujo 6 — Exportación y Conversión

### Pantalla 6.1 — Panel de Exportación

**Trigger:** Selección de archivos → [Exportar/Convertir]

```
┌──────────────────────────────────────────────────────┐
│  📤 Exportar — 24 archivos seleccionados             │
│                                                      │
│  ─── Destino ────────────────────────────────────── │
│  Carpeta: [/Volumes/USB/MúsicaViaje]  [Cambiar]     │
│  Espacio disponible: 12.4 GB ✅                      │
│  Espacio necesario: ~3.2 GB ✅                       │
│                                                      │
│  ─── Acción ─────────────────────────────────────── │
│  ◉ Copiar   ○ Mover                                  │
│                                                      │
│  ─── Estructura ─────────────────────────────────── │
│  ◉ Mantener estructura  (/Artista/Álbum/Título)     │
│  ○ Aplanar (todos los archivos en raíz)              │
│                                                      │
│  ─── Formato ────────────────────────────────────── │
│  ◉ Formato original (FLAC/MP3 sin cambios)          │
│  ○ Convertir a MP3 320kbps (genera copia)           │
│                                                      │
│  [Ver preview de estructura]                         │
│                                                      │
│  ─────────────────────────────────────────────────   │
│  [Cancelar]                    [Iniciar exportación] │
└──────────────────────────────────────────────────────┘
```

---

### Pantalla 6.2 — Colisión de Nombres (Modo Aplanar)

**Trigger:** Se detectan nombres duplicados al aplanar.

```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Colisión de nombres detectada                   │
│                                                      │
│  3 archivos tienen nombres idénticos:                │
│  • Yesterday.mp3 (Beatles / Rolling Stones / cover)  │
│                                                      │
│  ¿Cómo resolver colisiones?                          │
│                                                      │
│  ◉ Añadir nombre de álbum                           │
│    → Yesterday - Abbey Road.mp3                     │
│    → Yesterday - Let It Bleed.mp3                   │
│                                                      │
│  ○ Añadir sufijo numérico                           │
│    → Yesterday.mp3                                  │
│    → Yesterday_2.mp3                               │
│                                                      │
│  ○ Preguntar por cada uno                           │
│                                                      │
│  [Cancelar]                       [Aplicar y exportar]│
└──────────────────────────────────────────────────────┘
```

---

### Pantalla 6.3 — Exportación en Progreso

```
┌──────────────────────────────────────────────────────┐
│  📤 Exportando...                                    │
│                                                      │
│  ████████████░░░░░░░░░░  52%                         │
│                                                      │
│  Convirtiendo: Bohemian Rhapsody.flac → .mp3        │
│  ✅ Copiados: 12 · En proceso: 1 · Pendientes: 11   │
│                                                      │
│  ⚠️  No desconectes el dispositivo de destino        │
│                                                      │
│  Tiempo estimado: ~3 minutos                        │
│                                                      │
│  [Pausar]                         [Cancelar]        │
└──────────────────────────────────────────────────────┘
```

**Nota:** Si se seleccionó "Mover" (no copiar), el proceso de exportación tiene una fase adicional de verificación de integridad antes de eliminar el origen.

---

## 10. Flujo 7 — Errores y Casos Borde

### Catálogo de Mensajes de Error

#### Error 7.1 — Ruta demasiado larga (>260 caracteres)

```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Ruta de destino demasiado larga                  │
│                                                      │
│  El archivo generaría una ruta de 271 caracteres,   │
│  lo que puede causar problemas en Windows.           │
│                                                      │
│  Ruta afectada:                                      │
│  /Biblioteca/Thelonious Monk/The Complete Riverside  │
│  Recordings [Disc 1-15] [1955-1961]/01 - Round      │
│  Midnight (Original Take).flac                       │
│                                                      │
│  Opciones:                                           │
│  [Truncar nombre del álbum automáticamente]          │
│  [Editar nombre manualmente]                         │
│  [Ignorar advertencia y continuar]                   │
└──────────────────────────────────────────────────────┘
```

---

#### Error 7.2 — Archivo sin metadatos

```
Caso A: Sin metadatos NI nombre legible
→ Omitir silenciosamente. Aparece en el log de sincronización como "ignorado".

Caso B: Solo tiene nombre de archivo
→ Importar como:
  Artista: Unknown Artist
  Título:  [nombre_de_archivo_sin_extensión]
  Estado:  🔴 Revisión urgente
→ Aparece en Salud con prioridad alta.
```

---

#### Error 7.3 — Sin espacio suficiente

```
┌──────────────────────────────────────────────────────┐
│  ❌ Espacio insuficiente                             │
│                                                      │
│  Necesitas: 4.7 GB                                  │
│  Disponible: 1.2 GB                                 │
│  Déficit: 3.5 GB                                    │
│                                                      │
│  No se inició ningún proceso.                        │
│  Libera espacio en el disco de destino y vuelve.    │
│                                                      │
│  [Cerrar]                                           │
└──────────────────────────────────────────────────────┘
```

---

#### Error 7.4 — Caracteres prohibidos en nombre

```
Acción automática (sin dialog):
: → - (dos puntos → guión)
? → eliminado
* → eliminado
" → ' (dobles → simples)
/ → - (en campos de metadatos, no en rutas)
\ → - (Windows)
< > | → eliminados

Log: "Nombre sanitizado: 'AC/DC' → 'AC-DC'"
El usuario puede ver todos los cambios de sanitización en el log de sincronización.
```

---

#### Error 7.5 — Disco externo desconectado durante operación

```
┌──────────────────────────────────────────────────────┐
│  🔴 Operación interrumpida — Disco desconectado      │
│                                                      │
│  El disco /Volumes/MusicDisk se desconectó          │
│  durante la operación.                               │
│                                                      │
│  Estado de los archivos:                            │
│  ✅ 89 archivos procesados con éxito — seguros      │
│  ⚠️  14 archivos pendientes — en Descargas (intactos)│
│  ❌  1 archivo en proceso — puede estar incompleto  │
│                                                      │
│  Acción recomendada:                                │
│  1. Reconecta el disco                              │
│  2. Ve a Salud → Verificar integridad               │
│  3. Revisa el archivo marcado                       │
│                                                      │
│  [Entendido]                                        │
└──────────────────────────────────────────────────────┘
```

---

#### Error 7.6 — MusicBrainz sin resultados

```
Estado en el editor de metadatos:
"No se encontraron resultados en MusicBrainz para este archivo.
 Edita los campos manualmente o busca con otro término."

[🔍 Buscar manualmente en MusicBrainz]  → abre búsqueda con campos editables
[Editar manualmente]                     → campos desbloqueados sin sugerencia
```

---

## 11. Pantallas de Configuración (Settings)

### Pantalla 11.1 — Configuración General

```
┌──────────────────────────────────────────────────────┐
│  ⚙️  Configuración                                    │
│                                                      │
│  ─── Carpetas ───────────────────────────────────── │
│  Descargas:  /Users/juan/Downloads/Música  [Cambiar] │
│  Biblioteca: /Users/juan/Music/Biblioteca  [Cambiar] │
│                                                      │
│  ─── Interfaz ───────────────────────────────────── │
│  Tema:          ◉ Dark  ○ Light  ○ Sistema          │
│  Paginación:    [50 ▾] elementos por página         │
│  Vista default: ◉ Lista  ○ Grilla                   │
│  Modo:          ◉ Simple  ○ Avanzado                │
│                                                      │
│  ─── Ingesta ────────────────────────────────────── │
│  Fix portadas macOS: ☐ Desactivado                  │
│    Duplica la portada en metadatos de nivel         │
│    superior. Útil si tu reproductor no la muestra.  │
│  Colisiones (modo aplanar): [Nombre de álbum ▾]     │
│                                                      │
│  ─── Datos ──────────────────────────────────────── │
│  [Exportar configuración → config.json]             │
│  [Importar configuración desde archivo]             │
│  [Borrar toda la configuración]  ← con confirmación │
│                                                      │
│  ─── Acerca de ──────────────────────────────────── │
│  Music Files Manager v1.0.0                         │
│  Next.js + Node.js · ffmpeg · MusicBrainz API       │
└──────────────────────────────────────────────────────┘
```

**Notas:**
- **Fix portadas:** OFF por default. El usuario decide si activarlo según su reproductor — la app no lo fuerza nunca.
- **Exportar/Importar configuración:** Guarda y restaura las rutas de carpetas y preferencias desde un `config.json`. Útil si se borra el localStorage o se migra a otro equipo.
- **Borrar configuración:** Requiere doble confirmación. Borra el localStorage y regresa al onboarding. No toca los archivos de música en disco.

---

## 12. Componentes Globales

### Topbar

```
┌─────────────────────────────────────────────────────┐
│  🎵 Music Manager   [🔍 Búsqueda global]  [⚙ Sync ▾]│
└─────────────────────────────────────────────────────┘
```

**Botón [Sync ▾] despliega:**
- Sincronizar ahora
- Ver última sincronización
- Verificar integridad

### Búsqueda Global

- Busca en tiempo real por: Título, Artista, Álbum, Año, Género
- Resultados agrupados por categoría
- Shortcut: `Cmd+K` / `Ctrl+K`
- Muestra salud del resultado en el listado

### Indicadores de Salud — Reglas Completas

| Prioridad | Campo | Peso | Impacto |
|-----------|-------|------|---------|
| 1 | Título | Crítico | Sin título → 🔴 |
| 1 | Artista | Crítico | Sin artista → 🔴 |
| 2 | Álbum | Alto | Sin álbum → 🟠 |
| 3 | Portada | Medio | Sin portada → 🟡 |
| 4 | Género | Bajo | Sin género → 🟡 |
| — | Corrupción | Crítico | Corrupción → 🔴 |

> Un archivo puede tener múltiples problemas. El color muestra el peor nivel.

### Bloqueo de UI Durante Operaciones y Errores

#### Durante operaciones en curso (sincronización, exportación)

**Qué se bloquea:**
- Sidebar de navegación completo
- Búsqueda global
- Selección de archivos y botones de acción
- Botón [Sincronizar] en topbar

**Qué permanece activo:**
- Botón [Cancelar] del proceso
- Indicador de progreso
- Posibilidad de mover la ventana

**Intento de cierre de ventana durante operación:**
```
⚠️ Hay una operación en curso.
Si cierras la app ahora el proceso se interrumpirá.
Los archivos ya procesados quedarán en la Biblioteca.
Los pendientes permanecerán en Descargas.

[Seguir en la app]    [Cerrar de todas formas]
```

---

#### Jerarquía de errores y su comportamiento de bloqueo

| Nivel | Tipo de error | Comportamiento UI | Se desbloquea cuando |
|-------|--------------|-------------------|----------------------|
| 🔴 **Crítico** | Disco desconectado, sin permisos | Modal bloqueante sobre toda la app. No se puede hacer nada. | Usuario cierra el modal o resuelve el problema. |
| 🟠 **Grave** | Espacio insuficiente, archivo corrupto encontrado | Modal bloqueante sobre el proceso en curso. El resto de la app queda accesible al cerrar. | Usuario cierra el modal (el proceso se detiene). |
| 🟡 **Advertencia** | Ruta muy larga, nombre sanitizado, duplicado detectado | Notificación inline dentro del flujo. No bloquea. | Automático — el usuario puede ignorar o actuar. |
| ℹ️ **Informativo** | Archivos ignorados, carpeta vacía | Toast en esquina inferior. Desaparece solo en 5 segundos. | Automático. |

#### Diseño del modal crítico (🔴)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   🔴  [Título del error en lenguaje claro]          │
│                                                     │
│   [Descripción de qué pasó, en una o dos líneas]   │
│                                                     │
│   Estado de tus archivos:                          │
│   ✅ X archivos procesados — seguros               │
│   ⏸  Y archivos pendientes — intactos en origen   │
│   ❌ Z archivo en proceso — verificar              │
│                                                     │
│   [Acción principal]        [Cerrar]               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Regla:** El modal de error crítico siempre informa el estado de los archivos. El usuario nunca se queda sin saber qué pasó con su música.

---

## 13. Inconsistencias del PRD y Decisiones Tomadas

| # | Inconsistencia / Ambigüedad original | Decisión adoptada | Fuente |
|---|--------------------------------------|-------------------|--------|
| 1 | SQLite mencionado para historial de Undo | **Eliminado del MVP.** Solo localStorage para preferencias. Sin historial de Undo en v1. | Confirmado por producto |
| 2 | "Fix de portadas macOS" — ¿activado o no por default? | **OFF por defecto.** El usuario decide activarlo si su reproductor lo necesita. | Confirmado por producto |
| 3 | Motor de ingesta: ambigüedad entre movimiento automático y confirmación campo por campo | **Son dos flujos completamente distintos e independientes.** (1) Sincronización = proceso automático que mueve archivos de Descargas a Biblioteca usando los metadatos existentes como guía de organización. No edita nada, no pregunta por cada archivo. (2) Edición de metadatos = flujo separado que el usuario inicia voluntariamente cuando quiere corregir o completar tags, con MusicBrainz y doble confirmación. Un archivo puede estar en la Biblioteca sin metadatos perfectos — eso no impide su ingesta. | Confirmado por producto |
| 4 | Estado de "sincronización en progreso" no definido | **Loading minimalista:** barra de progreso + texto de advertencia "no cierres la app". Sin detalle de archivos individuales por ahora. | Confirmado por producto |
| 5 | "Flujo de bienvenida" no especificado | **Una sola pantalla** de presentación + selección de carpetas integrada. Sin wizard de múltiples pasos. | Confirmado por producto |
| 6 | Carpetas `[Tag]` — funcionamiento no especificado | Carpetas creadas manualmente por el usuario en Descargas. El nombre dentro de `[]` es el nombre de la playlist. Una carpeta puede tener múltiples `[Tag]`. Los archivos dentro se asignan automáticamente al sincronizar. Si la playlist no existe, se crea. | Confirmado por producto |
| 7 | ¿La app reproduce música? | **No en MVP.** Solo gestión. Reproductor planificado para siguiente fase. | Confirmado por producto |
| 8 | Bloqueo de UI en errores — no definido | **Jerarquía de 4 niveles** definida: Crítico (modal bloqueante total) → Grave (modal bloqueante del proceso) → Advertencia (inline) → Informativo (toast). Cada modal de error crítico siempre muestra el estado de los archivos. | Definido en este documento |
| 9 | Historial de Undo (SQLite) — sin flujo definido | **Fuera del MVP** junto con SQLite. | Confirmado por producto |
| 10 | Selección de carpeta — método no especificado | Siempre selector nativo del OS (Finder/Explorer). La app no tiene explorador propio. | Inferido y documentado |
| 11 | Usuario objetivo ambiguo | **Dual-mode UX:** Modo Simple y Modo Avanzado, switcheable en Settings. El modo simple nunca oculta información crítica. | Confirmado por producto |
| 12 | MusicBrainz — MVP vs. futuro no claro | **Obligatoria en MVP.** Fuente primaria de sugerencias. El usuario siempre confirma campo por campo. Edición manual como fallback. | Confirmado por producto |
| 13 | Nivel de confirmación en acciones destructivas | **Doble confirmación universal:** toda acción que modifica o elimina archivos requiere: (1) preview de lo que pasará, (2) confirmación final explícita. | Confirmado por producto |

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **Sincronización** | Proceso automático de mover archivos de la carpeta de Descargas a la Biblioteca, organizándolos por carpetas según sus metadatos. No edita metadatos. |
| **Ingesta** | Sinónimo de Sincronización. El motor que ejecuta el movimiento y organización. |
| **Edición de metadatos** | Flujo independiente de la sincronización. El usuario inicia este flujo manualmente para revisar y corregir los tags de los archivos ya en la Biblioteca, usando MusicBrainz como fuente de sugerencias. |
| **Carpeta [Tag]** | Carpeta creada manualmente por el usuario dentro de Descargas cuyo nombre —o parte del nombre— está entre corchetes. Ese texto es el nombre de una playlist. Al sincronizar, los archivos dentro se asignan automáticamente a esa playlist. |
| **Huérfano** | Entrada en una playlist `.m3u8` que apunta a un archivo que ya no existe en la Biblioteca. |
| **Lossless** | Formato de audio sin pérdida de calidad (FLAC, ALAC). Opuesto a lossy (MP3). |
| **Fix de Portadas** | Opción desactivada por defecto. Duplica la imagen de portada en los metadatos de nivel superior del archivo, útil para que ciertos reproductores de macOS la muestren correctamente en archivos FLAC/ALAC. |
| **Batch** | Operación que aplica el mismo cambio a múltiples archivos simultáneamente. |
| **Quirúrgico** | Edición de metadatos campo por campo con confirmación individual, contrapuesto a batch. |
| **Sanitización** | Proceso automático de reemplazar caracteres prohibidos en nombres de archivos según el sistema operativo de destino (`:`, `?`, `*`, etc.). |
| **m3u8** | Formato de archivo de playlist de texto plano, portable entre aplicaciones. |
| **Modo Aplanar** | Exportación donde todos los archivos se copian/mueven a la raíz del destino sin mantener la estructura de carpetas. |
| **Estado vacío** | Estado de una vista cuando no hay datos que mostrar. Siempre incluye una acción sugerida para el usuario. |
| **Modo Simple** | Perfil de UI para usuarios no técnicos. Acciones con un clic, lenguaje natural, menos opciones visibles. Los detalles técnicos están a un clic de distancia. |
| **Modo Avanzado** | Perfil de UI para power users. Expone control granular, opciones técnicas y campos extendidos de MusicBrainz. |
| **MusicBrainz** | Base de datos abierta de metadatos musicales. Fuente primaria de sugerencias en el MVP. El usuario siempre confirma antes de aplicar cualquier dato. |
| **Doble confirmación** | Patrón estándar para acciones destructivas: (1) preview de lo que va a ocurrir, (2) confirmación final explícita. Ningún archivo se modifica ni elimina con un solo clic. |
| **Modo solo lectura** | Estado de la app cuando una carpeta configurada no está disponible. Permite ver la biblioteca pero bloquea sincronización, edición y exportación. |
| **localStorage** | Mecanismo de almacenamiento del navegador donde se guardan las preferencias del usuario (rutas de carpetas, tema, paginación, modo). Si se borra, la app regresa al onboarding sin tocar los archivos físicos. |
