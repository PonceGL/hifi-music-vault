import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { ScanResult } from '../server/services/OrganizerService';

vi.mock('../server/services/OrganizerService');
vi.mock('fs-extra');

import router from '../server/routes/api';
import { OrganizerService } from '../server/services/OrganizerService';
import fs from 'fs-extra';

const app = express();
app.use(express.json());
app.use('/api', router);

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/scan', () => {
    it('should return 400 if inboxPath is missing', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing inboxPath or libraryPath' });
    });

    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({ inboxPath: '/inbox' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing inboxPath or libraryPath' });
    });

    it('should scan inbox successfully', async () => {
      const mockResults: ScanResult[] = [
        {
          file: '/inbox/song.mp3',
          metadata: {
            title: 'Test Song',
            artist: 'Test Artist',
            album: 'Test Album',
            trackNo: '01',
            genre: ['Rock'],
            format: '.mp3',
            absPath: '/inbox/song.mp3',
          },
          proposedPath: '/library/Test Artist/Test Album/01 - Test Song.mp3',
          playlists: [],
        },
      ];

      vi.mocked(OrganizerService.scanInbox).mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/scan')
        .send({ inboxPath: '/inbox', libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, results: mockResults });
      expect(OrganizerService.scanInbox).toHaveBeenCalledWith('/inbox', '/library');
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.scanInbox).mockRejectedValue(new Error('Scan failed'));

      const response = await request(app)
        .post('/api/scan')
        .send({ inboxPath: '/inbox', libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Scan failed' });
    });
  });

  describe('POST /api/organize', () => {
    it('should return 400 if results is missing', async () => {
      const response = await request(app)
        .post('/api/organize')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if results is not an array', async () => {
      const response = await request(app)
        .post('/api/organize')
        .send({ results: 'not-array', libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .post('/api/organize')
        .send({ results: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should organize files successfully', async () => {
      vi.mocked(OrganizerService.organize).mockResolvedValue(undefined);

      const mockResults: ScanResult[] = [];

      const response = await request(app)
        .post('/api/organize')
        .send({ results: mockResults, libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: 'Organization complete' });
      expect(OrganizerService.organize).toHaveBeenCalledWith(mockResults, '/library');
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.organize).mockRejectedValue(new Error('Organize failed'));

      const response = await request(app)
        .post('/api/organize')
        .send({ results: [], libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Organize failed' });
    });
  });

  describe('GET /api/library', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app).get('/api/library');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath query param required' });
    });

    it('should return empty inventory if database does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const response = await request(app)
        .get('/api/library')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ inventory: [] });
    });

    it('should return inventory successfully', async () => {
      const mockInventory = [
        {
          title: 'Song',
          artist: 'Artist',
          album: 'Album',
          trackNo: '01',
          genre: ['Rock'],
          format: '.mp3',
          absPath: '/library/Artist/Album/Song.mp3',
        },
      ];

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(mockInventory);

      const response = await request(app)
        .get('/api/library')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ inventory: mockInventory });
    });

    it('should return 500 on error', async () => {
      vi.mocked(fs.pathExists).mockRejectedValue(new Error('Read failed'));

      const response = await request(app)
        .get('/api/library')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Read failed' });
    });
  });

  describe('POST /api/playlists', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({ name: 'Favorites', tracks: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({ libraryPath: '/library', tracks: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if tracks is not an array', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({ libraryPath: '/library', name: 'Favorites', tracks: 'not-array' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should create playlist successfully', async () => {
      vi.mocked(OrganizerService.addToPlaylist).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/playlists')
        .send({ libraryPath: '/library', name: 'Favorites', tracks: ['/track.mp3'] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(OrganizerService.addToPlaylist).toHaveBeenCalledWith(
        'Favorites',
        ['/track.mp3'],
        '/library'
      );
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.addToPlaylist).mockRejectedValue(new Error('Playlist failed'));

      const response = await request(app)
        .post('/api/playlists')
        .send({ libraryPath: '/library', name: 'Favorites', tracks: [] });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Playlist failed' });
    });
  });

  describe('GET /api/playlists', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app).get('/api/playlists');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath query param required' });
    });

    it('should list playlists successfully', async () => {
      const mockPlaylists = [
        { name: 'Favorites', count: 10, path: '/playlists/Favorites.m3u8' },
      ];

      vi.mocked(OrganizerService.listPlaylists).mockResolvedValue(mockPlaylists);

      const response = await request(app)
        .get('/api/playlists')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ playlists: mockPlaylists });
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.listPlaylists).mockRejectedValue(new Error('List failed'));

      const response = await request(app)
        .get('/api/playlists')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'List failed' });
    });
  });

  describe('GET /api/playlists/:name', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app).get('/api/playlists/Favorites');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath and name required' });
    });

    it('should get playlist details successfully', async () => {
      const mockTracks = [
        {
          title: 'Song',
          artist: 'Artist',
          album: 'Album',
          trackNo: '01',
          genre: ['Rock'],
          format: '.mp3',
          absPath: '/track.mp3',
        },
      ];

      vi.mocked(OrganizerService.getPlaylistDetails).mockResolvedValue(mockTracks);

      const response = await request(app)
        .get('/api/playlists/Favorites')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ tracks: mockTracks });
    });

    it('should return 404 on error', async () => {
      vi.mocked(OrganizerService.getPlaylistDetails).mockRejectedValue(
        new Error('Playlist not found')
      );

      const response = await request(app)
        .get('/api/playlists/NonExistent')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Playlist not found' });
    });
  });

  describe('DELETE /api/playlists/:name/tracks', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .delete('/api/playlists/Favorites/tracks')
        .send({ trackPath: '/track.mp3' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath, name and trackPath required' });
    });

    it('should return 400 if trackPath is missing', async () => {
      const response = await request(app)
        .delete('/api/playlists/Favorites/tracks')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath, name and trackPath required' });
    });

    it('should remove track from playlist successfully', async () => {
      vi.mocked(OrganizerService.removeFromPlaylist).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/playlists/Favorites/tracks')
        .send({ libraryPath: '/library', trackPath: '/track.mp3' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(OrganizerService.removeFromPlaylist).toHaveBeenCalledWith(
        'Favorites',
        '/track.mp3',
        '/library'
      );
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.removeFromPlaylist).mockRejectedValue(
        new Error('Remove failed')
      );

      const response = await request(app)
        .delete('/api/playlists/Favorites/tracks')
        .send({ libraryPath: '/library', trackPath: '/track.mp3' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Remove failed' });
    });
  });

  describe('DELETE /api/playlists/:name', () => {
    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app).delete('/api/playlists/Favorites');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'libraryPath and name required' });
    });

    it('should delete playlist successfully', async () => {
      vi.mocked(OrganizerService.deletePlaylist).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/playlists/Favorites')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(OrganizerService.deletePlaylist).toHaveBeenCalledWith('Favorites', '/library');
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.deletePlaylist).mockRejectedValue(new Error('Delete failed'));

      const response = await request(app)
        .delete('/api/playlists/Favorites')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Delete failed' });
    });
  });

  describe('POST /api/playlists/:name/export', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/playlists/Favorites/export')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });

    it('should export playlist successfully', async () => {
      vi.mocked(OrganizerService.exportPlaylist).mockResolvedValue({
        SuccessCount: 5,
        FailCount: 0,
      });

      const response = await request(app)
        .post('/api/playlists/Favorites/export')
        .send({
          libraryPath: '/library',
          destination: '/export',
          mode: 'copy',
          preserveStructure: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, SuccessCount: 5, FailCount: 0 });
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.exportPlaylist).mockRejectedValue(new Error('Export failed'));

      const response = await request(app)
        .post('/api/playlists/Favorites/export')
        .send({
          libraryPath: '/library',
          destination: '/export',
          mode: 'copy',
          preserveStructure: false,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Export failed' });
    });
  });

  describe('GET /api/browse', () => {
    it('should return 404 if path does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const response = await request(app)
        .get('/api/browse')
        .query({ path: '/nonexistent' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Path not found' });
    });

    it('should browse directories successfully', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'folder1', isDirectory: () => true, isFile: () => false },
        { name: '.hidden', isDirectory: () => true, isFile: () => false },
        { name: 'file.txt', isDirectory: () => false, isFile: () => true },
      ] as never);

      const response = await request(app)
        .get('/api/browse')
        .query({ path: '/test' });

      expect(response.status).toBe(200);
      expect(response.body.directories).toHaveLength(1);
      expect(response.body.directories[0].name).toBe('folder1');
    });

    it('should use root path as default', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([] as never);

      const response = await request(app).get('/api/browse');

      expect(response.status).toBe(200);
      expect(fs.pathExists).toHaveBeenCalledWith('/');
    });

    it('should return 500 on error', async () => {
      vi.mocked(fs.pathExists).mockRejectedValue(new Error('Browse failed'));

      const response = await request(app)
        .get('/api/browse')
        .query({ path: '/test' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Browse failed' });
    });
  });

  describe('POST /api/config', () => {
    it('should return 400 if inboxPath is missing', async () => {
      const response = await request(app)
        .post('/api/config')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Both inboxPath and libraryPath are required' });
    });

    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .post('/api/config')
        .send({ inboxPath: '/inbox' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Both inboxPath and libraryPath are required' });
    });

    it('should save configuration successfully', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/config')
        .send({ inboxPath: '/inbox', libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: 'Configuration saved successfully' });
      expect(fs.writeJson).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      vi.mocked(fs.writeJson).mockRejectedValue(new Error('Write failed'));

      const response = await request(app)
        .post('/api/config')
        .send({ inboxPath: '/inbox', libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Write failed' });
    });
  });

  describe('GET /api/config', () => {
    it('should return null if config does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const response = await request(app).get('/api/config');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ config: null });
    });

    it('should return config successfully', async () => {
      const mockConfig = {
        inboxPath: '/inbox',
        libraryPath: '/library',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(mockConfig);

      const response = await request(app).get('/api/config');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ config: mockConfig });
    });

    it('should return 500 on error', async () => {
      vi.mocked(fs.pathExists).mockRejectedValue(new Error('Read failed'));

      const response = await request(app).get('/api/config');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Read failed' });
    });
  });

  describe('POST /api/reveal', () => {
    it('should return 400 if path is missing', async () => {
      const response = await request(app).post('/api/reveal').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Path is required' });
    });

    it('should reveal file successfully', async () => {
      vi.mocked(OrganizerService.revealInFileExplorer).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/reveal')
        .send({ path: '/file.mp3' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(OrganizerService.revealInFileExplorer).toHaveBeenCalledWith('/file.mp3');
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.revealInFileExplorer).mockRejectedValue(
        new Error('Reveal failed')
      );

      const response = await request(app)
        .post('/api/reveal')
        .send({ path: '/file.mp3' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Reveal failed' });
    });
  });

  describe('GET /api/tracks/playlists', () => {
    it('should return 400 if trackPath is missing', async () => {
      const response = await request(app)
        .get('/api/tracks/playlists')
        .query({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'trackPath and libraryPath query params required' });
    });

    it('should return 400 if libraryPath is missing', async () => {
      const response = await request(app)
        .get('/api/tracks/playlists')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'trackPath and libraryPath query params required' });
    });

    it('should get playlists for track successfully', async () => {
      vi.mocked(OrganizerService.getPlaylistsForTrack).mockResolvedValue(['Favorites', 'Workout']);

      const response = await request(app)
        .get('/api/tracks/playlists')
        .query({ trackPath: '/track.mp3', libraryPath: '/library' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ playlists: ['Favorites', 'Workout'] });
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.getPlaylistsForTrack).mockRejectedValue(
        new Error('Get playlists failed')
      );

      const response = await request(app)
        .get('/api/tracks/playlists')
        .query({ trackPath: '/track.mp3', libraryPath: '/library' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Get playlists failed' });
    });
  });

  describe('GET /api/tracks/cover', () => {
    it('should return 400 if trackPath is missing', async () => {
      const response = await request(app).get('/api/tracks/cover');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'trackPath query param required' });
    });

    it('should return 404 if no cover found', async () => {
      vi.mocked(OrganizerService.getAlbumCover).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tracks/cover')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No album cover found' });
    });

    it('should return album cover successfully', async () => {
      const mockCover = {
        data: Buffer.from('image-data'),
        mimeType: 'image/jpeg',
      };

      vi.mocked(OrganizerService.getAlbumCover).mockResolvedValue(mockCover);

      const response = await request(app)
        .get('/api/tracks/cover')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.getAlbumCover).mockRejectedValue(new Error('Cover failed'));

      const response = await request(app)
        .get('/api/tracks/cover')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Cover failed' });
    });
  });

  describe('POST /api/library/export', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/library/export')
        .send({ libraryPath: '/library' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });

    it('should export library successfully', async () => {
      vi.mocked(OrganizerService.exportLibrary).mockResolvedValue({
        SuccessCount: 100,
        FailCount: 0,
      });

      const response = await request(app)
        .post('/api/library/export')
        .send({
          libraryPath: '/library',
          destination: '/export',
          mode: 'copy',
          preserveStructure: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, SuccessCount: 100, FailCount: 0 });
    });

    it('should return 500 on error', async () => {
      vi.mocked(OrganizerService.exportLibrary).mockRejectedValue(new Error('Export failed'));

      const response = await request(app)
        .post('/api/library/export')
        .send({
          libraryPath: '/library',
          destination: '/export',
          mode: 'move',
          preserveStructure: false,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Export failed' });
    });
  });

  describe('GET /api/tracks/metadata', () => {
    it('should return 400 if trackPath is missing', async () => {
      const response = await request(app).get('/api/tracks/metadata');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'trackPath query param required' });
    });

    it('should return 404 if metadata not found', async () => {
      vi.mocked(OrganizerService.getTrackMetadata).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tracks/metadata')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Track not found or metadata unavailable' });
    });

    it('should return metadata successfully', async () => {
      const mockMetadata = {
        common: {
          title: 'Song',
          artist: 'Artist',
        },
        format: {
          duration: 180,
        },
      };

      vi.mocked(OrganizerService.getTrackMetadata).mockResolvedValue(mockMetadata as never);

      const response = await request(app)
        .get('/api/tracks/metadata')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ metadata: mockMetadata });
    });

    it('should return 500 on error with Error instance', async () => {
      vi.mocked(OrganizerService.getTrackMetadata).mockRejectedValue(new Error('Metadata failed'));

      const response = await request(app)
        .get('/api/tracks/metadata')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Metadata failed' });
    });

    it('should return 500 on error with non-Error instance', async () => {
      vi.mocked(OrganizerService.getTrackMetadata).mockRejectedValue('String error');

      const response = await request(app)
        .get('/api/tracks/metadata')
        .query({ trackPath: '/track.mp3' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Unknown error' });
    });
  });
});
