import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import type { SongMetadata } from './OrganizerService';
import {
  FILE_CONSTANTS,
  APPLE_MUSIC_CONSTANTS,
  ERROR_MESSAGES,
  LOG_MESSAGES,
} from "../constants";

/**
 * Payload simplificado para enviar al script JXA de Apple Music
 * Solo incluye los campos necesarios para identificar y organizar canciones
 */
interface AppleMusicSyncPayload {
  title: string;
  artist: string;
  album: string;
  playlists: string[];
}

export class AppleMusicSync {

  /**
   * Sincroniza las playlists definidas en library_db.json con la App Música.
   * NO importa archivos, solo organiza lo que YA existe en Música.
   */
  static async syncPlaylists(libraryPath: string) {
    const dbPath = path.join(libraryPath, FILE_CONSTANTS.LIBRARY_DB_FILE);

    if (!(await fs.pathExists(dbPath))) {
      throw new Error(ERROR_MESSAGES.LIBRARY_DB_NOT_FOUND);
    }

    const inventory: SongMetadata[] = await fs.readJson(dbPath);

    // 1. Filtramos solo canciones que deben estar en alguna playlist
    const tracksToSync = inventory.filter((song) => song.playlists && song.playlists.length > 0);

    if (tracksToSync.length === 0) {
      console.log(LOG_MESSAGES.NO_PLAYLISTS_TO_SYNC);
      return;
    }

    console.log(LOG_MESSAGES.SYNC_STARTED(tracksToSync.length));

    // 2. Preparamos los datos para enviarlos al script JXA
    // Simplificamos los datos para no sobrecargar el script
    const payload = tracksToSync.map((s) => ({
      title: s.title,
      artist: s.artist,
      album: s.album,
      playlists: s.playlists,
    }));

    // 3. Ejecutamos el JXA
    try {
      await this.runJXAScript(payload);
      console.log(LOG_MESSAGES.SYNC_COMPLETED);
    } catch (error) {
      console.error(LOG_MESSAGES.SYNC_ERROR, error);
    }
  }

  private static async runJXAScript(data: AppleMusicSyncPayload[]): Promise<void> {
    // Creamos un archivo temporal .js que contiene el script JXA y los datos
    // Esto es más seguro que pasar argumentos por línea de comandos
    const tempScriptPath = path.join(
      process.cwd(),
      FILE_CONSTANTS.TEMP_SYNC_SCRIPT,
    );

    const jxaCode = `
      // --- INICIO JXA ---
      const app = Application('${APPLE_MUSIC_CONSTANTS.APP_NAME}');
      app.includeStandardAdditions = true;

      const inputData = ${JSON.stringify(data)};
      let logs = []; // Buffer para guardar logs y devolverlos al final

      function log(msg) {
        logs.push(msg);
      }

      try {
        log("Iniciando JXA con " + inputData.length + " canciones.");

        inputData.forEach(function(item) {
            const targetTitle = item.title;
            const targetArtist = item.artist; // Ej: "Anuel AA"
            
            // 1. Obtener o crear Playlists
            item.playlists.forEach(function(playlistName) {
                let playlist;
                try {
                    playlist = app.playlists[playlistName];
                    playlist.id(); 
                } catch (e) {
                    log("Creando playlist: " + playlistName);
                    app.make({new: 'userPlaylist', withProperties: {name: playlistName}});
                    playlist = app.playlists[playlistName];
                }

                // 2. ESTRATEGIA DE BÚSQUEDA DIFUSA
                // Buscamos SOLO por nombre primero (es más rápido y seguro)
                // app.tracks busca en toda la biblioteca
                const candidates = app.tracks.whose({name: targetTitle})();

                let foundTrack = null;

                if (candidates.length > 0) {
                    // Si hay coincidencias de título, verificamos el artista manualmente
                    for (var i = 0; i < candidates.length; i++) {
                        const track = candidates[i];
                        const dbArtist = track.artist(); // El artista según Apple Music (Ej: "Anuel AA; Bad Bunny")
                        
                        // Verificamos si el artista de Apple CONTIENE nuestro artista buscado
                        // O si nuestro artista buscado CONTIENE el de Apple
                        // Convertimos a minúsculas para ignorar mayúsculas
                        if (dbArtist.toLowerCase().includes(targetArtist.toLowerCase()) || 
                            targetArtist.toLowerCase().includes(dbArtist.toLowerCase())) {
                            foundTrack = track;
                            break; // Encontramos el correcto
                        }
                    }
                }

                if (foundTrack) {
                    // 3. Verificar duplicados en la playlist
                    const existing = playlist.tracks.whose({name: targetTitle})();
                    // Check simple por nombre en la playlist para no duplicar
                    if (existing.length === 0) {
                        try {
                            app.duplicate(foundTrack, {to: playlist});
                            log("✅ Agregada: [" + targetTitle + "] a [" + playlistName + "]");
                        } catch(dupErr) {
                            log("❌ Error al duplicar: " + dupErr.message);
                        }
                    } else {
                        // log("⏭️ Ya existe en playlist: " + targetTitle);
                    }
                } else {
                    log("⚠️ No encontrada: " + targetTitle + " (Artista buscado: " + targetArtist + ")");
                    // log("Debug: Candidatos encontrados por titulo: " + candidates.length);
                }
            });
        });

      } catch (globalErr) {
        log("❌ CRITICAL JXA ERROR: " + globalErr.message);
      }

      // Imprimir todos los logs de golpe al final para que Node los capture
      logs.join("\\n");
      // --- FIN JXA ---
    `;

    await fs.writeFile(tempScriptPath, jxaCode);

    return new Promise((resolve, reject) => {
      exec(
        `osascript -l ${APPLE_MUSIC_CONSTANTS.OSASCRIPT_LANGUAGE} "${tempScriptPath}"`,
        (error, stdout, stderr) => {
          fs.unlink(tempScriptPath).catch(() => {});

          if (error) {
            console.error(
              `${LOG_MESSAGES.APPLE_MUSIC_LOG_PREFIX} Error crítico:`,
              stderr || error.message,
            );
            reject(stderr || error.message);
          } else {
            // Aquí imprimimos los logs que devolvió el JXA
            if (stdout) {
              console.log(`${LOG_MESSAGES.APPLE_MUSIC_LOG_PREFIX}\n${stdout}`);
            } else {
              console.log(
                `${LOG_MESSAGES.APPLE_MUSIC_LOG_PREFIX} El script corrió pero no devolvió logs.`,
              );
            }
            resolve();
          }
        },
      );
    });
  }
}