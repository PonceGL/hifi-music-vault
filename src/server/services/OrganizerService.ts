import fs from 'fs-extra';
import path from 'path';
import * as mm from 'music-metadata';

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
        DEFAULT_GENRE: 'Otros'
    };

    /**
     * Scans the Inbox directory and returns a preview of what would happen.
     * Does NOT move files.
     */
    static async scanInbox(inboxPath: string, libraryPath: string): Promise<ScanResult[]> {
        if (!await fs.pathExists(inboxPath)) {
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
    static async organize(results: ScanResult[], libraryPath: string): Promise<void> {
        await fs.ensureDir(libraryPath);
        const playlistDir = path.join(libraryPath, 'Playlists');
        await fs.ensureDir(playlistDir);
        const dbPath = path.join(libraryPath, 'library_db.json');

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
            const relPath = path.relative(libraryPath, finalPath).split(path.sep).join('/');
            const updatedSong: SongMetadata = {
                ...item.metadata,
                absPath: finalPath,
                relPath: relPath
            };

            // Add to Inventory
            inventory.push(updatedSong);

            // Verify/Prepare Custom Playlists
            item.playlists.forEach(pl => {
                if (!customPlaylists.has(pl)) customPlaylists.set(pl, new Set());
                // For playlists, we need relative path from Playlist Dir
                const relToPl = path.relative(playlistDir, finalPath).split(path.sep).join('/');
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

    static async addToPlaylist(name: string, tracks: string[], libraryPath: string): Promise<void> {
        const playlistDir = path.join(libraryPath, 'Playlists');
        await fs.ensureDir(playlistDir);
        const filePath = path.join(playlistDir, `${name.trim()}.m3u8`);

        let existingLines: string[] = [];
        if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            existingLines = content.split('\n').filter(l => l && !l.startsWith('#'));
        }

        // tracks are absolute paths? or relative? 
        // The UI likely sends absolute paths. We need relative to playlist dir.
        const newRelativePaths = tracks.map(trackPath => {
            return path.relative(playlistDir, trackPath).split(path.sep).join('/');
        });

        const allTracks = new Set([...existingLines, ...newRelativePaths]);
        const content = this.CONFIG.PLAYLIST_HEADER + Array.from(allTracks).join('\n');
        await fs.outputFile(filePath, content);
    }

    // --- Helpers ---

    private static extractTags(folderName: string): string[] {
        return folderName.match(/\[(.*?)\]/g)?.map(t => t.replace(/[\[\]]/g, '')) || [folderName];
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

    private static async analyzeFile(sourcePath: string, libraryPath: string, tags: string[]): Promise<ScanResult | null> {
        try {
            const metadata = await mm.parseFile(sourcePath);
            const common = metadata.common;

            const song: SongMetadata = {
                title: common.title || path.parse(sourcePath).name,
                artist: common.artist || 'Unknown Artist',
                album: common.album || 'Unknown Album',
                year: common.year,
                trackNo: common.track.no?.toString().padStart(2, '0') || '00',
                genre: common.genre || ['Otros'],
                format: path.extname(sourcePath).toLowerCase(),
                absPath: sourcePath
            };

            const clean = (s: string) => s.replace(/[/\\?%*:|"<>]/g, '-').trim();
            const artistDir = clean(song.artist);
            const albumDir = song.year ? `(${song.year}) ${clean(song.album)}` : clean(song.album);
            const fileName = `${song.trackNo} - ${clean(song.title)}${song.format}`;

            const proposedPath = path.join(libraryPath, artistDir, albumDir, fileName);

            return {
                file: sourcePath,
                metadata: song,
                proposedPath: proposedPath,
                playlists: tags
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

    private static async generateMasterPlaylist(inventory: SongMetadata[], libraryPath: string) {
        const playlistDir = path.join(libraryPath, 'Playlists');
        await fs.ensureDir(playlistDir);

        // Relative paths from PLAYLIST_DIR, not Library Root
        // Library structure: /Music/Playlists/00.m3u
        // Music File: /Music/Artist/Album/Song.mp3
        // Relative: ../Artist/Album/Song.mp3

        const lines = inventory.map(song => {
            return path.relative(playlistDir, song.absPath).split(path.sep).join('/');
        });

        const content = this.CONFIG.PLAYLIST_HEADER + lines.join('\n');
        await fs.outputFile(path.join(playlistDir, '00_Master_Library.m3u8'), content);
    }

    private static async generateGenrePlaylists(inventory: SongMetadata[], libraryPath: string) {
        const playlistDir = path.join(libraryPath, 'Playlists');
        const genreMap = new Map<string, string[]>();

        inventory.forEach(song => {
            song.genre.forEach(g => {
                const cleanG = g.trim();
                if (!genreMap.has(cleanG)) genreMap.set(cleanG, []);
                const rel = path.relative(playlistDir, song.absPath).split(path.sep).join('/');
                genreMap.get(cleanG)!.push(rel);
            });
        });

        for (const [genre, tracks] of genreMap) {
            const cleanGenre = genre.replace(/[/\\?%*:|"<>]/g, '-');
            const content = this.CONFIG.PLAYLIST_HEADER + tracks.join('\n');
            await fs.outputFile(path.join(playlistDir, `Genre_${cleanGenre}.m3u8`), content);
        }
    }

    private static async appendCustomPlaylists(newPlaylists: Map<string, Set<string>>, playlistDir: string) {
        for (const [name, tracks] of newPlaylists) {
            const filePath = path.join(playlistDir, `${name.trim()}.m3u8`);

            let existingLines: string[] = [];
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf-8');
                existingLines = content.split('\n').filter(l => l && !l.startsWith('#'));
            }

            // Merge existing and new, avoid dupes
            const allTracks = new Set([...existingLines, ...tracks]);
            const content = this.CONFIG.PLAYLIST_HEADER + Array.from(allTracks).join('\n');
            await fs.outputFile(filePath, content);
        }
    }
}
