import { Router } from 'express';
import { OrganizerService } from '../services/OrganizerService.js';
import type { ScanResult } from '../services/OrganizerService.js';
import fs from 'fs-extra';
import path from 'path';

const router = Router();

// Types for Requests
interface ScanRequest {
    inboxPath: string;
    libraryPath: string;
}

interface OrganizeRequest {
    results: ScanResult[];
    libraryPath: string;
}

// Routes

// 1. Scan Inbox
router.post('/scan', async (req, res): Promise<any> => {
    try {
        const { inboxPath, libraryPath } = req.body as ScanRequest;

        if (!inboxPath || !libraryPath) {
            return res.status(400).json({ error: 'Missing inboxPath or libraryPath' });
        }

        console.log(`Scanning Inbox: ${inboxPath}`);
        const results = await OrganizerService.scanInbox(inboxPath, libraryPath);
        res.json({ success: true, results });

    } catch (error: any) {
        console.error('Scan Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Organize (Execute Move)
router.post('/organize', async (req, res): Promise<any> => {
    try {
        const { results, libraryPath } = req.body as OrganizeRequest;

        if (!results || !Array.isArray(results) || !libraryPath) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        console.log(`Organizing ${results.length} files...`);
        await OrganizerService.organize(results, libraryPath);
        res.json({ success: true, message: 'Organization complete' });

    } catch (error: any) {
        console.error('Organize Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Library
router.get('/library', async (req, res): Promise<any> => {
    try {
        const { libraryPath } = req.query;
        if (typeof libraryPath !== 'string') {
            return res.status(400).json({ error: 'libraryPath query param required' });
        }

        const dbPath = path.join(libraryPath, 'library_db.json');
        if (!await fs.pathExists(dbPath)) {
            return res.json({ inventory: [] });
        }

        const inventory = await fs.readJson(dbPath);
        res.json({ inventory });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Create/Append Playlist
router.post('/playlists', async (req, res): Promise<any> => {
    try {
        const { libraryPath, name, tracks } = req.body;

        if (!libraryPath || !name || !tracks || !Array.isArray(tracks)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        console.log(`Adding ${tracks.length} tracks to playlist: ${name}`);
        await OrganizerService.addToPlaylist(name, tracks, libraryPath);

        res.json({ success: true });
    } catch (error: any) {
        console.error('Playlist Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. List Playlists
router.get('/playlists', async (req, res): Promise<any> => {
    try {
        const { libraryPath } = req.query;
        if (typeof libraryPath !== 'string') {
            return res.status(400).json({ error: 'libraryPath query param required' });
        }

        const playlists = await OrganizerService.listPlaylists(libraryPath);
        res.json({ playlists });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Get Playlist Details
router.get('/playlists/:name', async (req, res): Promise<any> => {
    try {
        const { libraryPath } = req.query;
        const { name } = req.params;

        if (typeof libraryPath !== 'string' || !name) {
            return res.status(400).json({ error: 'libraryPath and name required' });
        }

        const tracks = await OrganizerService.getPlaylistDetails(name, libraryPath);
        res.json({ tracks });

    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// 6.1 Remove Track from Playlist
router.delete('/playlists/:name/tracks', async (req, res): Promise<any> => {
    try {
        const { libraryPath, trackPath } = req.body;
        const { name } = req.params;

        if (!libraryPath || !name || !trackPath) {
            return res.status(400).json({ error: 'libraryPath, name and trackPath required' });
        }

        await OrganizerService.removeFromPlaylist(name, trackPath, libraryPath);
        res.json({ success: true });

    } catch (error: any) {
        console.error('Remove Track Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6.2 Delete Playlist
router.delete('/playlists/:name', async (req, res): Promise<any> => {
    try {
        const { libraryPath } = req.query; // Use query for DELETE usually, or body. 
        // Standard is often params+query for meta.
        const { name } = req.params;

        if (typeof libraryPath !== 'string' || !name) {
            return res.status(400).json({ error: 'libraryPath and name required' });
        }

        await OrganizerService.deletePlaylist(name, libraryPath);
        res.json({ success: true });

    } catch (error: any) {
        console.error('Delete Playlist Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6.3 Export/Move Playlist
router.post('/playlists/:name/export', async (req, res): Promise<any> => {
    try {
        const { libraryPath, destination, mode, preserveStructure } = req.body;
        const { name } = req.params;

        if (!libraryPath || !name || !destination || !mode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await OrganizerService.exportPlaylist(name, destination, mode, preserveStructure, libraryPath);
        res.json({ success: true, ...result });

    } catch (error: any) {
        console.error('Export Playlist Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Browse Directories
router.get('/browse', async (req, res): Promise<any> => {
    try {
        const queryPath = req.query.path as string || '/'; // Default to root

        // Security check (basic) - ensure we don't go outside legitimate bounds if needed
        // For local personal tool, we trust the user needs access to their system

        if (!await fs.pathExists(queryPath)) {
            return res.status(404).json({ error: 'Path not found' });
        }

        const entries = await fs.readdir(queryPath, { withFileTypes: true });

        const directories = entries
            .filter(e => e.isDirectory() && !e.name.startsWith('.')) // Hide hidden folders
            .map(e => ({
                name: e.name,
                path: path.join(queryPath, e.name),
                type: 'directory'
            }));

        res.json({
            currentPath: path.resolve(queryPath),
            parentPath: path.dirname(path.resolve(queryPath)),
            directories
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Save Configuration
router.post('/config', async (req, res): Promise<any> => {
    try {
        const { inboxPath, libraryPath } = req.body;

        if (!inboxPath || !libraryPath) {
            return res.status(400).json({ error: 'Both inboxPath and libraryPath are required' });
        }

        const configPath = path.resolve(process.cwd(), 'config.json');
        const config = {
            inboxPath,
            libraryPath,
            updatedAt: new Date().toISOString()
        };

        await fs.writeJson(configPath, config, { spaces: 2 });
        console.log('Configuration saved:', config);

        res.json({ success: true, message: 'Configuration saved successfully' });
    } catch (error: any) {
        console.error('Config Save Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 9. Get Configuration
router.get('/config', async (_req, res): Promise<any> => {
    try {
        const configPath = path.resolve(process.cwd(), 'config.json');

        if (!await fs.pathExists(configPath)) {
            return res.json({ config: null });
        }

        const config = await fs.readJson(configPath);
        res.json({ config });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reveal', async (req, res): Promise<any> => {
    try {
        const { path: filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        await OrganizerService.revealInFileExplorer(filePath);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error revealing file:', error);
        res.status(500).json({ error: error.message });
    }
});

// 10. Get Playlists for a Track
router.get('/tracks/playlists', async (req, res): Promise<any> => {
    try {
        const { trackPath, libraryPath } = req.query;
        
        if (typeof trackPath !== 'string' || typeof libraryPath !== 'string') {
            return res.status(400).json({ error: 'trackPath and libraryPath query params required' });
        }

        const playlists = await OrganizerService.getPlaylistsForTrack(trackPath, libraryPath);
        res.json({ playlists });
    } catch (error: any) {
        console.error('Error getting playlists for track:', error);
        res.status(500).json({ error: error.message });
    }
});

// 11. Get Album Cover for a Track
router.get('/tracks/cover', async (req, res): Promise<any> => {
    try {
        const { trackPath } = req.query;
        
        if (typeof trackPath !== 'string') {
            return res.status(400).json({ error: 'trackPath query param required' });
        }

        const cover = await OrganizerService.getAlbumCover(trackPath);
        
        if (!cover) {
            return res.status(404).json({ error: 'No album cover found' });
        }

        res.setHeader('Content-Type', cover.mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(cover.data);
    } catch (error: any) {
        console.error('Error getting album cover:', error);
        res.status(500).json({ error: error.message });
    }
});

// 12. Export/Move Entire Library
router.post('/library/export', async (req, res): Promise<any> => {
    try {
        const { libraryPath, destination, mode, preserveStructure } = req.body;

        if (!libraryPath || !destination || !mode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await OrganizerService.exportLibrary(destination, mode, preserveStructure, libraryPath);
        res.json({ success: true, ...result });

    } catch (error: any) {
        console.error('Export Library Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 13. Get Complete Track Metadata
router.get('/tracks/metadata', async (req, res): Promise<any> => {
    try {
        const { trackPath } = req.query;
        
        if (typeof trackPath !== 'string') {
            return res.status(400).json({ error: 'trackPath query param required' });
        }

        const metadata = await OrganizerService.getTrackMetadata(trackPath);
        
        if (!metadata) {
            return res.status(404).json({ error: 'Track not found or metadata unavailable' });
        }

        res.json({ metadata });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error getting track metadata:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

// 14. Regenerate Library Database
router.post('/library/regenerate', async (req, res): Promise<void> => {
    try {
        const { libraryPath } = req.body;

        if (!libraryPath) {
            res.status(400).json({ error: 'libraryPath is required' });
            return;
        }

        console.log(`Regenerating database for library: ${libraryPath}`);
        const result = await OrganizerService.regenerateDatabase(libraryPath);
        
        res.json({ 
            success: true, 
            message: 'Database regenerated successfully',
            ...result 
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Regenerate Database Error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

export default router;
