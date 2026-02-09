import fs from 'fs-extra';
import path from 'path';
import * as mm from 'music-metadata';
import { exec } from 'child_process';

export interface SongMetadata {
    title: string;
    artist: string;
    album: string;
    year?: number;
    trackNo: string;
    genre: string[];
    format: string;
    absPath: string; // Current or Destination path depending on context
    relPath?: string; // Relative to Library Root
}

export interface ScanResult {
    file: string; // Source absolute path
    metadata: SongMetadata;
    proposedPath: string; // Where it SHOULD go
    playlists: string[]; // Names of playlists this track belongs to (from folder tags)
}

export class OrganizerService {
  private static SUPPORTED_FORMATS = /\.(flac|mp3|m4a|wav|ogg)$/i;
  private static CONFIG = {
    PLAYLIST_HEADER: "#EXTM3U\n",
    DEFAULT_GENRE: "Otros",
  };

  /**
   * Scans the Inbox directory and returns a preview of what would happen.
   * Does NOT move files.
   */
  static async scanInbox(
    inboxPath: string,
    libraryPath: string,
  ): Promise<ScanResult[]> {
    if (!(await fs.pathExists(inboxPath))) {
      throw new Error(`Inbox path does not exist: ${inboxPath}`);
    }

    const results: ScanResult[] = [];
    const entries = await fs.readdir(inboxPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(inboxPath, entry.name);

      if (entry.isDirectory()) {
        const folderTags = this.extractTags(entry.name);
        const files = await this.getFilesRecursive(fullPath);

        for (const file of files) {
          const result = await this.analyzeFile(file, libraryPath, folderTags);
          if (result) results.push(result);
        }
      } else if (entry.isFile() && this.SUPPORTED_FORMATS.test(entry.name)) {
        const result = await this.analyzeFile(fullPath, libraryPath, []);
        if (result) results.push(result);
      }
    }

    return results;
  }

  /**
   * Executes the organization based on the scan results.
   */
  static async organize(
    results: ScanResult[],
    libraryPath: string,
  ): Promise<void> {
    await fs.ensureDir(libraryPath);
    const playlistDir = path.join(libraryPath, "Playlists");
    await fs.ensureDir(playlistDir);
    const dbPath = path.join(libraryPath, "library_db.json");

    // 1. Load existing inventory
    let inventory: SongMetadata[] = [];
    if (await fs.pathExists(dbPath)) {
      inventory = await fs.readJson(dbPath);
    }

    // 2. Process Moves and Update Inventory
    const customPlaylists = new Map<string, Set<string>>();

    for (const item of results) {
      // Move File
      const finalPath = await this.safeMove(item.file, item.proposedPath);

      // Update Metadata with final path
      const relPath = path
        .relative(libraryPath, finalPath)
        .split(path.sep)
        .join("/");
      const updatedSong: SongMetadata = {
        ...item.metadata,
        absPath: finalPath,
        relPath: relPath,
      };

      // Add to Inventory
      inventory.push(updatedSong);

      // Verify/Prepare Custom Playlists
      item.playlists.forEach((pl) => {
        if (!customPlaylists.has(pl)) customPlaylists.set(pl, new Set());
        // For playlists, we need relative path from Playlist Dir
        const relToPl = path
          .relative(playlistDir, finalPath)
          .split(path.sep)
          .join("/");
        customPlaylists.get(pl)!.add(relToPl);
      });
    }

    // 3. Save Inventory
    await fs.outputJson(dbPath, inventory, { spaces: 2 });

    // 4. Regenerate ALL Playlists
    await this.generateMasterPlaylist(inventory, libraryPath);
    await this.generateGenrePlaylists(inventory, libraryPath); // Assumes we rebuild from full inventory
    await this.appendCustomPlaylists(customPlaylists, playlistDir);
  }

  static async addToPlaylist(
    name: string,
    tracks: string[],
    libraryPath: string,
  ): Promise<void> {
    const playlistDir = path.join(libraryPath, "Playlists");
    await fs.ensureDir(playlistDir);
    const filePath = path.join(playlistDir, `${name.trim()}.m3u8`);

    let existingLines: string[] = [];
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf-8");
      existingLines = content
        .split("\n")
        .filter((l) => l && !l.startsWith("#"));
    }

    // tracks are absolute paths? or relative?
    // The UI likely sends absolute paths. We need relative to playlist dir.
    const newRelativePaths = tracks.map((trackPath) => {
      return path.relative(playlistDir, trackPath).split(path.sep).join("/");
    });

    const allTracks = new Set([...existingLines, ...newRelativePaths]);
    const content =
      this.CONFIG.PLAYLIST_HEADER + Array.from(allTracks).join("\n");
    await fs.outputFile(filePath, content);
  }

  static async removeFromPlaylist(
    name: string,
    trackPath: string,
    libraryPath: string,
  ): Promise<void> {
    if (name.includes("00_Master_Library")) {
      throw new Error("Cannot modify the Master Library playlist");
    }

    const playlistDir = path.join(libraryPath, "Playlists");
    const filePath = path.join(playlistDir, `${name}.m3u8`);

    console.log(`[OrganizerService] Removing ${trackPath} from ${name}`);

    // Handle .m3u fallback if needed, though we primarily write .m3u8
    if (!(await fs.pathExists(filePath))) {
      // Check for .m3u
      const legacyPath = path.join(playlistDir, `${name}.m3u`);
      if (await fs.pathExists(legacyPath)) {
        // Convert/Use legacy path? For now just throw or support.
        // Let's support deletion from legacy too if we find it.
        // But simpler to just error if main one missing for now or check both.
        throw new Error(`Playlist ${name} not found`);
      }
      throw new Error(`Playlist ${name} not found`);
    }

    const content = await fs.readFile(filePath, "utf-8");
    const lines = content
      .split("\n")
      .filter((l) => l.trim().length > 0 && !l.startsWith("#"));

    // Calculate relative path of the track to remove
    // Normalize:
    // 1. Get relative path
    // 2. Replace backslashes with forward slashes
    const relPathToRemove = path
      .relative(playlistDir, trackPath)
      .split(path.sep)
      .join("/");

    console.log(
      `[OrganizerService] Relative path to remove: ${relPathToRemove}`,
    );

    // Filter out the track
    // We compare normalized paths
    // We also try to match partials if strictly relative doesn't work?
    // No, strict relative should work if written correctly.
    // Let's also check if the line in file uses backslashes for some reason.

    const newLines = lines.filter((line) => {
      const cleanLine = line.trim().replace(/\\/g, "/"); // Force forward slashes for comparison
      const cleanTarget = relPathToRemove.replace(/\\/g, "/");

      if (cleanLine === cleanTarget) {
        console.log(`[OrganizerService] Matched and removed: ${line}`);
        return false;
      }
      return true;
    });

    if (newLines.length === lines.length) {
      console.warn(
        `[OrganizerService] No track matched for removal. Target: ${relPathToRemove}`,
      );
      // Log first few lines to debug
      console.log("Sample lines from file:", lines.slice(0, 3));
    }

    const newContent = this.CONFIG.PLAYLIST_HEADER + newLines.join("\n");
    await fs.outputFile(filePath, newContent);
  }

  static async deletePlaylist(
    name: string,
    libraryPath: string,
  ): Promise<void> {
    if (name.includes("00_Master_Library")) {
      throw new Error("Cannot delete the Master Library playlist");
    }

    const playlistDir = path.join(libraryPath, "Playlists");
    const filePath = path.join(playlistDir, `${name}.m3u8`);

    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    } else {
      const legacyPath = path.join(playlistDir, `${name}.m3u`);
      if (await fs.pathExists(legacyPath)) {
        await fs.remove(legacyPath);
      } else {
        throw new Error(`Playlist ${name} not found`);
      }
    }
  }

  static async listPlaylists(
    libraryPath: string,
  ): Promise<{ name: string; count: number; path: string }[]> {
    const playlistDir = path.join(libraryPath, "Playlists");
    if (!(await fs.pathExists(playlistDir))) return [];

    const files = await fs.readdir(playlistDir);
    const playlists = [];

    for (const file of files) {
      if (file.includes("00_Master_Library")) continue;

      if (file.endsWith(".m3u8") || file.endsWith(".m3u")) {
        const filePath = path.join(playlistDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const lineCount = content
          .split("\n")
          .filter((l) => l.trim().length > 0 && !l.startsWith("#")).length;

        playlists.push({
          name: path.parse(file).name,
          count: lineCount,
          path: filePath,
        });
      }
    }
    return playlists;
  }

  static async getPlaylistDetails(
    name: string,
    libraryPath: string,
  ): Promise<SongMetadata[]> {
    const playlistDir = path.join(libraryPath, "Playlists");
    const dbPath = path.join(libraryPath, "library_db.json");

    // Find existing file (check .m3u8 and .m3u)
    let filePath = path.join(playlistDir, `${name}.m3u8`);
    if (!(await fs.pathExists(filePath))) {
      filePath = path.join(playlistDir, `${name}.m3u`);
      if (!(await fs.pathExists(filePath))) {
        throw new Error(`Playlist ${name} not found`);
      }
    }

    // Load Inventory for Metadata Lookup
    let inventory: SongMetadata[] = [];
    if (await fs.pathExists(dbPath)) {
      inventory = await fs.readJson(dbPath);
    }

    // Create lookup map directly by absolute path for O(1) access
    // Normalize paths to handle potential OS differences or inconsistencies
    const inventoryMap = new Map<string, SongMetadata>();
    inventory.forEach((song) => {
      inventoryMap.set(path.resolve(song.absPath), song);
    });

    const content = await fs.readFile(filePath, "utf-8");
    const lines = content
      .split("\n")
      .filter((l) => l.trim().length > 0 && !l.startsWith("#"));

    const playlistTracks: SongMetadata[] = [];

    for (const line of lines) {
      // Lines are relative to playlistDir
      const absPath = path.resolve(playlistDir, line.trim());

      // Try to find metadata in inventory
      const metadata = inventoryMap.get(absPath);

      if (metadata) {
        playlistTracks.push(metadata);
      } else {
        // If not in inventory, construct basic metadata from file path
        playlistTracks.push({
          title: path.parse(absPath).name,
          artist: "Unknown",
          album: "Unknown",
          trackNo: "00",
          genre: [],
          format: path.extname(absPath),
          absPath: absPath,
        });
      }
    }

    return playlistTracks;
  }

  // --- Helpers ---

  private static extractTags(folderName: string): string[] {
    return (
      folderName.match(/\[(.*?)\]/g)?.map((t) => t.replace(/[\[\]]/g, "")) || [
        folderName,
      ]
    );
  }

  private static async getFilesRecursive(dir: string): Promise<string[]> {
    let results: string[] = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(await this.getFilesRecursive(fullPath));
      } else if (this.SUPPORTED_FORMATS.test(fullPath)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  private static async analyzeFile(
    sourcePath: string,
    libraryPath: string,
    tags: string[],
  ): Promise<ScanResult | null> {
    try {
      const metadata = await mm.parseFile(sourcePath);
      const common = metadata.common;

      const song: SongMetadata = {
        title: common.title || path.parse(sourcePath).name,
        artist: common.artist || "Unknown Artist",
        album: common.album || "Unknown Album",
        year: common.year,
        trackNo: common.track.no?.toString().padStart(2, "0") || "00",
        genre: common.genre || ["Otros"],
        format: path.extname(sourcePath).toLowerCase(),
        absPath: sourcePath,
      };

      const clean = (s: string) => s.replace(/[/\\?%*:|"<>]/g, "-").trim();
      const artistDir = clean(song.artist);
      const albumDir = song.year
        ? `(${song.year}) ${clean(song.album)}`
        : clean(song.album);
      const fileName = `${song.trackNo} - ${clean(song.title)}${song.format}`;

      const proposedPath = path.join(
        libraryPath,
        artistDir,
        albumDir,
        fileName,
      );

      return {
        file: sourcePath,
        metadata: song,
        proposedPath: proposedPath,
        playlists: tags,
      };
    } catch (err) {
      console.error(`Failed to parse ${sourcePath}`, err);
      return null;
    }
  }

  private static async safeMove(source: string, dest: string): Promise<string> {
    if (await fs.pathExists(dest)) {
      // If exists, don't overwrite, just return dest (assuming duplicate content)
      // Or maybe rename? User prompt logic implies we just skip/append.
      // Replicating script logic: "Si el archivo ya existe... devolvemos la ruta existente"
      return dest;
    }
    await fs.ensureDir(path.dirname(dest));
    await fs.move(source, dest);
    return dest;
  }

  private static async generateMasterPlaylist(
    inventory: SongMetadata[],
    libraryPath: string,
  ) {
    const playlistDir = path.join(libraryPath, "Playlists");
    await fs.ensureDir(playlistDir);

    // Relative paths from PLAYLIST_DIR, not Library Root
    // Library structure: /Music/Playlists/00.m3u
    // Music File: /Music/Artist/Album/Song.mp3
    // Relative: ../Artist/Album/Song.mp3

    const lines = inventory.map((song) => {
      return path.relative(playlistDir, song.absPath).split(path.sep).join("/");
    });

    const content = this.CONFIG.PLAYLIST_HEADER + lines.join("\n");
    await fs.outputFile(
      path.join(playlistDir, "00_Master_Library.m3u8"),
      content,
    );
  }

  private static async generateGenrePlaylists(
    inventory: SongMetadata[],
    libraryPath: string,
  ) {
    const playlistDir = path.join(libraryPath, "Playlists");
    const genreMap = new Map<string, string[]>();

    inventory.forEach((song) => {
      song.genre.forEach((g) => {
        const cleanG = g.trim();
        if (!genreMap.has(cleanG)) genreMap.set(cleanG, []);
        const rel = path
          .relative(playlistDir, song.absPath)
          .split(path.sep)
          .join("/");
        genreMap.get(cleanG)!.push(rel);
      });
    });

    for (const [genre, tracks] of genreMap) {
      const cleanGenre = genre.replace(/[/\\?%*:|"<>]/g, "-");
      const content = this.CONFIG.PLAYLIST_HEADER + tracks.join("\n");
      await fs.outputFile(
        path.join(playlistDir, `Genre_${cleanGenre}.m3u8`),
        content,
      );
    }
  }

  private static async appendCustomPlaylists(
    newPlaylists: Map<string, Set<string>>,
    playlistDir: string,
  ) {
    for (const [name, tracks] of newPlaylists) {
      const filePath = path.join(playlistDir, `${name.trim()}.m3u8`);

      let existingLines: string[] = [];
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, "utf-8");
        existingLines = content
          .split("\n")
          .filter((l) => l && !l.startsWith("#"));
      }

      // Merge existing and new, avoid dupes
      const allTracks = new Set([...existingLines, ...tracks]);
      const content =
        this.CONFIG.PLAYLIST_HEADER + Array.from(allTracks).join("\n");
      await fs.outputFile(filePath, content);
    }
  }

  private static async cleanupEmptyDirs(startDir: string) {
    if (!(await fs.pathExists(startDir))) return;

    // Read directory contents
    const files = await fs.readdir(startDir);

    if (files.length > 0) {
      // Recurse into subdirectories
      for (const file of files) {
        const fullPath = path.join(startDir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          await this.cleanupEmptyDirs(fullPath);
        }
      }
    }

    // Re-read after potential subdirectory deletion
    const remainingFiles = await fs.readdir(startDir);
    if (remainingFiles.length === 0) {
      await fs.rmdir(startDir);
    }
  }

  static async exportPlaylist(
    name: string,
    destination: string,
    mode: "copy" | "move",
    preserveStructure: boolean,
    libraryPath: string,
  ): Promise<{ SuccessCount: number; FailCount: number }> {
    if (name.includes("00_Master_Library")) {
      throw new Error("Cannot export/move the Master Library playlist");
    }

    const dbPath = path.join(libraryPath, "library_db.json");

    // 1. Get Tracks
    // We use getPlaylistDetails to ensure we have paths and metadata
    const tracks = await this.getPlaylistDetails(name, libraryPath);

    let successCount = 0;
    let failCount = 0;

    await fs.ensureDir(destination);

    const tracksToRemove: Set<string> = new Set();

    // 2. Process Files
    for (const track of tracks) {
      try {
        if (!(await fs.pathExists(track.absPath))) {
          console.warn(`File not found: ${track.absPath}`);
          failCount++;
          continue;
        }

        let destPath = "";
        if (preserveStructure && track.relPath) {
          // Use relative path structure (Artist/Album/Song.mp3)
          destPath = path.join(destination, track.relPath);
        } else {
          // Flat structure (Song.mp3)
          // Handling duplicates in flat structure?
          // If multiple songs have same name, we might overwrite or need unique naming.
          // For now, let's just use filename.
          destPath = path.join(destination, path.basename(track.absPath));
        }

        await fs.ensureDir(path.dirname(destPath));

        if (mode === "copy") {
          await fs.copy(track.absPath, destPath, { overwrite: false });
        } else {
          await fs.move(track.absPath, destPath, { overwrite: false });
          tracksToRemove.add(track.absPath);
        }

        successCount++;
      } catch (err) {
        console.error(`Failed to ${mode} ${track.absPath}`, err);
        failCount++;
      }
    }

    // 3. Cleanup logic for MOVE
    if (mode === "move" && tracksToRemove.size > 0) {
      // Remove from DB
      if (await fs.pathExists(dbPath)) {
        let inventory: SongMetadata[] = await fs.readJson(dbPath);
        const initialLen = inventory.length;

        // Filter out moved tracks
        inventory = inventory.filter(
          (song) => !tracksToRemove.has(song.absPath),
        );

        if (inventory.length !== initialLen) {
          await fs.outputJson(dbPath, inventory, { spaces: 2 });

          // Regenerate System Playlists to reflect changes
          await this.generateMasterPlaylist(inventory, libraryPath);
          await this.generateGenrePlaylists(inventory, libraryPath);

          // Note: Custom playlists might still reference these moved files.
          // Ideally we should scan all playlists and remove these entries to avoid "missing file" errors.
          // But for now, we just handle the current playlist deletion below.
        }
      }

      // DELETE the source playlist
      await this.deletePlaylist(name, libraryPath);

      // Clean up empty directories in the library if we moved files out
      // We can try to clean up from the "Artists" or root level,
      // but effectively we just need to sweep the library.
      // However, sweeping the WHOLE library might be expensive.
      // A targeted approach based on `tracksToRemove` might be better,
      // but `cleanupEmptyDirs` on the whole library is safer ensuring we catch everything.
      // Let's sweep the library path.
      await this.cleanupEmptyDirs(libraryPath);
    }

    return { SuccessCount: successCount, FailCount: failCount };
  }

  static async revealInFileExplorer(filePath: string): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    // macOS specific for now, as requested
    // 'open -R' reveals the file in Finder
    return new Promise((resolve, reject) => {
      exec(`open -R "${filePath}"`, (error) => {
        if (error) {
          console.error(`Failed to reveal file: ${error}`);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  static async getPlaylistsForTrack(
    trackPath: string,
    libraryPath: string,
  ): Promise<string[]> {
    const playlistDir = path.join(libraryPath, "Playlists");
    if (!(await fs.pathExists(playlistDir))) return [];

    const files = await fs.readdir(playlistDir);
    const playlistsContainingTrack: string[] = [];

    for (const file of files) {
      if (file.endsWith(".m3u8") || file.endsWith(".m3u")) {
        const playlistName = path.parse(file).name;

        if (
          playlistName.startsWith("00_Master") ||
          playlistName.startsWith("Genre_")
        ) {
          continue;
        }

        const filePath = path.join(playlistDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content
          .split("\n")
          .filter((l) => l.trim().length > 0 && !l.startsWith("#"));

        const relPathToCheck = path
          .relative(playlistDir, trackPath)
          .split(path.sep)
          .join("/");

        for (const line of lines) {
          const cleanLine = line.trim().replace(/\\/g, "/");
          const cleanTarget = relPathToCheck.replace(/\\/g, "/");

          if (cleanLine === cleanTarget) {
            playlistsContainingTrack.push(playlistName);
            break;
          }
        }
      }
    }

    return playlistsContainingTrack;
  }

  static async getAlbumCover(
    trackPath: string,
  ): Promise<{ data: Buffer; mimeType: string } | null> {
    try {
      if (!(await fs.pathExists(trackPath))) {
        return null;
      }

      const metadata = await mm.parseFile(trackPath);

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        return {
          data: Buffer.from(picture.data),
          mimeType: picture.format || "image/jpeg",
        };
      }

      return null;
    } catch (err) {
      console.error(`Failed to extract album cover from ${trackPath}`, err);
      return null;
    }
  }

  static async exportLibrary(
    destination: string,
    mode: "copy" | "move",
    preserveStructure: boolean,
    libraryPath: string,
  ): Promise<{ SuccessCount: number; FailCount: number }> {
    const dbPath = path.join(libraryPath, "library_db.json");

    if (!(await fs.pathExists(dbPath))) {
      throw new Error("Library database not found");
    }

    const inventory: SongMetadata[] = await fs.readJson(dbPath);

    let successCount = 0;
    let failCount = 0;

    await fs.ensureDir(destination);

    const tracksToRemove: Set<string> = new Set();

    for (const track of inventory) {
      try {
        if (!(await fs.pathExists(track.absPath))) {
          console.warn(`File not found: ${track.absPath}`);
          failCount++;
          continue;
        }

        let destPath = "";
        if (preserveStructure && track.relPath) {
          destPath = path.join(destination, track.relPath);
        } else {
          destPath = path.join(destination, path.basename(track.absPath));
        }

        await fs.ensureDir(path.dirname(destPath));

        if (mode === "copy") {
          await fs.copy(track.absPath, destPath, { overwrite: false });
        } else {
          await fs.move(track.absPath, destPath, { overwrite: false });
          tracksToRemove.add(track.absPath);
        }

        successCount++;
      } catch (err) {
        console.error(`Failed to ${mode} ${track.absPath}`, err);
        failCount++;
      }
    }

    if (mode === "move" && tracksToRemove.size > 0) {
      const updatedInventory = inventory.filter(
        (song) => !tracksToRemove.has(song.absPath),
      );

      await fs.outputJson(dbPath, updatedInventory, { spaces: 2 });

      await this.generateMasterPlaylist(updatedInventory, libraryPath);
      await this.generateGenrePlaylists(updatedInventory, libraryPath);

      const playlistDir = path.join(libraryPath, "Playlists");
      if (await fs.pathExists(playlistDir)) {
        const files = await fs.readdir(playlistDir);
        for (const file of files) {
          if (
            (file.endsWith(".m3u8") || file.endsWith(".m3u")) &&
            !file.startsWith("00_Master") &&
            !file.startsWith("Genre_")
          ) {
            const playlistPath = path.join(playlistDir, file);
            const content = await fs.readFile(playlistPath, "utf-8");
            const lines = content.split("\n");

            const updatedLines = lines.filter((line) => {
              if (line.startsWith("#") || line.trim().length === 0) return true;
              const absPath = path.join(playlistDir, line.trim());
              return !tracksToRemove.has(absPath);
            });

            await fs.writeFile(playlistPath, updatedLines.join("\n"));
          }
        }
      }
    }

    return { SuccessCount: successCount, FailCount: failCount };
  }
}
