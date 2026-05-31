# Arquitectura Local-First para una Aplicación Musical

## Introducción

Este documento recopila conceptos, decisiones arquitectónicas y consideraciones técnicas relacionadas con el diseño de una aplicación musical:

- local-first
- offline-first
- basada en archivos locales
- utilizando IndexedDB
- preparada para futura sincronización
- preparada para compartir metadata y archivos entre usuarios

La intención es construir una base sólida desde las primeras fases del proyecto para evitar migraciones dolorosas en el futuro.

---

# 1. Filosofía general del proyecto

La idea central es:

- la música pertenece al usuario
- los archivos viven localmente
- la aplicación es una capa inteligente encima del filesystem
- la metadata y organización tienen muchísimo valor
- el sistema debe funcionar completamente offline
- la sincronización y compartición son capacidades futuras, no dependencias iniciales

---

# 2. Consideraciones evolutivas de la arquitectura de datos

La arquitectura de datos debe diseñarse pensando en que el proyecto puede evolucionar de múltiples maneras con el tiempo.

Importante:

Estas NO son fases rígidas ni necesariamente secuenciales.

La intención es evitar una arquitectura que limite:

- sincronización futura
- múltiples dispositivos
- almacenamiento híbrido
- replicación
- compartición de datos
- trabajo offline
- evolución del modelo de datos

Este documento se enfoca específicamente en:

- persistencia local
- IndexedDB
- arquitectura offline-first
- sincronización futura
- separación entre archivos y metadata
- diseño del modelo de datos

NO en funcionalidades concretas de una aplicación específica.

---

## Arquitectura local-first

El punto de partida recomendado es:

```text
Filesystem local
        ↓
IndexedDB local
        ↓
Aplicación
```

La aplicación:

- utiliza archivos locales
- indexa información
- construye relaciones
- genera estructuras optimizadas
- funciona completamente offline

---

## Arquitectura multiinstancia independiente

Cada instalación de la aplicación:

- mantiene su propia base de datos
- mantiene sus propios archivos
- mantiene sus propios índices
- mantiene sus propias configuraciones

Sin necesidad inmediata de:

- backend
- autenticación
- sincronización remota
- infraestructura cloud

---

## Preparación para sincronización futura

Aunque inicialmente no exista sincronización remota, el modelo de datos debe prepararse desde el inicio para:

- sincronización entre dispositivos
- replicación parcial
- backup remoto
- sincronización incremental
- merge de cambios
- resolución de conflictos

---

## Preparación para almacenamiento híbrido

La arquitectura debe asumir que:

- algunos datos vivirán localmente
- algunos datos podrían replicarse remotamente
- algunos datos podrían reconstruirse
- algunos datos podrían sincronizarse parcialmente

---

## Separación entre archivos y base de datos

La arquitectura debe separar claramente:

### Archivos reales

Ejemplos:

- audio
- imágenes
- documentos
- markdown
- PDFs
- videos

---

### Datos estructurados

Ejemplos:

- índices
- metadata
- relaciones
- favoritos
- tags
- historial
- configuraciones
- embeddings
- análisis derivados

---

## Persistencia desacoplada

La base de datos NO debe depender completamente de:

- nombres de archivos
- rutas absolutas
- ubicación física exacta

Porque:

- los archivos pueden moverse
- los usuarios pueden renombrarlos
- las carpetas pueden cambiar
- distintos dispositivos pueden tener rutas distintas

---

## IDs estables

Cada entidad debería poseer:

```json
{
  "id": "uuid_estable"
}
```

Y opcionalmente:

```json
{
  "fingerprint": "hash_del_contenido"
}
```

Esto facilita:

- sincronización
- deduplicación
- merge
- compartición
- referencias estables
- replicación

---

## Diseño orientado a reconstrucción

La arquitectura debe asumir que:

```text
la base de datos puede desaparecer
```

Por lo tanto:

- índices deben poder reconstruirse
- relaciones derivadas deben regenerarse
- metadata derivable debe recalcularse
- el sistema debe poder reescanear archivos

---

## IndexedDB como capa persistente local

IndexedDB debe entenderse como:

```text
capa persistente local optimizada
```

NO como:

```text
almacenamiento permanente garantizado
```

---

## Filosofía offline-first

En una arquitectura offline-first:

La UI depende de la base de datos local.

NO del servidor.

Arquitectura conceptual:

```text
UI
 ↓
IndexedDB local
 ↓
Sync opcional en background
 ↓
Servidor remoto
```

---

## Sincronización opcional

El servidor remoto debe entenderse como:

- complemento
- puente
- sistema de replicación
- mecanismo de backup
- facilitador de sincronización

NO necesariamente como:

```text
fuente absoluta de verdad
```

---

## Datos sincronizables vs derivables

Es importante distinguir:

### Datos críticos

Ejemplos:

- notas del usuario
- playlists
- configuraciones
- tags manuales

Estos normalmente sí deberían sincronizarse.

---

### Datos derivables

Ejemplos:

- índices
- cachés
- thumbnails
- análisis regenerables
- relaciones calculadas

Estos pueden reconstruirse localmente.

---

## Change Tracking

La arquitectura debe contemplar:

- registrar cambios
- registrar timestamps
- registrar operaciones
- registrar versiones

Esto facilita:

- sincronización incremental
- merges
- rollback
- replicación

---

## Mutation Queue / Operation Log

En lugar de depender únicamente del estado final:

```text
+ create
+ update
+ delete
```

Esto facilita:

- reintentos
- sincronización robusta
- resolución de conflictos
- procesamiento distribuido

---

## Optimistic UI

La UI debería actualizarse inmediatamente:

```text
guardar localmente
 ↓
actualizar interfaz
 ↓
sincronizar después
```

---

## Resolución de conflictos

La arquitectura debería prepararse para posibles conflictos futuros.

Ejemplos:

- Last Write Wins
- merge inteligente
- field-level merge
- CRDTs

Aunque inicialmente no se implementen.

---

## Sync incremental

Nunca debería sincronizarse toda la base de datos completa innecesariamente.

La sincronización idealmente debe operar mediante:

```text
solo cambios desde último sync
```

---

## Modelo orientado a entidades

La arquitectura debe definirse alrededor de:

- entidades
- relaciones
- IDs estables
- persistencia
- sincronización

NO alrededor de:

- pantallas
- componentes UI
- navegación

---

# 3. ¿Por qué IndexedDB?

IndexedDB es la base de datos persistente integrada en navegadores modernos.

Ventajas:

- funciona offline
- almacenamiento persistente
- soporta índices
- soporta queries
- permite estructuras complejas
- puede almacenar grandes volúmenes de datos
- soporta blobs y archivos
- ampliamente soportada por navegadores modernos

---

# 4. Compatibilidad de IndexedDB

IndexedDB funciona en:

- Chrome
- Firefox
- Edge
- Safari
- Android
- iPhone
- iPad
- macOS
- Windows
- Linux

Safari históricamente tuvo algunas limitaciones y comportamientos agresivos de limpieza de storage, pero actualmente el soporte es suficientemente maduro para aplicaciones reales.

---

# 5. Qué NO es IndexedDB

IndexedDB NO es:

- una base de datos global del sistema operativo
- un archivo fácilmente manipulable por el usuario
- almacenamiento garantizado permanentemente

IndexedDB:

- pertenece al navegador
- pertenece al dominio/origin
- pertenece al perfil del navegador

Ejemplo:

```text
https://miapp.com
```

Tendrá bases de datos distintas en:

- Chrome
- Firefox
- Safari
- distintos perfiles del navegador

---

# 6. Persistencia y limitaciones

IndexedDB es persistente, pero no permanente garantizada.

Puede perderse si:

- el usuario borra datos del navegador
- el usuario limpia site data
- se desinstala el navegador
- el navegador decide limpiar storage bajo ciertas condiciones

Por ello:

La arquitectura debe asumir que la base de datos:

```text
normalmente existe
```

pero también:

```text
puede desaparecer
```

---

# 7. Modelo mental correcto

IndexedDB debe entenderse como:

```text
capa inteligente persistente local
```

NO como:

```text
fuente absoluta e irremplazable de verdad
```

La aplicación debe ser capaz de:

- reconstruir índices
- reescanear archivos
- regenerar metadata derivable
- restaurar estados base

---

# 8. Arquitectura recomendada

## Modelo híbrido

### Los archivos reales viven en filesystem

```text
Music/song.mp3
```

---

### IndexedDB guarda:

- metadata
- índices
- playlists
- favoritos
- recomendaciones
- relaciones
- embeddings
- análisis acústico
- historial
- configuraciones

---

# 9. Separación de responsabilidades

Es crítico separar:

---

## 1. Archivos reales

```text
song.mp3
```

---

## 2. Metadata derivada

Ejemplo:

```json
{
  "bpm": 171,
  "energy": 0.82,
  "valence": 0.65
}
```

---

## 3. Metadata social/humana

Ejemplo:

```json
{
  "rating": 5,
  "tags": ["night", "driving"],
  "notes": "good transition"
}
```

---

## 4. Relaciones

Ejemplo:

```json
{
  "similarSongs": []
}
```

---

# 10. Importancia de IDs estables

Uno de los puntos más importantes.

NO debe dependerse de:

```text
song-final-v2.mp3
```

Porque:

- nombres cambian
- rutas cambian
- usuarios renombran archivos

---

## Solución recomendada

Cada canción debe tener:

```json
{
  "id": "uuid",
  "fingerprint": "audio_hash",
  "path": "..."
}
```

---

# 11. Audio fingerprinting

El fingerprint permite identificar una canción independientemente de:

- nombre
- metadata
- carpeta
- dispositivo

Esto será fundamental para:

- compartir metadata
- sincronizar
- deduplicar
- compartir archivos
- relacionar bibliotecas distintas

---

# 12. Preparación para sincronización futura

Aunque inicialmente no exista backend, el modelo de datos debe prepararse para ello.

---

# 13. Filosofía offline-first

En un sistema offline-first:

La UI depende de la base de datos local.

NO del servidor.

Arquitectura:

```text
UI
 ↓
IndexedDB local
 ↓
Sync en background
 ↓
Servidor remoto
```

---

# 14. Beneficios del modelo local-first

- respuesta instantánea
- funciona offline
- menor latencia
- mejor experiencia de usuario
- mayor privacidad
- independencia de servidores

---

# 15. Qué debe sincronizarse

En el futuro podrían sincronizarse:

- playlists
- ratings
- tags
- metadata
- análisis acústico
- relaciones
- historial
- recomendaciones

No necesariamente:

- archivos completos
- audio original

---

# 16. Metadata compartible

Un concepto importante:

La metadata tiene muchísimo valor.

Ejemplo:

- BPM calculado
- géneros refinados
- mood tags
- recomendaciones
- relaciones entre canciones
- playlists curadas

Ese trabajo humano puede reutilizarse entre usuarios.

---

# 17. Compartición de metadata sin compartir audio

Ejemplo:

```json
{
  "fingerprint": "...",
  "bpm": 171,
  "energy": 0.82,
  "mood": ["night"],
  "genre": ["synthpop"]
}
```

Esto permite compartir inteligencia musical sin necesariamente transferir archivos protegidos.

---

# 18. Posible arquitectura P2P futura

La idea conceptual:

```text
Usuario A
   ↓
Servidor intermediario ligero
   ↓
Usuario B
```

El servidor:

- facilita descubrimiento
- conecta peers
- transmite metadata
- coordina intercambio

Pero idealmente:

- no almacena permanentemente archivos musicales
- no mantiene copias completas de bibliotecas

---

# 19. Técnicas de sincronización

En sistemas offline-first normalmente se utiliza:

---

## Change Tracking

Registrar:

- qué cambió
- cuándo cambió
- quién cambió
- qué operación ocurrió

---

## Mutation Queue / Operation Log

En lugar de guardar únicamente estado final:

```text
+ add song
- remove song
+ update metadata
```

Esto facilita:

- reintentos
- sincronización incremental
- merges
- rollback

---

# 20. Optimistic UI

La UI actualiza inmediatamente:

```text
Guardar localmente
 ↓
Actualizar UI
 ↓
Sincronizar después
```

Esto mejora muchísimo la experiencia de usuario.

---

# 21. Resolución de conflictos

Cuando:

- local cambia
- remoto cambia

aparecen conflictos.

Estrategias comunes:

- Last Write Wins
- merge inteligente
- field-level merge
- CRDTs (avanzado)

---

# 22. UUIDs y sincronización

Los UUIDs son fundamentales para:

- identificar entidades globalmente
- evitar duplicados
- sincronizar correctamente
- relacionar datos distribuidos

---

# 23. Sync incremental

No debe enviarse toda la DB.

Debe enviarse:

```text
solo cambios desde último sync
```

Ejemplo:

```text
lastSyncAt
```

---

# 24. Entidades recomendadas

Desde el inicio la arquitectura debería pensar en entidades.

Ejemplos:

```text
Song
Artist
Album
Playlist
Tag
FeatureVector
UserMetadata
Fingerprint
Recommendation
```

---

# 25. Separar modelo de datos de UI

La UI NO debe definir la arquitectura.

La arquitectura debe definirse alrededor de:

- entidades
- relaciones
- metadata
- sincronización
- persistencia

La interfaz es únicamente una representación visual de esos datos.

---

# 26. Filosofía general de la arquitectura

La dirección arquitectónica general del proyecto es:

- local-first
- metadata-rich
- offline-capable
- sync-ready
- P2P-friendly
- user-owned library
- filesystem-based
- cloud-optional

---

# Conclusión

La combinación de:

- archivos locales
- IndexedDB
- metadata rica
- IDs estables
- separación clara de responsabilidades
- sincronización incremental
- arquitectura offline-first

permite construir una plataforma musical moderna extremadamente flexible.

La clave más importante es:

Diseñar desde el inicio pensando en:

- persistencia local
- reconstrucción
- sincronización futura
- compartición distribuida
- independencia del servidor

Aunque muchas de esas capacidades se implementen mucho tiempo después.
