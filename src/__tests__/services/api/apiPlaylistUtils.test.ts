import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/services/api/client', () => ({
    apiClient: mockApiClient,
}));

import { API_ENDPOINTS } from '@/constants/app';
import { playlistApi } from '@/services/api/playlistApi';
import { utilsApi, type AppConfig, type DirectoryEntry } from '@/services/api/utilsApi';
import type { SongMetadata } from '@/hooks/useMusicTable';

describe('playlistApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('list fetches playlists with the libraryPath query param', async () => {
        const playlists = [
            { name: 'Favorites', count: 12, path: '/library/Playlists/Favorites.m3u8' },
        ];
        mockApiClient.get.mockResolvedValue({ playlists });

        const response = await playlistApi.list('/library');

        expect(response).toEqual(playlists);
        expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.PLAYLISTS, {
            params: { libraryPath: '/library' },
        });
    });

    it('getDetails fetches tracks for the encoded playlist name', async () => {
        const tracks: SongMetadata[] = [
            {
                title: 'Track 1',
                artist: 'Artist',
                album: 'Album',
                trackNo: '01',
                genre: ['House'],
                format: '.flac',
                absPath: '/library/Artist/Album/Track 1.flac',
                playlists: ['Road Trip'],
            },
        ];
        mockApiClient.get.mockResolvedValue({ tracks });

        const response = await playlistApi.getDetails('Road Trip', '/library');

        expect(response).toEqual(tracks);
        expect(mockApiClient.get).toHaveBeenCalledWith(
            API_ENDPOINTS.PLAYLIST_DETAIL('Road Trip'),
            { params: { libraryPath: '/library' } }
        );
    });

    it('addTracks posts the playlist creation payload', async () => {
        mockApiClient.post.mockResolvedValue({ success: true });

        await playlistApi.addTracks('/library', 'Favorites', ['/tracks/one.mp3', '/tracks/two.mp3']);

        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.PLAYLISTS, {
            libraryPath: '/library',
            name: 'Favorites',
            tracks: ['/tracks/one.mp3', '/tracks/two.mp3'],
        });
    });

    it('removeTrack sends the delete payload to the track endpoint', async () => {
        mockApiClient.delete.mockResolvedValue({ success: true });

        await playlistApi.removeTrack('Favorites', '/tracks/one.mp3', '/library');

        expect(mockApiClient.delete).toHaveBeenCalledWith(
            API_ENDPOINTS.PLAYLIST_TRACKS('Favorites'),
            {
                libraryPath: '/library',
                trackPath: '/tracks/one.mp3',
            }
        );
    });

    it('delete passes the libraryPath object as the second argument', async () => {
        mockApiClient.delete.mockResolvedValue({ success: true });

        await playlistApi.delete('Favorites', '/library');

        expect(mockApiClient.delete).toHaveBeenCalledWith(
            API_ENDPOINTS.PLAYLIST_DETAIL('Favorites'),
            {
                params: { libraryPath: '/library' },
            }
        );
    });

    it('export posts the playlist export payload', async () => {
        const apiResponse = { success: true, successCount: 2, failedCount: 0 };
        mockApiClient.post.mockResolvedValue(apiResponse);

        const response = await playlistApi.export('Favorites', '/library', '/exports', 'move', false);

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.PLAYLIST_EXPORT('Favorites'), {
            libraryPath: '/library',
            destination: '/exports',
            mode: 'move',
            preserveStructure: false,
        });
    });
});

describe('utilsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getConfig returns the nested config object', async () => {
        const config: AppConfig = {
            inboxPath: '/inbox',
            libraryPath: '/library',
            updatedAt: '2026-03-18T10:00:00.000Z',
        };
        mockApiClient.get.mockResolvedValue({ config });

        const response = await utilsApi.getConfig();

        expect(response).toEqual(config);
        expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CONFIG);
    });

    it('saveConfig posts the app configuration', async () => {
        const config: AppConfig = {
            inboxPath: '/inbox',
            libraryPath: '/library',
        };
        mockApiClient.post.mockResolvedValue(config);

        const response = await utilsApi.saveConfig('/inbox', '/library');

        expect(response).toEqual(config);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CONFIG, {
            inboxPath: '/inbox',
            libraryPath: '/library',
        });
    });

    it('browse forwards the selected path when provided', async () => {
        const directories: DirectoryEntry[] = [
            { name: 'Music', path: '/Users/demo/Music', type: 'directory' },
        ];
        const apiResponse = {
            currentPath: '/Users/demo',
            parentPath: '/Users',
            directories,
        };
        mockApiClient.get.mockResolvedValue(apiResponse);

        const response = await utilsApi.browse('/Users/demo');

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.BROWSE, {
            params: { path: '/Users/demo' },
        });
    });

    it('browse omits params when no path is provided', async () => {
        const apiResponse = {
            currentPath: '/',
            parentPath: '/',
            directories: [],
        };
        mockApiClient.get.mockResolvedValue(apiResponse);

        const response = await utilsApi.browse();

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.BROWSE, {
            params: undefined,
        });
    });

    it('reveal posts the file path to the reveal endpoint', async () => {
        mockApiClient.post.mockResolvedValue({ success: true });

        await utilsApi.reveal('/library/track.mp3');

        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.REVEAL, {
            path: '/library/track.mp3',
        });
    });
});
