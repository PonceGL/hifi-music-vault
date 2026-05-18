# Music Files Manager — Documentación UX y Flujos Completos

> **Versión:** 1.1 | **Plataforma:** Web (Desktop, Tablet, Mobile) | **Stack:** Next.js + Node.js local
> **Interfaz:** Unificada (sin modos Simple/Avanzado) | **MusicBrainz:** Obligatoria en MVP | **Confirmaciones:** Doble confirmación en toda acción destructiva | **Storage:** localStorage únicamente (sin SQLite en MVP)

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
10. [Flujo 7 — Optimización de Portadas](#10-flujo-7--optimización-de-portadas)
11. [Flujo 8 — Errores y Casos Borde](#11-flujo-8--errores-y-casos-borde)
12. [Pantallas de Configuración (Settings)](#12-pantallas-de-configuración-settings)
13. [Re-validación y Watcher de Biblioteca](#13-re-validación-y-watcher-de-biblioteca)
14. [Componentes Globales](#14-componentes-globales)
15. [Inconsistencias del PRD y Decisiones Tomadas](#15-inconsistencias-del-prd-y-decisiones-tomadas)
16. [Glosario](#16-glosario)

---

## 1. Visión y Principios de Diseño

### Propósito

Transformar carpetas de descargas caóticas en una biblioteca musical organizada, con metadatos limpios y playlists portables. El usuario **siempre tiene control total**; la app nunca hace cambios destructivos sin confirmación explícita.

### Accesibilidad y Responsividad

La aplicación es una herramienta web para gestión profesional de bibliotecas de música local. No es mobile-first, pero es completamente responsiva:

- **Desktop:** Layout horizontal, aprovechando el ancho de pantalla. Onboarding sin scroll (Full Viewport).
- **Tablet:** Sidebar colapsable, navegación adaptada.
- **Mobile:** Layout vertical con scroll habilitado. Navegación simplificada mediante menús contextuales y barras de navegación en la parte inferior.

### Principios

| #   | Principio                                     | Implicación en UI                                                                                                                                                                                                                                          |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Doble confirmación en todo lo destructivo** | Mover, eliminar, sobreescribir metadatos → siempre 2 pasos: preview + confirmación explícita. Sin excepciones.                                                                                                                                             |
| 2   | **El usuario ve antes de que pase**           | Preview obligatorio antes de cualquier operación batch.                                                                                                                                                                                                    |
| 3   | **Transparencia de estado**                   | Siempre visible: cuántos archivos hay, su salud, qué está procesando.                                                                                                                                                                                      |
| 4   | **Lossless primero**                          | FLAC/ALAC tienen prioridad visual, indicadores de calidad y opciones especiales.                                                                                                                                                                           |
| 5   | **Resiliencia de datos**                      | Borrar localStorage jamás toca los archivos físicos. La app vuelve al onboarding de configuración de carpetas, sin alterar nada en disco. Al reconectar la ruta de Biblioteca, se realiza un escaneo para recuperar metadatos y listas `.m3u8` existentes. |
| 6   | **Interfaz unificada**                        | No existen modos "Simple" o "Avanzado". La UI es fluida y limpia por defecto, pero expone herramientas potentes (APIs, edición profunda de metadatos) de forma contextual.                                                                                 |
| 7   | **MusicBrainz como backbone**                 | Toda sugerencia de metadatos viene de MusicBrainz. El usuario confirma campo por campo. Nunca se aplica automáticamente.                                                                                                                                   |
| 8   | **Wizard para flujos multi-paso**             | Cualquier flujo que requiera varias decisiones del usuario (batch, exportación, confirmaciones) se presenta como un wizard: un modal por paso, una sola decisión a la vez. Reduce la carga cognitiva y garantiza que no falta ningún paso obligatorio.     |

---

## 2. Arquitectura de Navegación

```
App
├── [ONBOARDING]          → Solo se muestra si no hay carpetas configuradas
│   ├── Bienvenida        → Pantalla 1: nombre, slogan, funciones
│   └── Configuración     → Pantalla 2: selección de carpetas (con transición lateral)
│
└── [APP PRINCIPAL]       → Panel lateral fijo + área de contenido
    ├── Biblioteca         → Vista de todos los archivos
    ├── Artistas           → Agrupación por artista
    ├── Álbumes            → Agrupación por álbum
    ├── Playlists          → Gestión de .m3u8 (con contador de listas)
    ├── Salud              → Linter / archivos con problemas
    └── Configuración      → Ajustes globales
```

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

> **Decisión de diseño:** El onboarding está dividido en dos pantallas con transición animada entre ellas: una de bienvenida y presentación, y otra de configuración de carpetas. En Desktop ambas ocupan el 100% del viewport sin scroll. En Mobile el contenido tiene scroll vertical.

---

### Pantalla 0.1 — Bienvenida

Primera pantalla del onboarding. Presenta la app y sus funciones principales.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🎵 Music Files Manager                    │
│                                                     │
│   Tu biblioteca musical, perfectamente organizada.  │
│                                                     │
│   ──────────────────────────────────────────────    │
│                                                     │
│   📚  Gestión de biblioteca                         │
│       Organiza tus archivos por Artista/Álbum/Año  │
│       automáticamente a partir de sus metadatos.   │
│                                                     │
│   🎵  Playlists portables                          │
│       Crea y gestiona playlists en formato .m3u8   │
│       compatible con cualquier reproductor.        │
│                                                     │
│   🏷️  Metadatos precisos                           │
│       Enriquece tus archivos con MusicBrainz.      │
│       Tú decides qué aplicas y qué no.             │
│                                                     │
│   ─ Desktop: botón centrado bajo el texto ──────── │
│                                                     │
│                   [Comenzar →]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Comportamientos:**

- Desktop: Full Viewport, sin scroll. Botón "Comenzar" centrado bajo el contenido.
- Mobile: scroll vertical habilitado. Botón al final del contenido.
- Al hacer clic en [Comenzar →], se realiza una transición de desplazamiento lateral hacia la siguiente pantalla.

---

### Pantalla 0.2 — Configuración de Carpetas

Segunda pantalla del onboarding. El usuario define las dos rutas necesarias para que la app funcione.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ─── Configura tus carpetas ───────────────────── │
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

- Cada [Elegir] abre el selector nativo del sistema operativo (Finder en macOS, Explorer en Windows). **Ver nota técnica abajo.**
- Al seleccionar la carpeta de Descargas, la app hace un escaneo superficial inmediato (sin mover nada) y muestra el conteo de archivos de audio encontrados.
- [Comenzar →] se habilita solo cuando ambas carpetas están seleccionadas y válidas.
- Las preferencias (tema, paginación) tienen sus valores por defecto y el usuario las ajusta en Settings después de entrar.

> **Nota técnica — Selector de carpetas:**
> El botón [Elegir] **no** usa `showDirectoryPicker()` ni ninguna API del navegador. El browser no expone el path absoluto del sistema de archivos — solo devuelve un `FileSystemDirectoryHandle` sandboxeado, inutilizable para operaciones de Node.js (ffprobe, ffmpeg, mover archivos).
>
> El flujo correcto es: el botón llama a `POST /api/fs/open-dialog` → Node.js abre el diálogo nativo del OS vía `child_process` → el OS muestra el Finder/Explorer nativo → el usuario selecciona la carpeta → Node.js recibe el path absoluto como string directamente.
>
> Implementación por OS:
>
> - **macOS:** `osascript -e 'POSIX path of (choose folder with prompt "...")'` → devuelve `/Users/juan/Downloads/Música`
> - **Windows:** PowerShell con `FolderBrowserDialog` nativo
>
> Si el usuario cancela el diálogo del OS, el endpoint devuelve `{ path: null }` — no se trata como error. El resultado visual es idéntico para el usuario (ve el Finder o Explorer nativo), pero Node.js tiene el path absoluto desde el primer momento, sin ninguna limitación del browser.

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

## 4. Flujo 1 — Motor de Ingesta (Sincronización)

**Trigger:** Usuario hace clic en [Sincronizar] en la topbar.

> **Aclaración crítica de diseño:** La sincronización y la edición de metadatos son **dos flujos completamente independientes**. La sincronización mueve y organiza los archivos físicamente de forma automática. La edición de metadatos es una acción separada que el usuario inicia cuando quiere, sobre archivos que ya están en la biblioteca.

### Campos mínimos requeridos para sincronización

Para que un archivo sea movido a la Biblioteca necesita los siguientes metadatos embebidos:

| Campo | Obligatorio | Uso |
|---|---|---|
| Artista | ✅ Sí | Nombre de la carpeta de artista |
| Álbum | ✅ Sí | Nombre de la carpeta de álbum |
| Título | ✅ Sí | Nombre del archivo final |
| Año | ❌ Opcional | Sufijo `[Año]` en la carpeta de álbum |
| Número de track | ❌ Opcional | Prefijo `##` en el nombre del archivo |

**Archivos con campos obligatorios faltantes → ignorados.** No se mueven a la Biblioteca ni a ninguna carpeta temporal. Aparecen en el resultado de sincronización como "ignorados por metadatos incompletos". La resolución es usar el flujo de edición de metadatos (ver Flujo 4) para completar los campos y volver a sincronizar.

**Path generado según campos disponibles:**

| Campos presentes | Ruta de destino |
|---|---|
| Artista + Álbum + Año + Track + Título | `/Artista/Álbum [Año]/## - Título.ext` |
| Artista + Álbum + Título (sin año, sin track) | `/Artista/Álbum/Título.ext` |
| Artista + Álbum + Track + Título (sin año) | `/Artista/Álbum/## - Título.ext` |
| Artista + Álbum + Año + Título (sin track) | `/Artista/Álbum [Año]/Título.ext` |

---

### Qué hace la sincronización automáticamente

> **Principio central:** La sincronización es un proceso 100% automático que corre sin intervención del usuario una vez confirmado el inicio. No pregunta por cada archivo. Los archivos ignorados quedan documentados en el resultado para que el usuario los atienda cuando quiera — ese es un flujo completamente aparte.

1. Escanea recursivamente la carpeta de Descargas buscando archivos de audio, hasta un máximo de **5 niveles de profundidad**.
2. Verifica que cada archivo tenga los metadatos mínimos requeridos (Artista, Álbum, Título). Si faltan campos obligatorios, el archivo se ignora y se registra en el resultado.
3. Verifica si el archivo ya existe en la Biblioteca comprobando si la ruta de destino generada (incluyendo extensión) ya existe. Si existe, se ignora silenciosamente.
4. Con los metadatos disponibles, construye la ruta de destino según la tabla de campos anterior.
5. Mueve el archivo a esa ruta dentro de la Biblioteca.
6. Detecta carpetas `[Tag]` y asigna los archivos a las playlists correspondientes.
7. Sanitiza nombres de carpetas y archivos según el OS de destino.

> La sincronización **no edita metadatos**. Solo los lee para organizar.
>
> **Sobre duplicados:** La detección de duplicados se basa en la **ruta de destino completa incluyendo la extensión**. Dos archivos con los mismos metadatos pero distinta extensión (ej. `Heroes.flac` y `Heroes.mp3`) generan rutas distintas y no son considerados duplicados — ambos se importan. Un archivo se ignora como duplicado únicamente cuando la ruta generada coincide exactamente con una ya existente en la Biblioteca (mismo artista, álbum, título y extensión).
>
> **Colisión de nombre sin número de track:** Si dos canciones del mismo álbum comparten el título exacto y ninguna tiene número de track, generan la misma ruta. La segunda se ignora y se reporta en el resultado. La resolución es agregar el número de track vía el flujo de metadatos y re-sincronizar.

---

### Pantalla 1.1 — Confirmación de Inicio

**La sincronización es automática.** No hay preview archivo por archivo. Al hacer clic en [Sincronizar], primero se ejecuta un pre-scan que muestra un estado de carga, y luego se muestra el resumen para pedir confirmación.

**Estado de carga durante el pre-scan:**

```
┌─────────────────────────────────────────────────────┐
│  🔄 Analizando archivos...                           │
│                                                     │
│             ◌  (spinner)                            │
│                                                     │
│  Escaneando /Users/juan/Downloads/Música            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Una vez completado el pre-scan, se muestra el resumen:**

```
┌─────────────────────────────────────────────────────┐
│  🔄 ¿Iniciar sincronización?                         │
│                                                     │
│  Se procesarán archivos de:                         │
│  📥 /Users/juan/Downloads/Música                    │
│  → 📚 /Users/juan/Music/Biblioteca                  │
│                                                     │
│  A mover:   235 archivos de audio                   │
│  Ignorados:  12 (ya existen en biblioteca)          │
│  Sin metadatos requeridos: 4 (serán ignorados)      │
│  Carpetas [Tag] detectadas: [Rock] [Favoritos]      │
│                                                     │
│  [Si hay archivos más profundos de 5 niveles:]      │
│  ⚠️  3 archivos superan el límite de profundidad    │
│     (5 niveles) y serán ignorados.                  │
│                                                     │
│  [Si hay rutas que superan 260 caracteres:]         │
│  ⚠️  2 archivos generarían rutas demasiado largas.  │
│     Se truncará el nombre del álbum automáticamente.│
│                                                     │
│  Los archivos serán movidos y organizados           │
│  automáticamente. Esta acción no se puede           │
│  deshacer desde la app.                             │
│                                                     │
│  [Cancelar]              [Sí, sincronizar →]        │
└─────────────────────────────────────────────────────┘
```

**Casos especiales que bloquean la confirmación (el modal muestra el error y no permite avanzar):**

- Sin archivos de audio en Descargas → "No se encontraron archivos de audio en [ruta]"
- Todos los archivos ya existen en Biblioteca → "No hay archivos nuevos para sincronizar"
- Espacio insuficiente en disco → ver Error 8.3
- Sin permisos en la carpeta de Biblioteca → error crítico con instrucciones

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
│     [Si el destino es disco externo:]               │
│     No desconectes el almacenamiento externo.       │
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
- Si el destino es una unidad de almacenamiento externo, se añade la advertencia específica de no desconectarla.

**Cancelación:** Al hacer clic en [Cancelar], aparece un dialog de confirmación antes de detener el proceso:

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  ¿Cancelar sincronización?                       │
│                                                     │
│  143 archivos ya fueron movidos a la Biblioteca.    │
│  Esta acción no se puede revertir.                  │
│  Los archivos pendientes permanecerán en Descargas. │
│                                                     │
│  [Seguir sincronizando]      [Cancelar de todas formas] │
└─────────────────────────────────────────────────────┘
```

Si confirma la cancelación, se muestra la Pantalla 1.3 con los resultados parciales. Los archivos ya movidos permanecen en la Biblioteca — no se revierten.

---

### Pantalla 1.3 — Resultado de Sincronización

```
┌─────────────────────────────────────────────────────┐
│  ✅ Sincronización completada                       │
│                                                     │
│  ┌──────────┬──────────────────────┬──────────┐     │
│  │  231     │  16                  │  0       │     │
│  │ Movidos  │ Ignorados            │ Errores  │     │
│  └──────────┴──────────────────────┴──────────┘     │
│                                                     │
│  Ignorados:                                         │
│    12 ya existían en Biblioteca                     │
│     4 no se importaron — metadatos incompletos      │
│                                                     │
│  Playlists actualizadas: Rock (18) · Favoritos (6)  │
│                                                     │
│                              [Ir a Biblioteca →]    │
└─────────────────────────────────────────────────────┘
```

**Caso — todos los archivos fallaron (0 movidos):**
Se muestra el mismo modal con `Movidos: 0`. Al cerrarlo, la app regresa al estado exacto en que se encontraba antes de iniciar la sincronización — ya sea la biblioteca vacía o la biblioteca con los archivos de sincronizaciones anteriores.

**Contadores:**

| Contador | Qué incluye |
|---|---|
| **Movidos** | Archivos procesados y movidos con éxito |
| **Ignorados** | Ya existían en Biblioteca + metadatos obligatorios faltantes + profundidad > 5 niveles + archivos no-audio en carpetas `[Tag]` |
| **Errores** | Fallos técnicos al intentar mover (permisos, disco lleno a mitad del proceso, etc.) |

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
│  ✅ 143 archivos movidos con éxito (seguros)         │
│  ⏸  88 archivos pendientes (intactos en Descargas)  │
│  ❌  1 archivo en proceso (puede estar incompleto)   │
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
   │   ├── Paranoid.mp3            → Biblioteca + Playlists: Rock, Favoritos
   │   └── Heroes.flac             → Biblioteca + Playlists: Rock, Favoritos
   ├── [Jazz]/
   │   └── So What.flac            → Biblioteca + Playlist: Jazz
   ├── [Rock]/
   │   └── [Favoritos]/
   │       └── Space Oddity.flac   → Biblioteca + Playlists: Rock, Favoritos (equivalente al caso anterior)
   ├── [Rock]/
   │   └── SubCarpeta/
   │       └── Starman.flac        → Biblioteca + Playlist: Rock (SubCarpeta sin corchetes se ignora)
   └── Dark Side of the Moon.flac  → Biblioteca (sin playlist)
```

**Comportamiento:**

- Si la playlist `Rock` no existe → se crea el archivo `/Biblioteca/Playlists/Rock.m3u8`
- Si la playlist `Rock` ya existe → se agregan las canciones sin duplicar
- La carpeta `[Tag]` en Descargas se elimina después de mover todos sus archivos **solo si quedó completamente vacía**
- Si la carpeta `[Tag]` contiene archivos no-audio, no se elimina (los archivos no-audio se cuentan como ignorados)
- Las canciones dentro de una carpeta `[Tag]` también siguen la estructura normal de la Biblioteca (`/Artista/Álbum/`)
- Los tags son **case-sensitive**: `[rock]` y `[Rock]` crean dos playlists distintas

**Reglas de anidamiento de `[Tag]`:**

| Estructura | Resultado |
|---|---|
| `[Rock][Favoritos]/cancion.flac` | Canción en playlists Rock y Favoritos |
| `[Rock]/[Favoritos]/cancion.flac` | Equivalente — canción en playlists Rock y Favoritos |
| `[Rock]/SubCarpeta/cancion.flac` | Canción en playlist Rock; SubCarpeta (sin corchetes) se ignora |
| `[Rock]/[Favoritos]/SubCarpeta/cancion.flac` | Canción en playlists Rock y Favoritos; SubCarpeta se ignora |

**Límite de profundidad de escaneo:**

El escaneo recursivo de la carpeta de Descargas tiene un máximo de **5 niveles de profundidad**. Los archivos en niveles más profundos son ignorados y reportados en el pre-scan (Pantalla 1.1) y en el resultado final.

Ejemplo de conteo de niveles desde la raíz de Descargas:
```
nivel 1: /Downloads/Música/cancion.flac
nivel 2: /Downloads/Música/[Rock]/cancion.flac
nivel 3: /Downloads/Música/[Rock]/Artista/cancion.flac
nivel 4: /Downloads/Música/[Rock]/Artista/Álbum/cancion.flac
nivel 5: /Downloads/Música/[Rock]/Artista/Álbum/Disco1/cancion.flac
         → ignorado si hay más profundidad
```

**Duplicados dentro de la misma sesión de sync con múltiples `[Tag]`:**

Si la misma canción aparece en múltiples carpetas `[Tag]` (ej. `[Rock]/Heroes.flac` y `[Favoritos]/Heroes.flac` con metadatos idénticos), ambas generan la misma ruta de destino. El archivo se mueve una sola vez, pero **todos los tags de ambas fuentes se procesan**: la canción queda en `Rock.m3u8` y en `Favoritos.m3u8`.

**Sanitización del nombre de tag:**

El nombre del tag se usa como nombre de la playlist y como nombre del archivo `.m3u8`. Se aplica la misma sanitización de caracteres prohibidos que al resto de nombres de archivos (ver Error 8.4), especialmente relevante para compatibilidad cross-platform (macOS → Windows).

---

## 5. Flujo 2 — Biblioteca Vacía

**Trigger:** Biblioteca configurada pero sin archivos procesados todavía.

### Estados iniciales al cargar la pantalla

Al entrar a la app (o al navegar a Biblioteca), se realiza una llamada ligera a la API que devuelve el conteo de archivos en ambas carpetas: `{ downloads: { count, byFormat }, library: { count, byFormat } }`. Con esa respuesta se determina cuál de los cuatro estados mostrar:

| Estado | Descargas | Biblioteca | UI mostrada |
|---|---|---|---|
| **A — Primera sync** | Con archivos | Vacía | Pantalla 2.1 con CTA de sync |
| **B — Uso habitual** | Con archivos nuevos | Con archivos | Biblioteca normal + botón sync en Header |
| **C — Sin pendientes** | Vacía | Con archivos | Biblioteca normal + botón sync en Header (re-validación disponible) |
| **D — Sin archivos** | Vacía | Vacía | Pantalla 2.2 informativa |

**Visibilidad del botón [Sincronizar] en el Header:**
- **Estado A (primera sync):** el botón **no** aparece en el Header. El único CTA de sync está en el contenido de la pantalla vacía.
- **Estados B y C:** el botón **siempre** aparece en el Header (para sync de archivos nuevos o para forzar re-validación).

---

### Pantalla 2.1 — Estado Vacío con Descargas disponibles (Estado A)

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │                                          │
│          │         📭 Tu biblioteca está vacía      │
│ Biblioteca│                                         │
│ Artistas │   Tienes 247 archivos listos para        │
│ Álbumes  │   organizar en tu carpeta de Descargas.  │
│ Playlists│                                          │
│          │              [Sincronizar ahora]          │
│ Salud(0) │                                          │
│          │   ─────────────────────────────────────  │
│  0 tracks│   ¿Tienes música en otra carpeta?        │
│  0 GB    │   [Cambiar carpeta de Descargas]          │
└──────────┴──────────────────────────────────────────┘
```

---

### Pantalla 2.2 — Estado Vacío sin archivos en ninguna carpeta (Estado D)

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │                                          │
│          │         📭 Tu biblioteca está vacía      │
│ Biblioteca│                                         │
│ Artistas │   Agrega archivos a tu carpeta de        │
│ Álbumes  │   Descargas para comenzar.               │
│ Playlists│                                          │
│          │   📥 /Users/juan/Downloads/Música        │
│ Salud(0) │                                          │
│          │   [Cambiar carpeta de Descargas]          │
│  0 tracks│                                          │
│  0 GB    │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Notas generales:**

- Las secciones Artistas, Álbumes, Playlists también muestran un estado vacío si se navega a ellas.
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

**Controles:**

- Paginación: 25, 50, 100, 200 elementos por página (configurable en Settings)
- Ordenamiento: Ascendente/Descendente por Título, Artista o Álbum

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

### Menú Contextual de Acciones (Universal)

> **Regla global:** Este menú flotante aparece en **cualquier vista donde haya canciones listadas** — Biblioteca (lista o grid), Artistas, Álbumes, Playlists o Salud. Las opciones que muestra dependen de **dos condiciones**, en este orden:
>
> 1. **Cantidad de archivos seleccionados:** individual vs. múltiple.
> 2. **Vista actual:** si el usuario está dentro del detalle de una playlist específica, aparece la opción extra "Remover de esta playlist" que no existe en ninguna otra vista.

**Trigger:** Clic en el botón `⋯` (MoreHorizontal) de cualquier fila o card.

**Comportamiento del menú flotante:**

- Aparece posicionado junto al botón `⋯` que lo disparó.
- Consciente del viewport: si el botón está cerca del borde derecho, el menú abre hacia la izquierda; si está cerca del borde inferior, abre hacia arriba.
- Altura máxima fija con scroll interno si las opciones lo requieren.
- Se cierra al hacer clic fuera, al presionar Escape, o al seleccionar una opción.
- En Mobile: se comporta como un **Bottom Sheet** (se desliza desde la parte inferior de la pantalla), más ergonómico para pantallas táctiles.

```
                              ┌─────────────────────────┐
  [☐ 🟢 Comfortably Numb ···]│ ✏️  Editar metadatos     │
                              │ 📂  Mostrar en Finder    │
                              │ ➕  Agregar a playlist   │
                              │ 📤  Exportar/Convertir   │
                              │ ─────────────────────── │
                              │ 🗑  Eliminar             │
                              └─────────────────────────┘

  [En detalle de playlist:]
                              ┌─────────────────────────┐
  [☐ 🟢 Comfortably Numb ···]│ ✏️  Editar metadatos     │
                              │ 📂  Mostrar en Finder    │
                              │ ➕  Agregar a playlist   │
                              │ 📤  Exportar/Convertir   │
                              │ ─────────────────────── │
                              │ ↩️  Remover de playlist  │ ← solo aquí
                              │ ─────────────────────── │
                              │ 🗑  Eliminar             │
                              └─────────────────────────┘
```

**Tabla completa de opciones por contexto:**

| Opción                     | 1 archivo       | Múltiples                     | Solo en playlist                           |
| -------------------------- | --------------- | ----------------------------- | ------------------------------------------ |
| Editar metadatos           | ✅ (individual) | ✅ (batch — 1 campo a la vez) | —                                          |
| Mostrar en Finder/Explorer | ✅              | ❌                            | —                                          |
| Agregar a playlist         | ✅              | ✅                            | —                                          |
| Exportar/Convertir         | ✅              | ✅                            | —                                          |
| Remover de esta playlist   | ✅              | ✅                            | ✅ solo dentro del detalle de una playlist |

> **Remover de playlist:** "Remover" solo borra la referencia en el `.m3u8` — el archivo físico de musica permanece intacto en la Biblioteca.

---

### Pantalla 3.4 — Selección Múltiple

Cuando hay 2 o más archivos seleccionados, aparece una **barra de acciones** fija en la parte inferior del área de contenido:

```
┌─────────────────────────────────────────────────────┐
│  ✓ 12 archivos seleccionados                        │
│  [Editar metadatos]  [Agregar a playlist]  [Exportar] [Eliminar]  [✕ Cancelar] │
└─────────────────────────────────────────────────────┘
```

El botón `⋯` sobre cualquier fila también funciona en selección múltiple y muestra las opciones disponibles para el lote. Ver la sección **Menú Contextual de Acciones (Universal)** arriba para la tabla completa de opciones.

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

### 7.1 Edición Individual (1 archivo)

**Trigger:** Clic en "Editar metadatos" con 1 archivo seleccionado.

> **Principio de diseño:** Existe una única interfaz de edición. No hay pantallas distintas para "edición manual" vs "edición con MusicBrainz". Los campos de texto se pre-rellenan con los datos de MusicBrainz si hay un resultado, el usuario edita libremente cualquier campo, y confirma. La fuente del dato (MusicBrainz, escritura manual, o mezcla de ambos) no cambia la interfaz.

Al abrir el editor, MusicBrainz se consulta automáticamente en segundo plano usando los metadatos existentes del archivo. Si hay resultado, los campos sugeridos se marcan visualmente. Si no hay resultado, los campos simplemente están vacíos (o con los valores actuales del archivo) listos para edición manual. El usuario puede buscar manualmente en MusicBrainz (con metadatos o con MBID) en cualquier momento sin cambiar de pantalla.
[MusicBrainz Identifier](https://musicbrainz.org/doc/MusicBrainz_Identifier)
[MusicBrainz Search](https://musicbrainz.org/search)

---

### Pantalla 4.1 — Editor Individual

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Editar metadatos — Comfortably Numb.flac         │
│                                                      │
│  [portada]   Comfortably Numb.flac                  │
│              Pink Floyd · The Wall · 1979            │
│                                                      │
│  ─── Resultado MusicBrainz ─────────────────────── │
│  Pink Floyd — The Wall (1979)  Confianza: 98%       │
│  ID: mb-3d374d  [Ver en MusicBrainz ↗]             │
│  [🔍 Buscar otro resultado]                          │
│                                                      │
│  ─── Campos ────────────────────────────────────── │
│  Título    [Comfortably Numb              ]          │
│  Artista   [Pink Floyd                   ]          │
│  Álbum     [The Wall                     ]          │
│  Año       [1979]                                   │
│  Género    [Rock ×          ✚ añadir género...]     │ ← sugerido por MusicBrainz
│  Track #   [6   ]  Disco  [2  ]                     │ ← sugerido por MusicBrainz
│  ISRC      [GBAYE...                     ]          │ ← sugerido por MusicBrainz
│  Portada   [imagen actual]  [Usar de MusicBrainz]   │
│                                                      │
│  ℹ️ Los campos con fondo destacado fueron sugeridos  │
│     por MusicBrainz. Puedes editarlos libremente.   │
│                                                      │
│  [Cancelar]                       [Guardar cambios →]│
└──────────────────────────────────────────────────────┘
```

> **Sin resultado de MusicBrainz:** Los campos sugeridos aparecen vacíos (o con el valor actual del archivo). El aviso de MusicBrainz dice "Sin resultados — edita manualmente o busca con otro término". La interfaz es idéntica, solo cambia la presencia de datos pre-rellenados.

**Paso 2 — Confirmación antes de escribir al archivo:**

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Confirmar cambios en archivo físico             │
│                                                     │
│  Se modificarán los metadatos de:                   │
│  Comfortably Numb.flac                              │
│                                                     │
│  + Género: Rock                                     │
│  + Track #: 6                                       │
│  + Portada: (imagen de MusicBrainz)                 │
│                                                     │
│  Esta acción modifica el archivo. No se puede       │
│  deshacer desde la interfaz en esta versión.        │
│                                                     │
│  [Cancelar]                    [Sí, aplicar cambios]│
└─────────────────────────────────────────────────────┘
```

---

### 7.2 Edición por Lotes (Batch) — Wizard

**Regla estricta:** Solo se permite editar **un campo a la vez** para el lote seleccionado. Esta restricción es intencional para evitar errores masivos difíciles de revertir.

**Campos soportados en batch:** Artista, Álbum, Género, Año, Imagen de Portada.

> **Patrón Wizard:** Este flujo —y cualquier flujo multi-paso de la app— se presenta como un wizard: una serie de modales donde cada paso muestra una sola pregunta o decisión. El usuario avanza paso a paso. Esto reduce la carga cognitiva: en lugar de ver un formulario complejo de una vez, el usuario responde una cosa, luego la siguiente, y así hasta la confirmación final. Todos los pasos son obligatorios, por lo que el wizard garantiza que no falta ninguno.

---

#### Paso 1 — ¿Qué campo modificar?

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Edición batch — 12 archivos    Paso 1 de 4      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  ¿Qué campo deseas modificar en todos los archivos? │
│                                                      │
│  ○ Artista                                          │
│  ○ Álbum                                            │
│  ○ Año                                              │
│  ◉ Género                                           │
│  ○ Portada                                          │
│                                                      │
│  [Cancelar]                          [Siguiente →]  │
└──────────────────────────────────────────────────────┘
```

---

#### Paso 2 — ¿Cuál es el nuevo valor?

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Edición batch — 12 archivos    Paso 2 de 4      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Campo: Género                                      │
│                                                      │
│  [Rock × Jazz ×              ✚ añadir género...]    │
│  Selecciona géneros existentes o escribe y presiona  │
│  Enter para crear uno nuevo.                         │
│                                                      │
│  [← Volver]                          [Siguiente →]  │
└──────────────────────────────────────────────────────┘
```

---

#### Paso 3 — Preview de cambios (primer confirm)

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Edición batch — 12 archivos    Paso 3 de 4      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Esto es lo que va a pasar:                         │
│  Campo: Género → "Rock, Jazz"                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ARCHIVO                   ANTES    DESPUÉS   │   │
│  │ Comfortably Numb.flac     —        Rock, Jazz│   │
│  │ Heroes.flac               —        Rock, Jazz│   │
│  │ Paranoid.mp3              Metal    Rock, Jazz│   │ ← sobrescribirá
│  │ ... 9 más                                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ⚠️  3 archivos ya tenían un género y será           │
│     sobrescrito.                                     │
│                                                      │
│  [← Volver]                          [Confirmar →]  │
└──────────────────────────────────────────────────────┘
```

---

#### Paso 4 — Confirmación final (segundo confirm)

```
┌──────────────────────────────────────────────────────┐
│  ✏️  Edición batch — 12 archivos    Paso 4 de 4      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Última confirmación                                 │
│                                                      │
│  Se modificarán físicamente 12 archivos de audio.   │
│  Esta acción no se puede deshacer.                  │
│                                                      │
│  [Cancelar]              [Sí, modificar 12 archivos]│
└──────────────────────────────────────────────────────┘
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
│          │ 32 tracks · 2h 14min · 18 artistas       │
│          │ .m3u8 ✅ Válido                          │
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

> La acción "Remover" en un track solo borra la referencia en el archivo de `.m3u8`. El archivo de musica físico en la Biblioteca no se toca.

**Datos del encabezado de playlist:**

- Total de canciones
- Tiempo total de reproducción
- Número de artistas únicos

---

### Pantalla 5.4 — Modal "Agregar a Playlist"

**Trigger:** Clic en [Agregar a playlist] desde selección individual o múltiple.

```
┌──────────────────────────────────────────────────────┐
│  ➕ Agregar a playlist                               │
│                                                      │
│  🔍 [Buscar playlist...]                             │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ✓ Favoritos              32 tracks           │   │
│  │ ─ Rock Clásico           18 tracks           │   │
│  │ 🚫 Sesión Nocturna  [ya está en esta lista]  │   │ ← si toggle duplicados OFF
│  │ ─ Jazz & Soul            24 tracks           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [+ Crear nueva playlist]  ← on-the-fly             │
│                                                      │
│  [Cancelar]                     [Agregar a lista]   │
└──────────────────────────────────────────────────────┘
```

**Comportamiento de duplicados:**

- Si el toggle "No duplicados" está activo en Settings, las playlists donde la canción ya existe se muestran deshabilitadas con la etiqueta "ya está en esta lista".
- Si el toggle está inactivo, todas las playlists son seleccionables sin restricción.

**Creación on-the-fly:**

- [+ Crear nueva playlist] expande un campo de nombre inline dentro del mismo modal, sin cerrar ni navegar. Al confirmar, la nueva playlist se crea y queda seleccionada automáticamente.

---

### Pantalla 5.5 — Archivo Huérfano en Playlist

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

### Pantalla 5.6 — Crear / Editar Playlist

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
│    └─ Si se elige Mover:                             │
│       ☐ Eliminar carpetas vacías en origen           │
│          tras completar con éxito                    │
│                                                      │
│  ─── Estructura ─────────────────────────────────── │
│  ◉ Mantener estructura  (/Artista/Álbum/Título)     │
│  ○ Aplanar (todos los archivos en raíz)              │
│                                                      │
│  ─── Formato ────────────────────────────────────── │
│  ◉ Formato original (FLAC/MP3 sin cambios)          │
│  ○ Convertir a MP3 320kbps (genera copia)           │
│    └─ ☐ Redimensionar portada a 500×500px           │
│          (mejora compatibilidad con reproductores)   │
│                                                      │
│  [Ver preview de estructura]                         │
│                                                      │
│  ─────────────────────────────────────────────────   │
│  [Cancelar]                    [Iniciar exportación] │
└──────────────────────────────────────────────────────┘
```

**Validación de espacio:** La app calcula el peso total antes de iniciar. Si el destino no tiene capacidad suficiente, bloquea el flujo antes de comenzar con el error de espacio insuficiente.

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

**Notas:**

- Si se seleccionó "Mover", el proceso tiene una fase adicional de verificación de integridad antes de eliminar el origen.
- Si se seleccionó conversión a MP3, los metadatos y portadas del archivo original se inyectan obligatoriamente al nuevo MP3.
- Si un archivo falla durante la conversión, el proceso continúa con el resto y al finalizar se muestra un reporte con los archivos que fallaron.

---

### Pantalla 6.4 — Reporte Final con Errores (Conversión)

```
┌──────────────────────────────────────────────────────┐
│  📤 Exportación completada con advertencias          │
│                                                      │
│  ✅ 21 archivos exportados correctamente             │
│  ❌  3 archivos fallaron durante la conversión:      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ARCHIVO              ERROR                   │   │
│  │ Dark Side Part3.flac  Codec no compatible    │   │
│  │ Live_Set_Raw.wav      Archivo dañado         │   │
│  │ Bonus_Track.mp3       Error de lectura       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Los archivos que fallaron permanecen intactos       │
│  en su ubicación original.                           │
│                                                      │
│  [Exportar reporte]           [Cerrar]               │
└──────────────────────────────────────────────────────┘
```

---

## 10. Flujo 7 — Optimización de Portadas (Finder/Explorer Fix)

**Objetivo:** Corregir la visibilidad de carátulas en el sistema operativo (principalmente macOS Finder).

**Problema:** macOS Finder no lee portadas en capas profundas de metadatos FLAC. La app normaliza la posición del frame de imagen (APIC) al primer nivel de lectura para que el sistema operativo las muestre correctamente.

**Este flujo se activa desde Settings** (toggle "Normalización de portadas"). Una vez activado, la primera ejecución procesa toda la biblioteca. Ejecuciones posteriores solo procesan archivos nuevos o que no tengan imagen en el nivel superior.

---

### Pantalla 7.1 — Optimización en Progreso

```
┌──────────┬──────────────────────────────────────────┐
│  TOPBAR  │ ⚙️ Optimizando portadas...  ████░░  67%  │  ← barra bajo Header
├──────────┴──────────────────────────────────────────┤
│          │                                          │
│  SIDEBAR │           ÁREA DE CONTENIDO              │
│          │       (navegable durante el proceso)     │
│ Biblioteca│                                         │
│ Artistas │   [Contenido normal de la vista actual]  │
│ ...      │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Comportamiento:**

- La barra de progreso aparece fija bajo el Header. No ocupa el área de contenido.
- El usuario puede navegar libremente entre secciones mientras el proceso corre.
- Las acciones de escritura sobre archivos (editar metadatos, sincronizar, exportar) quedan bloqueadas hasta que finalice.
- Otras acciones de lectura (ver biblioteca, buscar, filtrar) permanecen disponibles.

---

### Pantalla 7.2 — Optimización Completada

```
┌─────────────────────────────────────────────────────┐
│  ✅ Optimización de portadas completada             │
│                                                     │
│  Procesados: 1,847 archivos                         │
│  Optimizados: 312 archivos (portada normalizada)    │
│  Omitidos: 1,535 archivos (ya estaban correctos)   │
│                                                     │
│  [Cerrar]                                           │
└─────────────────────────────────────────────────────┘
```

---

## 11. Flujo 8 — Errores y Casos Borde

### Catálogo de Mensajes de Error

#### Error 8.1 — Ruta demasiado larga (>260 caracteres)

> **Timing:** Este error se detecta durante el **pre-scan**, antes de mostrar la Pantalla 1.1. Los archivos afectados se muestran como advertencia batch en el resumen de confirmación. No interrumpe el proceso archivo por archivo.



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

#### Error 8.2 — Archivo sin metadatos obligatorios

Los campos **Artista**, **Álbum** y **Título** son obligatorios para importar un archivo a la Biblioteca. Si falta cualquiera de ellos, el archivo se ignora durante la sincronización.

```
Cualquier archivo sin Artista, Álbum o Título:
→ Ignorado. Aparece en el resultado de sincronización como
  "no se importó — metadatos incompletos".
→ No se mueve a ninguna carpeta temporal ni a "Unknown Artist".
→ Resolución: usar el flujo de edición de metadatos (Flujo 4)
  para completar los campos faltantes y volver a sincronizar.
```

Los campos **Año** y **Número de track** son opcionales. Su ausencia no impide la importación — solo afecta el formato de la ruta de destino (ver tabla en "Campos mínimos requeridos").

---

#### Error 8.3 — Sin espacio suficiente

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

#### Error 8.4 — Caracteres prohibidos en nombre

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

#### Error 8.5 — Disco externo desconectado durante operación

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

#### Error 8.6 — MusicBrainz sin resultados

```
Estado en el editor de metadatos:
"No se encontraron resultados en MusicBrainz para este archivo.
 Edita los campos manualmente o busca con otro término."

[🔍 Buscar manualmente en MusicBrainz]  → abre búsqueda con campos editables
[Editar manualmente]                     → campos desbloqueados sin sugerencia
```

---

#### Error 8.7 — Borrado de localStorage

**Trigger:** El usuario borra el localStorage (desde Settings o desde el navegador directamente).

La app regresa al Onboarding sin tocar ningún archivo físico en disco. Al completar el Onboarding nuevamente y reconectar la ruta de Biblioteca, la app realiza un escaneo automático para recuperar los metadatos de los archivos existentes y las playlists `.m3u8` presentes en la Biblioteca.

---

## 12. Pantallas de Configuración (Settings)

### Pantalla 12.1 — Configuración General

```
┌──────────────────────────────────────────────────────┐
│  ⚙️  Configuración                                    │
│                                                      │
│  ─── Carpetas ───────────────────────────────────── │
│  Descargas:  /Users/juan/Downloads/Música  [Cambiar] │
│  Biblioteca: /Users/juan/Music/Biblioteca  [Cambiar] │
│  ℹ️ Cambiar una ruta dispara una re-sincronización   │
│                                                      │
│  ─── Interfaz ───────────────────────────────────── │
│  Tema:          ◉ Dark  ○ Light  ○ Sistema          │
│  Paginación:    [50 ▾] elementos por página         │
│  Vista default: ◉ Lista  ○ Grilla                   │
│                                                      │
│  ─── Playlists ──────────────────────────────────── │
│  ☐ Bloquear canciones duplicadas en playlists       │
│    Si está activo, no se podrá agregar un track a   │
│    una playlist donde ya existe.                    │
│                                                      │
│  ─── Optimización ───────────────────────────────── │
│  ☐ Normalización de portadas (fix Finder/Explorer)  │
│    Mueve la imagen de portada al primer nivel de    │
│    metadatos. Útil si tu reproductor no la muestra. │
│  ☐ Redimensionar portadas a 500×500px al exportar  │
│    Solo aplica al convertir a MP3.                  │
│                                                      │
│  ─── Datos ──────────────────────────────────────── │
│  [Exportar configuración → config.json]             │
│  [Importar configuración desde archivo]             │
│  [Borrar toda la configuración]  ← con confirmación │
│                                                      │
│  ─── Acerca de ──────────────────────────────────── │
│  Music Files Manager v1.1.0                         │
│  Next.js + Node.js · ffmpeg · MusicBrainz API       │
└──────────────────────────────────────────────────────┘
```

**Notas:**

- **Cambio de rutas:** El usuario debe confirmar el cambio de ruta (se le advierte que puede afectar a la biblioteca). Una vez confirmado, la app re-valida la nueva ruta y dispara una **re-validación automática** (no una sync — no se mueven archivos). Si el usuario quiere sincronizar archivos desde la nueva carpeta de Descargas, debe iniciar la sync manualmente. Al cambiar la ruta de la Biblioteca, el watcher de filesystem también migra a la nueva ruta.
- **Normalización de portadas:** OFF por default. El usuario decide si activarlo según su reproductor — la app nunca lo fuerza.
- **Exportar/Importar configuración:** Guarda y restaura las rutas de carpetas y preferencias desde un `config.json`. Útil si se borra el localStorage o se migra a otro equipo.
- **Borrar configuración:** Requiere doble confirmación. Borra el localStorage y regresa al onboarding. No toca los archivos de música en disco.

---

## 13. Re-validación y Watcher de Biblioteca

### Re-validación vs. Sincronización

Son dos operaciones completamente distintas:

| | Sincronización | Re-validación |
|---|---|---|
| **Trigger** | Manual — usuario hace clic en [Sincronizar] | Automático o manual |
| **Mueve archivos** | ✅ Sí | ❌ Nunca |
| **Lee Descargas** | ✅ Sí | ❌ No |
| **Lee Biblioteca** | ✅ Sí (para detectar duplicados) | ✅ Sí (única operación) |
| **Resultado** | Archivos movidos y organizados | Estado en memoria actualizado |

### Qué produce la re-validación

Lee todos los archivos en la carpeta de Biblioteca y reconstruye el estado en memoria que usa la app:

- **Health status** por archivo (para los indicadores de color en la Biblioteca)
- **Tiempo total de reproducción** y conteo de canciones (para el detalle de playlists)
- **Lista de géneros únicos** en la biblioteca (para el autocompletado estilo Notion en el editor de metadatos)
- **Playlists** (lee los archivos `.m3u8` y detecta entradas huérfanas)
- **Artistas y Álbumes** (para las vistas de Artistas y Álbumes)

### Cuándo se dispara la re-validación

1. **Al cargar la app** — si la Biblioteca tiene archivos, corre automáticamente al montar la aplicación
2. **Evento del watcher** — cuando se detecta un cambio externo en la carpeta de Biblioteca (ver sección siguiente)
3. **Manual** — usuario selecciona "Forzar re-validación" en el dropdown de Sync

### UX durante la re-validación

A diferencia de la sincronización, la re-validación **no bloquea la interfaz**. El usuario puede navegar con normalidad. Solo se bloquean las operaciones de escritura (sync, edición de metadatos, exportación) para proteger la integridad de los datos mientras se reconstruye el índice.

```
┌─────────────────────────────────────────────────────┐
│  🎵 Music Manager   [🔍 Búsqueda]     [⚙ Sync ▾]   │
│  ████████████░░░░░░░░  Actualizando biblioteca...   │  ← barra bajo el Header
├─────────────────────────────────────────────────────┤
│  SIDEBAR  │      ÁREA DE CONTENIDO                  │
│           │   (navegable durante el proceso)        │
│           │                                         │
└─────────────────────────────────────────────────────┘
```

### Mecanismo de bloqueo de operaciones de escritura

El bloqueo durante sync y re-validación se gestiona de forma centralizada, **no botón por botón**:

- **Zustand store** — campo `operationInProgress: 'sync' | 'revalidation' | null`
- **Wrapper de API** — antes de ejecutar cualquier request de escritura (`POST`, `PATCH`, `DELETE`), comprueba el store. Si hay operación en curso, rechaza la llamada con un error específico que el UI maneja mostrando un toast: *"No se puede realizar esta acción mientras hay una operación en curso."*
- Las requests de lectura (`GET`) nunca se bloquean

### Watcher de Filesystem (chokidar)

La app mantiene un watcher activo sobre la carpeta de Biblioteca usando **chokidar** (FSEvents en macOS, ReadDirectoryChangesW en Windows). Cuando el usuario modifica manualmente archivos en la Biblioteca desde Finder/Explorer con la app abierta, el watcher detecta los cambios y dispara una re-validación automática.

**Arquitectura:**
- `src/server/fs/watcher.ts` — instancia de chokidar con debounce de 1 segundo
- `src/app/api/library/watch/route.ts` — SSE stream que emite eventos del watcher al cliente
- `useLibraryWatcher.ts` — hook cliente que escucha el SSE y actualiza el estado vía Zustand

**Al cambiar la ruta de Biblioteca en Settings**, el watcher migra automáticamente a la nueva ruta.

---

## 14. Componentes Globales

### Topbar

```
┌─────────────────────────────────────────────────────┐
│  🎵 Music Manager   [🔍 Búsqueda global]  [⚙ Sync ▾]│
└─────────────────────────────────────────────────────┘
```

**Visibilidad del botón [Sync ▾]:** solo aparece en el Header cuando la Biblioteca tiene archivos. En el estado de primera sync (Biblioteca vacía), no aparece — el CTA de sync está en el contenido de la pantalla vacía.

**Botón [Sync ▾] despliega:**

- Sincronizar ahora
- Forzar re-validación completa de biblioteca (ver sección Re-validación)
- Ver última sincronización
- Verificar integridad

### Búsqueda Global

- Busca en tiempo real por: Título, Artista, Álbum, Año, Género
- Resultados agrupados por categoría
- Shortcut: `Cmd+K` / `Ctrl+K`
- Muestra salud del resultado en el listado

### Indicadores de Salud — Reglas Completas

| Prioridad | Campo      | Peso    | Impacto          |
| --------- | ---------- | ------- | ---------------- |
| 1         | Título     | Crítico | Sin título → 🔴  |
| 1         | Artista    | Crítico | Sin artista → 🔴 |
| 2         | Álbum      | Alto    | Sin álbum → 🟠   |
| 3         | Portada    | Medio   | Sin portada → 🟡 |
| 4         | Género     | Bajo    | Sin género → 🟡  |
| —         | Corrupción | Crítico | Corrupción → 🔴  |

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

**Excepción — Optimización de Portadas:** Este proceso no bloquea la interfaz completa. El usuario puede navegar; solo se bloquean las acciones de escritura sobre archivos.

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

| Nivel              | Tipo de error                                          | Comportamiento UI                                                                         | Se desbloquea cuando                             |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 🔴 **Crítico**     | Disco desconectado, sin permisos                       | Modal bloqueante sobre toda la app. No se puede hacer nada.                               | Usuario cierra el modal o resuelve el problema.  |
| 🟠 **Grave**       | Espacio insuficiente, archivo corrupto encontrado      | Modal bloqueante sobre el proceso en curso. El resto de la app queda accesible al cerrar. | Usuario cierra el modal (el proceso se detiene). |
| 🟡 **Advertencia** | Ruta muy larga, nombre sanitizado, duplicado detectado | Notificación inline dentro del flujo. No bloquea.                                         | Automático — el usuario puede ignorar o actuar.  |
| ℹ️ **Informativo** | Archivos ignorados, carpeta vacía                      | Toast en esquina inferior. Desaparece solo en 5 segundos.                                 | Automático.                                      |

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

## 15. Inconsistencias del PRD y Decisiones Tomadas

| #   | Inconsistencia / Ambigüedad original                                                    | Decisión adoptada                                                                                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | SQLite mencionado para historial de Undo                                                | **Eliminado del MVP.** Solo localStorage para preferencias. Sin historial de Undo en v1.                                                                                                                                                                                                                                                           |
| 2   | "Fix de portadas macOS" — ¿activado o no por default?                                   | **OFF por defecto.** El usuario decide activarlo si su reproductor lo necesita.                                                                                                                                                                                                                                                                    |
| 3   | Motor de ingesta: ambigüedad entre movimiento automático y confirmación campo por campo | **Son dos flujos completamente distintos e independientes.** (1) Sincronización = proceso automático que mueve archivos de Descargas a Biblioteca usando los metadatos existentes como guía de organización. No edita nada. (2) Edición de metadatos = flujo separado que el usuario inicia voluntariamente, con MusicBrainz y doble confirmación. |
| 4   | Estado de "sincronización en progreso" no definido                                      | **Loading con barra de progreso + texto de advertencia "no cierres la app".** Sin detalle de archivos individuales.                                                                                                                                                                                                                                |
| 5   | "Flujo de bienvenida" no especificado                                                   | **Dos pantallas** con transición lateral: (1) Presentación y funciones, (2) Selección de carpetas. Sin wizard de múltiples pasos adicionales.                                                                                                                                                                                                      |
| 6   | Carpetas `[Tag]` — funcionamiento no especificado                                       | Carpetas creadas manualmente por el usuario en Descargas. El nombre dentro de `[]` es el nombre de la playlist. Una carpeta puede tener múltiples `[Tag]`. Los archivos dentro se asignan automáticamente al sincronizar. Si la playlist no existe, se crea.                                                                                       |
| 7   | ¿La app reproduce música?                                                               | **No en MVP.** Solo gestión. Reproductor planificado para siguiente fase.                                                                                                                                                                                                                                                                          |
| 8   | Bloqueo de UI en errores — no definido                                                  | **Jerarquía de 4 niveles:** Crítico → Grave → Advertencia → Informativo. Cada modal crítico siempre muestra el estado de los archivos. La Optimización de Portadas es excepción: no bloqueante total.                                                                                                                                              |
| 9   | Historial de Undo (SQLite) — sin flujo definido                                         | **Fuera del MVP.**                                                                                                                                                                                                                                                                                                                                 |
| 10  | Selección de carpeta — método no especificado                                           | Siempre selector nativo del OS (Finder/Explorer). La app no tiene explorador propio.                                                                                                                                                                                                                                                               |
| 11  | Usuario objetivo ambiguo — Dual Mode Simple/Avanzado                                    | **Interfaz única.** Sin modos Simple/Avanzado. La UI es limpia por defecto y expone herramientas potentes de forma contextual. Todos los usuarios ven la misma interfaz.                                                                                                                                                                           |
| 12  | MusicBrainz — MVP vs. futuro no claro                                                   | **Obligatoria en MVP.** Fuente primaria de sugerencias. El usuario siempre confirma campo por campo. Edición manual como fallback.                                                                                                                                                                                                                 |
| 13  | Nivel de confirmación en acciones destructivas                                          | **Doble confirmación universal:** toda acción que modifica o elimina archivos requiere: (1) preview de lo que pasará, (2) confirmación final explícita.                                                                                                                                                                                            |
| 14  | Edición batch — ¿cuántos campos a la vez?                                               | **Un campo por operación batch.** Restricción intencional para evitar errores masivos. El usuario lanza un batch por campo. Flujo como wizard de 4 pasos.                                                                                                                                                                                          |
| 15  | Duplicados en playlists — ¿permitidos o no?                                             | **Configurable en Settings.** Toggle "Bloquear canciones duplicadas en playlists". El modal de selección de playlist muestra visualmente las listas donde la canción ya existe.                                                                                                                                                                    |
| 16  | Exportación modo Mover — carpetas vacías en origen                                      | **Opción de limpieza.** Al elegir Mover, aparece el checkbox "Eliminar carpetas vacías en origen tras completar con éxito". No se activa por defecto.                                                                                                                                                                                              |
| 17  | Selección de archivo — ¿panel lateral o menú contextual?                                | **Menú flotante contextual** junto al botón `⋯`. No hay panel lateral para acciones. En Mobile se comporta como Bottom Sheet. Aparece en cualquier vista con canciones; opciones varían por cantidad seleccionada (individual vs. múltiple) y por si se está dentro del detalle de una playlist (opción extra "Remover de esta playlist").         |
| 18  | Editor individual — ¿flujos separados para MusicBrainz vs. manual?                      | **Una sola interfaz.** Los campos se pre-rellenan con datos de MusicBrainz cuando hay resultado. El usuario edita libremente. Sin resultado, los campos están vacíos listos para escritura. La fuente del dato no cambia la interfaz.                                                                                                              |
| 19  | Selección de carpeta — ¿`showDirectoryPicker()` del browser?                            | **No.** El botón [Elegir] llama a `POST /api/fs/open-dialog`. Node.js abre el Finder/Explorer nativo vía `child_process` y devuelve el path absoluto directamente, sin restricciones del browser.                                                                                                                                                  |
| 20  | Archivos con metadatos incompletos — ¿se importan a "Unknown Artist"?                   | **No.** Artista, Álbum y Título son obligatorios. Si falta cualquiera, el archivo se ignora y se reporta en el resultado. Resolución: editar metadatos (Flujo 4) y re-sincronizar. Año y número de track son opcionales.                                                                                                                           |
| 21  | Detección de duplicados — ¿por nombre o por metadatos?                                  | **Por ruta de destino completa incluyendo extensión.** Mismo artista + álbum + título pero distinta extensión (FLAC vs MP3) = rutas distintas = no duplicados. Misma ruta exacta = duplicado ignorado.                                                                                                                                             |
| 22  | Re-validación — ¿mueve archivos?                                                        | **Nunca.** La re-validación solo lee la Biblioteca para reconstruir el estado en memoria. El único momento en que se mueven archivos es la sincronización manual.                                                                                                                                                                                  |
| 23  | Bloqueo durante re-validación — ¿mismo mecanismo que sync?                              | **No.** Re-validación no bloquea la interfaz completa. Solo bloquea operaciones de escritura vía el store de Zustand (`operationInProgress`). El usuario puede navegar con normalidad.                                                                                                                                                             |
| 24  | Profundidad del escaneo recursivo — ¿ilimitado?                                         | **Máximo 5 niveles** desde la raíz de Descargas. Archivos en niveles más profundos se ignoran y se reportan en el pre-scan.                                                                                                                                                                                                                       |
| 25  | Carpetas `[Tag]` anidadas — ¿equivalentes a concatenadas?                               | **Sí.** `[Rock]/[Favoritos]/cancion.flac` es equivalente a `[Rock][Favoritos]/cancion.flac`. Subcarpetas sin corchetes se ignoran. Tags son case-sensitive: `[rock]` y `[Rock]` crean playlists distintas.                                                                                                                                        |

---

## 16. Glosario

| Término                        | Definición                                                                                                                                                                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sincronización**             | Proceso automático de mover archivos de la carpeta de Descargas a la Biblioteca, organizándolos por carpetas según sus metadatos. No edita metadatos.                                                                                                                                              |
| **Ingesta**                    | Sinónimo de Sincronización. El motor que ejecuta el movimiento y organización.                                                                                                                                                                                                                     |
| **Re-validación**              | Proceso automático o manual que lee la carpeta de Biblioteca y reconstruye el estado en memoria (health status, playlists, géneros, artistas). **Nunca mueve archivos.** Se dispara al cargar la app, por eventos del watcher, o manualmente desde el dropdown de Sync.                            |
| **Watcher de filesystem**      | Instancia de chokidar activa sobre la carpeta de Biblioteca. Detecta cambios externos (el usuario modifica archivos desde Finder/Explorer con la app abierta) y dispara una re-validación automática.                                                                                              |
| **operationInProgress**        | Campo en el store de Zustand (`'sync' \| 'revalidation' \| null`) que centraliza el estado de operación activa. El wrapper de API lo consulta antes de ejecutar cualquier request de escritura.                                                                                                    |
| **Edición de metadatos**       | Flujo independiente de la sincronización. El usuario inicia este flujo manualmente para revisar y corregir los tags de los archivos ya en la Biblioteca, usando MusicBrainz como fuente de sugerencias.                                                                                            |
| **Carpeta [Tag]**              | Carpeta creada manualmente por el usuario dentro de Descargas cuyo nombre —o parte del nombre— está entre corchetes. Ese texto es el nombre de una playlist. Al sincronizar, los archivos dentro se asignan automáticamente a esa playlist.                                                        |
| **Huérfano**                   | Entrada en una playlist `.m3u8` que apunta a un archivo que ya no existe en la Biblioteca.                                                                                                                                                                                                         |
| **Lossless**                   | Formato de audio sin pérdida de calidad (FLAC, ALAC). Opuesto a lossy (MP3).                                                                                                                                                                                                                       |
| **Normalización de portadas**  | Opción desactivada por defecto. Mueve la imagen de portada al primer nivel de metadatos del archivo, para que macOS Finder u otros reproductores la muestren correctamente en archivos FLAC/ALAC.                                                                                                  |
| **Batch**                      | Operación que aplica el mismo cambio a múltiples archivos simultáneamente. En esta app, un batch solo puede modificar un campo por operación.                                                                                                                                                      |
| **Sanitización**               | Proceso automático de reemplazar caracteres prohibidos en nombres de archivos según el sistema operativo de destino (`:`, `?`, `*`, etc.).                                                                                                                                                         |
| **m3u8**                       | Formato de archivo de playlist de texto plano, portable entre aplicaciones.                                                                                                                                                                                                                        |
| **Modo Aplanar**               | Exportación donde todos los archivos se copian/mueven a la raíz del destino sin mantener la estructura de carpetas.                                                                                                                                                                                |
| **Estado vacío**               | Estado de una vista cuando no hay datos que mostrar. Siempre incluye una acción sugerida para el usuario.                                                                                                                                                                                          |
| **MusicBrainz**                | Base de datos abierta de metadatos musicales. Fuente primaria de sugerencias en el MVP. El usuario siempre confirma antes de aplicar cualquier dato.                                                                                                                                               |
| **Doble confirmación**         | Patrón estándar para acciones destructivas: (1) preview de lo que va a ocurrir, (2) confirmación final explícita. Ningún archivo se modifica ni elimina con un solo clic.                                                                                                                          |
| **Modo solo lectura**          | Estado de la app cuando una carpeta configurada no está disponible. Permite ver la biblioteca pero bloquea sincronización, edición y exportación.                                                                                                                                                  |
| **localStorage**               | Mecanismo de almacenamiento del navegador donde se guardan las preferencias del usuario (rutas de carpetas, tema, paginación, preferencias). Si se borra, la app regresa al onboarding sin tocar los archivos físicos. Al reconectar la Biblioteca, se recuperan metadatos y playlists existentes. |
| **Géneros estilo etiquetas**   | Forma de ingresar géneros: se seleccionan de un listado existente (autocompletado) o se crean nuevos escribiendo y presionando Enter. Cada género es una etiqueta independiente.                                                                                                                   |
| **On-the-fly**                 | Creación de una nueva playlist directamente dentro del modal de selección, sin salir del flujo actual.                                                                                                                                                                                             |
| **Menú contextual flotante**   | Menú de opciones que aparece junto al botón `⋯` que lo dispara. Consciente del viewport (se reposiciona automáticamente si está cerca de un borde). Aparece en cualquier vista con canciones listadas. En Mobile se muestra como Bottom Sheet.                                                     |
| **Bottom Sheet**               | Componente de Mobile que se desliza desde la parte inferior de la pantalla. Reemplaza al menú flotante en pantallas táctiles para mejorar la ergonomía.                                                                                                                                            |
| **Wizard**                     | Patrón de UI donde un flujo multi-paso se divide en modales secuenciales, mostrando una sola decisión por paso. Reduce la carga cognitiva y guía al usuario paso a paso sin formularios complejos.                                                                                                 |
| **`POST /api/fs/open-dialog`** | Endpoint que abre el selector nativo de carpetas del OS vía `child_process` en Node.js. Devuelve el path absoluto como string. No usa APIs del browser.                                                                                                                                            |
