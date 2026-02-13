import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ScanResult, SongMetadata } from '../server/services/OrganizerService';

vi.mock('fs-extra');
vi.mock('music-metadata');

import { OrganizerService } from '../server/services/OrganizerService';
import fs from 'fs-extra';
import * as mm from 'music-metadata';

describe('OrganizerService', () => {
  const mockInboxPath = '/mock/inbox';
  const mockLibraryPath = '/mock/library';
  const mockPlaylistDir = '/mock/library/Playlists';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scanInbox', () => {
    it('should throw error if inbox path does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        OrganizerService.scanInbox(mockInboxPath, mockLibraryPath)
      ).rejects.toThrow(`Inbox path does not exist: ${mockInboxPath}`);
    });

    it('should scan files directly in inbox', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'song.flac', isDirectory: () => false, isFile: () => true },
      ] as never);

      const mockMetadata = {
        common: {
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          year: 2023,
          track: { no: 1 },
          genre: ['Rock'],
        },
      };

      vi.mocked(mm.parseFile).mockResolvedValue(mockMetadata as never);

      const results = await OrganizerService.scanInbox(mockInboxPath, mockLibraryPath);

      expect(results).toHaveLength(1);
      expect(results[0].metadata.title).toBe('Test Song');
      expect(results[0].metadata.artist).toBe('Test Artist');
      expect(results[0].playlists).toEqual([]);
    });

    it('should scan folders with tags and extract playlists', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: '[Favorites][Workout]', isDirectory: () => true, isFile: () => false },
      ] as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce(['song.mp3'] as never);
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false } as never);

      const mockMetadata = {
        common: {
          title: 'Workout Song',
          artist: 'Fitness Artist',
          album: 'Gym Album',
          track: { no: 2 },
          genre: ['Electronic'],
        },
      };

      vi.mocked(mm.parseFile).mockResolvedValue(mockMetadata as never);

      const results = await OrganizerService.scanInbox(mockInboxPath, mockLibraryPath);

      expect(results).toHaveLength(1);
      expect(results[0].playlists).toEqual(['Favorites', 'Workout']);
    });

    it('should handle files without metadata gracefully', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'corrupted.mp3', isDirectory: () => false, isFile: () => true },
      ] as never);

      vi.mocked(mm.parseFile).mockRejectedValue(new Error('Parse error'));

      const results = await OrganizerService.scanInbox(mockInboxPath, mockLibraryPath);

      expect(results).toHaveLength(0);
    });

    it('should use default values for missing metadata fields', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'minimal.wav', isDirectory: () => false, isFile: () => true },
      ] as never);

      const mockMetadata = {
        common: {
          track: {},
        },
      };

      vi.mocked(mm.parseFile).mockResolvedValue(mockMetadata as never);

      const results = await OrganizerService.scanInbox(mockInboxPath, mockLibraryPath);

      expect(results).toHaveLength(1);
      expect(results[0].metadata.title).toBe('minimal');
      expect(results[0].metadata.artist).toBe('Unknown Artist');
      expect(results[0].metadata.album).toBe('Unknown Album');
      expect(results[0].metadata.trackNo).toBe('00');
      expect(results[0].metadata.genre).toEqual(['Otros']);
    });

    it('should skip unsupported file formats', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'document.pdf', isDirectory: () => false, isFile: () => true },
      ] as never);

      const results = await OrganizerService.scanInbox(mockInboxPath, mockLibraryPath);

      expect(results).toHaveLength(0);
      expect(mm.parseFile).not.toHaveBeenCalled();
    });
  });

  describe('organize', () => {
    it('should create library and playlist directories', async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      vi.mocked(fs.outputJson).mockResolvedValue(undefined);
      vi.mocked(fs.outputFile).mockResolvedValue(undefined);

      const mockResults: ScanResult[] = [];

      await OrganizerService.organize(mockResults, mockLibraryPath);

      expect(fs.ensureDir).toHaveBeenCalledWith(mockLibraryPath);
      expect(fs.ensureDir).toHaveBeenCalledWith(mockPlaylistDir);
    });

    it('should move files and update inventory', async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.pathExists).mockResolvedValueOnce(false).mockResolvedValueOnce(false);
      vi.mocked(fs.move).mockResolvedValue(undefined);
      vi.mocked(fs.outputJson).mockResolvedValue(undefined);
      vi.mocked(fs.outputFile).mockResolvedValue(undefined);

      const mockResults: ScanResult[] = [
        {
          file: '/inbox/song.mp3',
          metadata: {
            title: 'New Song',
            artist: 'New Artist',
            album: 'New Album',
            trackNo: '01',
            genre: ['Pop'],
            format: '.mp3',
            absPath: '/inbox/song.mp3',
          },
          proposedPath: '/library/New Artist/New Album/01 - New Song.mp3',
          playlists: ['Favorites'],
        },
      ];

      await OrganizerService.organize(mockResults, mockLibraryPath);

      expect(fs.move).toHaveBeenCalledWith('/inbox/song.mp3', mockResults[0].proposedPath);
      expect(fs.outputJson).toHaveBeenCalled();
    });
  });

  describe('addToPlaylist', () => {
    it('should create new playlist with tracks', async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      vi.mocked(fs.outputFile).mockResolvedValue(undefined);

      const tracks = ['/library/Artist/Album/Song.mp3'];

      await OrganizerService.addToPlaylist('MyPlaylist', tracks, mockLibraryPath);

      expect(fs.outputFile).toHaveBeenCalledWith(
        expect.stringContaining('MyPlaylist.m3u8'),
        expect.stringContaining('#EXTM3U')
      );
    });
  });

  describe('removeFromPlaylist', () => {
    it('should throw error when trying to modify Master Library', async () => {
      await expect(
        OrganizerService.removeFromPlaylist(
          '00_Master_Library',
          '/track.mp3',
          mockLibraryPath
        )
      ).rejects.toThrow('Cannot modify the Master Library playlist');
    });

    it('should throw error if playlist does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        OrganizerService.removeFromPlaylist('NonExistent', '/track.mp3', mockLibraryPath)
      ).rejects.toThrow('Playlist NonExistent not found');
    });

    it('should remove track from playlist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(
        '#EXTM3U\n../Artist/Album/Song1.mp3\n../Artist/Album/Song2.mp3\n' as never
      );
      vi.mocked(fs.outputFile).mockResolvedValue(undefined);

      await OrganizerService.removeFromPlaylist(
        'MyPlaylist',
        '/mock/library/Artist/Album/Song1.mp3',
        mockLibraryPath
      );

      const outputCall = vi.mocked(fs.outputFile).mock.calls[0];
      const content = outputCall[1] as string;

      expect(content).not.toContain('Song1.mp3');
      expect(content).toContain('Song2.mp3');
    });
  });

  describe('deletePlaylist', () => {
    it('should throw error when trying to delete Master Library', async () => {
      await expect(
        OrganizerService.deletePlaylist('00_Master_Library', mockLibraryPath)
      ).rejects.toThrow('Cannot delete the Master Library playlist');
    });

    it('should delete .m3u8 playlist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.remove).mockResolvedValue(undefined);

      await OrganizerService.deletePlaylist('MyPlaylist', mockLibraryPath);

      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('MyPlaylist.m3u8')
      );
    });
  });

  describe('listPlaylists', () => {
    it('should return empty array if playlist directory does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const result = await OrganizerService.listPlaylists(mockLibraryPath);

      expect(result).toEqual([]);
    });

    it('should list all playlists except Master Library', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        '00_Master_Library.m3u8',
        'Favorites.m3u8',
        'Workout.m3u',
      ] as never);
      vi.mocked(fs.readFile).mockResolvedValue('#EXTM3U\ntrack1.mp3\ntrack2.mp3\n' as never);

      const result = await OrganizerService.listPlaylists(mockLibraryPath);

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.name === 'Favorites')).toBeDefined();
      expect(result.find((p) => p.name === '00_Master_Library')).toBeUndefined();
    });
  });

  describe('getPlaylistDetails', () => {
    it('should throw error if playlist not found', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        OrganizerService.getPlaylistDetails('NonExistent', mockLibraryPath)
      ).rejects.toThrow('Playlist NonExistent not found');
    });

    it('should return tracks with metadata from inventory', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(
        '#EXTM3U\n../Artist/Album/Song.mp3\n' as never
      );

      const inventory: SongMetadata[] = [
        {
          title: 'Song',
          artist: 'Artist',
          album: 'Album',
          trackNo: '01',
          genre: ['Rock'],
          format: '.mp3',
          absPath: '/mock/library/Artist/Album/Song.mp3',
        },
      ];

      vi.mocked(fs.readJson).mockResolvedValue(inventory as never);

      const result = await OrganizerService.getPlaylistDetails('MyPlaylist', mockLibraryPath);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Song');
      expect(result[0].artist).toBe('Artist');
    });
  });

  describe('exportPlaylist', () => {
    it('should throw error when exporting Master Library', async () => {
      await expect(
        OrganizerService.exportPlaylist(
          '00_Master_Library',
          '/dest',
          'copy',
          false,
          mockLibraryPath
        )
      ).rejects.toThrow('Cannot export/move the Master Library playlist');
    });

    it('should copy files in flat structure', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue('#EXTM3U\n../Artist/Album/Song.mp3\n' as never);
      vi.mocked(fs.readJson).mockResolvedValue([
        {
          title: 'Song',
          artist: 'Artist',
          album: 'Album',
          trackNo: '01',
          genre: ['Rock'],
          format: '.mp3',
          absPath: '/mock/library/Artist/Album/Song.mp3',
          relPath: 'Artist/Album/Song.mp3',
        },
      ] as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.copy).mockResolvedValue(undefined);

      const result = await OrganizerService.exportPlaylist(
        'MyPlaylist',
        '/dest',
        'copy',
        false,
        mockLibraryPath
      );

      expect(result.SuccessCount).toBe(1);
      expect(result.FailCount).toBe(0);
      expect(fs.copy).toHaveBeenCalled();
    });
  });

  describe('revealInFileExplorer', () => {
    it('should throw error if file does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        OrganizerService.revealInFileExplorer('/nonexistent.mp3')
      ).rejects.toThrow('File not found: /nonexistent.mp3');
    });
  });

  describe('getPlaylistsForTrack', () => {
    it('should return empty array if playlist directory does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const result = await OrganizerService.getPlaylistsForTrack(
        '/track.mp3',
        mockLibraryPath
      );

      expect(result).toEqual([]);
    });

    it('should find playlists containing the track', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readdir).mockResolvedValue([
        'Favorites.m3u8',
        'Workout.m3u8',
      ] as never);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('#EXTM3U\n../Artist/Album/Song.mp3\n' as never)
        .mockResolvedValueOnce('#EXTM3U\n../Other/Track.mp3\n' as never);

      const result = await OrganizerService.getPlaylistsForTrack(
        '/mock/library/Artist/Album/Song.mp3',
        mockLibraryPath
      );

      expect(result).toContain('Favorites');
      expect(result).not.toContain('Workout');
    });
  });

  describe('getAlbumCover', () => {
    it('should return null if file does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const result = await OrganizerService.getAlbumCover('/nonexistent.mp3');

      expect(result).toBeNull();
    });

    it('should extract album cover from metadata', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      
      const mockPicture = {
        data: new Uint8Array([1, 2, 3, 4]),
        format: 'image/jpeg',
      };

      vi.mocked(mm.parseFile).mockResolvedValue({
        common: {
          picture: [mockPicture],
        },
      } as never);

      const result = await OrganizerService.getAlbumCover('/track.mp3');

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe('image/jpeg');
      expect(Buffer.isBuffer(result?.data)).toBe(true);
    });

    it('should return null if no picture in metadata', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(mm.parseFile).mockResolvedValue({
        common: {},
      } as never);

      const result = await OrganizerService.getAlbumCover('/track.mp3');

      expect(result).toBeNull();
    });
  });

  describe('getTrackMetadata', () => {
    it('should return null if file does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const result = await OrganizerService.getTrackMetadata('/nonexistent.mp3');

      expect(result).toBeNull();
    });

    it('should extract full metadata with duration', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true);
      
      const mockMetadata = {
        common: {
          title: 'Song',
          artist: 'Artist',
        },
        format: {
          duration: 180,
        },
      };

      vi.mocked(mm.parseFile).mockResolvedValue(mockMetadata as never);

      const result = await OrganizerService.getTrackMetadata('/track.mp3');

      expect(result).toEqual(mockMetadata);
      expect(mm.parseFile).toHaveBeenCalledWith('/track.mp3', { duration: true });
    });
  });

  describe('exportLibrary', () => {
    it('should throw error if database not found', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        OrganizerService.exportLibrary('/dest', 'copy', false, mockLibraryPath)
      ).rejects.toThrow('Library database not found');
    });

    it('should copy entire library in flat structure', async () => {
      vi.mocked(fs.pathExists).mockResolvedValueOnce(true).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue([
        {
          title: 'Song1',
          artist: 'Artist1',
          album: 'Album1',
          trackNo: '01',
          genre: ['Rock'],
          format: '.mp3',
          absPath: '/library/Artist1/Album1/Song1.mp3',
          relPath: 'Artist1/Album1/Song1.mp3',
        },
        {
          title: 'Song2',
          artist: 'Artist2',
          album: 'Album2',
          trackNo: '01',
          genre: ['Pop'],
          format: '.flac',
          absPath: '/library/Artist2/Album2/Song2.flac',
          relPath: 'Artist2/Album2/Song2.flac',
        },
      ] as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.copy).mockResolvedValue(undefined);

      const result = await OrganizerService.exportLibrary(
        '/dest',
        'copy',
        false,
        mockLibraryPath
      );

      expect(result.SuccessCount).toBe(2);
      expect(result.FailCount).toBe(0);
      expect(fs.copy).toHaveBeenCalledTimes(2);
    });
  });
});
