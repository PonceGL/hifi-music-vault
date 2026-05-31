# Audio Fingerprinting

## ¿Qué es realmente?

Audio fingerprinting es una técnica para generar una representación matemática compacta basada en cómo suena un audio.

Importante:

No analiza el archivo binario exacto.

Analiza el contenido perceptual del sonido.

---

## Qué NO es

Audio fingerprinting NO es:

- metadata
- tags ID3
- nombre del archivo
- artista
- álbum
- género
- portada
- BPM
- bitrate
- ruta del archivo

---

## Fingerprint ≠ hash tradicional

Un hash tradicional:

```text
SHA256(song.mp3)
```

cambia completamente si:

- cambia la metadata
- cambia la portada
- cambia el contenedor
- cambia el bitrate
- cambia cualquier byte del archivo

Aunque la canción siga sonando igual.

---

## El fingerprint es perceptual

El fingerprint intenta representar:

```text
cómo suena la grabación
```

Esto permite que múltiples archivos distintos puedan generar fingerprints equivalentes.

Ejemplo:

- FLAC
- MP3
- AAC
- distintos nombres
- distinta metadata
- distintas rutas

Pueden representar la misma grabación.

---

# Objetivo principal

El objetivo principal del fingerprinting es:

```text
identificar grabaciones
```

NO comprender música.

---

# Qué puede hacer

## Identificación de canciones

Permite reconocer una grabación aunque:

- tenga distinto nombre
- tenga distinta metadata
- esté en otro formato
- esté en otra carpeta

---

## Deduplicación

Permite detectar:

```text
“estas canciones realmente son la misma grabación”
```

Aunque existan múltiples copias.

---

## Matching entre bibliotecas

Permite relacionar:

- bibliotecas distintas
- usuarios distintos
- archivos distintos
- sistemas distintos

Sin depender de nombres.

---

## Reconciliación de metadata

Uno de los usos más importantes.

El fingerprint permite:

```text
identificar la grabación
→ consultar servicios externos
→ obtener metadata correcta
```

Ejemplos:

- artista
- álbum
- géneros
- portada
- fecha
- créditos
- relaciones

---

## Relación con MusicBrainz y AcoustID

Flujo conceptual:

```text
Audio
 ↓
Fingerprint
 ↓
AcoustID lookup
 ↓
MusicBrainz recording
 ↓
Metadata completa
```

---

## Qué NO puede hacer

El fingerprint NO entiende:

- emociones
- mood
- géneros
- calidad artística
- similitud musical conceptual
- recomendaciones

---

## Fingerprint ≠ sistema de recomendaciones

Dos canciones pueden:

- tener mismo género
- mismo mood
- BPM similar
- instrumentación similar

Y aun así:

```text
tener fingerprints completamente distintos
```

Porque son grabaciones diferentes.

---

# Cómo funciona técnicamente

## Paso 1 — Decodificación

El archivo se decodifica:

```text
MP3/FLAC/AAC
 ↓
PCM/raw audio
```

---

## Paso 2 — Transformación espectral

Normalmente se utilizan:

- FFT
- spectrograms
- análisis de frecuencias

---

## Paso 3 — Extracción de características

Ejemplos:

- picos espectrales
- energía
- relaciones armónicas
- patrones temporales

---

## Paso 4 — Compactación

Se genera una representación compacta:

```text
fingerprint
```

---

# Características importantes

## No reversible

El fingerprint normalmente NO permite reconstruir el audio original.

---

## Compacto

El fingerprint suele ser relativamente pequeño comparado con el audio original.

---

## Tolerante a cambios menores

Puede seguir funcionando aunque:

- cambie metadata
- cambie contenedor
- cambie nombre
- existan diferencias menores de codificación

---

# Limitaciones

## Versiones distintas

El fingerprint puede diferenciar:

- live versions
- remasters
- radio edits
- versiones explícitas
- versiones limpias
- mixes distintos

Porque realmente son grabaciones distintas.

---

## Calidad extrema

Compresiones muy agresivas o modificaciones severas pueden afectar el matching.

---

# Fingerprints e IDs internos

Un fingerprint NO reemplaza los IDs internos de la aplicación.

Lo recomendable es mantener ambos.

Ejemplo conceptual:

```json
{
  "id": "uuid_estable",
  "fingerprint": "audio_fingerprint"
}
```

---

# ID interno

El ID interno sirve para:

- relaciones
- playlists
- referencias internas
- sincronización
- persistencia
- entidades propias

---

# Fingerprint

El fingerprint sirve para:

- matching
- deduplicación
- reconocimiento
- importación
- reconciliación
- metadata automática

---

# Metadata automática vs manual

La metadata obtenida automáticamente NO debería sobrescribir automáticamente los cambios manuales del usuario.

Es recomendable distinguir:

- metadata automática
- metadata curada manualmente

Ejemplo conceptual:

```json
{
  "cover": {
    "source": "manual",
    "locked": true
  }
}
```

---

# Obtención de fingerprints

## Chromaprint

Chromaprint es uno de los estándares más utilizados.

Se utiliza ampliamente junto con:

- AcoustID
- MusicBrainz

---

## fpcalc

Chromaprint incluye una herramienta CLI:

```text
fpcalc
```

Ejemplo:

```bash
fpcalc song.flac
```

Resultado conceptual:

```text
DURATION=245
FINGERPRINT=...
```

---

# Integración con Node.js

Una arquitectura común:

```text
Frontend/UI
 ↓
Node.js
 ↓
filesystem + DB + workers
```

Node normalmente:

- ejecuta herramientas externas
- administra workers
- controla colas
- guarda resultados
- coordina procesamiento

---

# Costos computacionales

## Qué consume realmente

El fingerprinting consume principalmente:

- CPU
- IO disco
- decodificación de audio

Normalmente NO consume cantidades enormes de RAM.

---

## El verdadero costo

En muchos casos:

```text
decodificar el audio
```

es más costoso que generar el fingerprint.

Especialmente en:

- FLAC
- WAV
- audio alta resolución

---

# Fingerprinting a gran escala

Procesar miles de canciones simultáneamente NO es recomendable.

Arquitectura recomendada:

```text
Queue
 ↓
Worker pool limitado
 ↓
Procesamiento incremental
```

---

# Procesamiento incremental

Nunca debería hacerse:

```text
procesar toda la biblioteca al mismo tiempo
```

Lo recomendable:

- colas
- throttling
- workers limitados
- procesamiento en background

---

# Fingerprinting como background job

El fingerprinting encaja perfectamente como:

```text
background media job
```

Porque:

- puede pausarse
- puede resumirse
- no necesita bloquear la UI
- puede ejecutarse progresivamente

---

# Cache y persistencia

El fingerprint NO debería recalcularse innecesariamente.

Ejemplo conceptual:

```json
{
  "path": "...",
  "size": 123456,
  "modifiedAt": "...",
  "fingerprint": "..."
}
```

Si:

- tamaño
- timestamp
- archivo

no cambiaron:

```text
no reprocesar
```

---

# Escalabilidad

La concurrencia debería ajustarse dinámicamente.

Ejemplo:

- hardware potente → más workers
- hardware débil → menos workers

---

# Arquitectura recomendada

Separar claramente:

## Scanner

Detecta archivos.

---

## Queue

Administra trabajos pendientes.

---

## Workers

Procesan fingerprints.

---

## DB

Guarda resultados y estado.

---

# Fingerprinting como capa de identificación

El fingerprint debe entenderse como:

```text
capa de identificación perceptual
```

No como:

- identidad absoluta del sistema
- reemplazo de UUIDs
- sistema de recomendaciones
- análisis semántico musical

---

# Native bindings y arquitectura multiplataforma

## Qué son los native bindings

Los native bindings son puentes entre:

```text
JavaScript/Node.js
↓
código nativo
↓
librerías C/C++/Rust
```

Permiten que una aplicación escrita en JavaScript pueda utilizar librerías compiladas de alto rendimiento.

---

## Por qué existen

Muchas librerías multimedia importantes están escritas en:

- C
- C++
- Rust

Ejemplos:

- Chromaprint
- FFmpeg
- SQLite
- librerías DSP
- codecs de audio/video

---

## Problema principal

El código nativo depende fuertemente del entorno.

Ejemplos:

- sistema operativo
- arquitectura CPU
- versión de Node
- ABI
- Electron runtime
- librerías del sistema
- compiladores instalados

---

## Compatibilidad multiplataforma

Un binario compilado para:

```text
Windows x64 + Node.js
```

NO necesariamente funciona en:

```text
macOS ARM64 + Electron
```

---

## ABI compatibility

El ABI define cómo se comunica:

```text
Node.js ↔ código compilado
```

Cambios de:

- versión Node
- versión Electron
- arquitectura
- runtime

pueden romper compatibilidad.

---

## Electron y runtimes embebidos

Frameworks como Electron incluyen:

- Chromium
- Node embebido
- runtime propio

Esto puede generar incompatibilidades con módulos compilados para Node estándar.

---

## Problemas comunes

### Module version mismatch

El módulo fue compilado para otro runtime.

---

### Fallos de compilación

Dependencias faltantes:

- gcc
- make
- python
- Visual Studio Build Tools

---

### Incompatibilidad ARM/x64

Un módulo puede existir únicamente para:

```text
x64
```

Y no para:

```text
ARM64
```

---

### Dependencias del sistema

Algunos módulos dependen de:

- librerías compartidas
- versiones específicas del sistema
- toolchains concretos

---

## Estrategia alternativa: procesos externos

En muchos casos multimedia es más estable utilizar:

```text
Node.js
 ↓
spawn/exec
 ↓
binario externo
```

Ejemplos:

- fpcalc
- ffmpeg
- exiftool
- imagemagick

---

## Ventajas de procesos externos

### Mayor estabilidad multiplataforma

El proceso externo:

- no comparte memoria con Node
- no depende del ABI de Node
- no depende directamente del runtime embebido

---

### Menor complejidad operacional

Se reducen problemas relacionados con:

- compilación
- bindings rotos
- incompatibilidades ABI
- Electron rebuilds

---

### Aislamiento

Si el proceso falla:

```text
no necesariamente colapsa el proceso principal
```

---

## Desventajas de procesos externos

### Overhead

Crear procesos externos tiene cierto costo.

---

### Comunicación indirecta

La comunicación normalmente ocurre mediante:

- stdout
- stderr
- archivos temporales
- pipes

---

### Menor integración directa

No existe acceso directo a memoria compartida como en bindings nativos.

---

## Cuándo usar bindings nativos

Los bindings nativos pueden ser útiles cuando se requiere:

- procesamiento en tiempo real
- DSP intensivo
- ultra performance
- streaming continuo
- integración de muy bajo nivel

---

## Cuándo preferir procesos externos

Los procesos externos suelen ser preferibles cuando se prioriza:

- estabilidad
- portabilidad
- mantenimiento sencillo
- compatibilidad multiplataforma
- simplicidad operacional

Especialmente en aplicaciones multimedia.

---

## Consideración arquitectónica importante

La decisión entre:

```text
native bindings
```

vs

```text
procesos externos
```

NO depende únicamente del rendimiento.

También depende de:

- complejidad operacional
- distribución multiplataforma
- mantenimiento
- tooling
- compatibilidad futura
- estrategia de empaquetado

---

## Compatibilidad con distintos modelos de aplicación

Estas consideraciones aplican tanto para:

- aplicaciones Electron
- runtimes híbridos
- aplicaciones desktop modernas
- herramientas Node.js
- PWAs con backend local
- arquitecturas cliente-servidor locales

Aunque los detalles concretos pueden variar según el runtime utilizado.

---

# Conclusión conceptual

Audio fingerprinting es una herramienta para:

- identificar grabaciones
- reconciliar metadata
- deduplicar archivos
- relacionar bibliotecas
- automatizar matching musical

Y normalmente funciona como una capa complementaria dentro de una arquitectura mayor de:

- persistencia
- metadata
- sincronización
- entidades
- procesamiento multimedia
