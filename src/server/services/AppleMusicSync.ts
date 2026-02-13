import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import type { SongMetadata } from './OrganizerService';

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
    const dbPath = path.join(libraryPath, "library_db.json");
    
    if (!(await fs.pathExists(dbPath))) {
      throw new Error("No se encontró library_db.json");
    }

    const inventory: SongMetadata[] = await fs.readJson(dbPath);

    // 1. Filtramos solo canciones que deben estar en alguna playlist
    const tracksToSync = inventory.filter(song => song.playlists && song.playlists.length > 0);

    if (tracksToSync.length === 0) {
      console.log("No hay canciones con playlists asignadas para sincronizar.");
      return;
    }

    console.log(`Encontradas ${tracksToSync.length} canciones con asignación de playlists. Iniciando sincronización...`);

    // 2. Preparamos los datos para enviarlos al script JXA
    // Simplificamos los datos para no sobrecargar el script
    const payload = tracksToSync.map(s => ({
      title: s.title,
      artist: s.artist,
      album: s.album,
      playlists: s.playlists
    }));

    // 3. Ejecutamos el JXA
    try {
      await this.runJXAScript(payload);
      console.log("✅ Sincronización con Apple Music terminada.");
    } catch (error) {
      console.error("❌ Error durante la sincronización con Apple Music:", error);
    }
  }

  private static async runJXAScript(data: AppleMusicSyncPayload[]): Promise<void> {
    // Creamos un archivo temporal .js que contiene el script JXA y los datos
    // Esto es más seguro que pasar argumentos por línea de comandos
    const tempScriptPath = path.join(process.cwd(), 'temp_sync_script.js');

    const jxaCode = `
      // --- INICIO DEL SCRIPT JXA ---
      const app = Application('Music');
      const data = ${JSON.stringify(data)}; // Inyectamos los datos directamente aquí

      console.log("Iniciando procesamiento de " + data.length + " items en Apple Music...");

      data.forEach(item => {
        const trackName = item.title;
        const artistName = item.artist;
        
        // Iteramos por cada playlist que debe tener esta canción
        item.playlists.forEach(playlistName => {
            
            // A. Asegurar que la playlist existe
            let playlist;
            try {
                playlist = app.playlists[playlistName];
                playlist.name(); // Check si existe (lanzará error si no)
            } catch (e) {
                // Si no existe, la creamos
                console.log("Creando playlist nueva: " + playlistName);
                playlist = app.make({new: 'userPlaylist', withProperties: {name: playlistName}});
            }

            // B. Buscar la canción en la biblioteca principal
            // Usamos un filtro "whose" (cuyo). Es la forma de consultar la BD de Apple.
            // Nota: Buscamos coincidencia exacta de Artista y Título.
            const results = app.tracks.whose({name: trackName, artist: artistName});

            if (results.length > 0) {
                const track = results[0]; // Tomamos la primera coincidencia
                
                // C. Evitar duplicados: Verificar si ya está en la playlist destino
                const existingInPl = playlist.tracks.whose({name: trackName, artist: artistName});
                
                if (existingInPl.length === 0) {
                    // Si no está, la duplicamos (así se llama la acción de agregar a lista)
                    app.duplicate(track, {to: playlist});
                    console.log("Agregada: " + trackName + " -> " + playlistName);
                } else {
                    // Ya existe, no hacemos nada
                    // console.log("Omitida (Ya existe): " + trackName + " en " + playlistName);
                }
            } else {
                console.log("⚠️ No encontrada en Apple Music: " + trackName + " - " + artistName);
            }
        });
      });
      // --- FIN DEL SCRIPT ---
    `;

    await fs.writeFile(tempScriptPath, jxaCode);

    return new Promise((resolve, reject) => {
      // Ejecutamos osascript con el flag -l JavaScript
      exec(`osascript -l JavaScript "${tempScriptPath}"`, (error, stdout, stderr) => {
        // Borramos el archivo temporal siempre
        fs.unlink(tempScriptPath).catch(() => {});

        if (error) {
          reject(stderr || error.message);
        } else {
          if (stdout) console.log(`[AppleMusic Log]: ${stdout}`);
          resolve();
        }
      });
    });
  }
}