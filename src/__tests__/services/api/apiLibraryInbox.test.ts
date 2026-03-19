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
import { inboxApi } from '@/services/api/inboxApi';
import { libraryApi } from '@/services/api/libraryApi';
import type { ScanResult, SongMetadata } from '@/hooks/useMusicTable';

describe('inboxApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('scan sends the expected payload and returns the results array', async () => {
        const results: ScanResult[] = [
            {
                file: '/inbox/song.flac',
                metadata: {
                    title: 'Song',
                    artist: 'Artist',
                    album: 'Album',
                    trackNo: '01',
                    genre: ['Electronic'],
                    format: '.flac',
                    absPath: '/inbox/song.flac',
                    playlists: [],
                },
                proposedPath: '/library/Artist/Album/01 - Song.flac',
                playlists: [],
            },
        ];

        mockApiClient.post.mockResolvedValue({ success: true, results });

        const response = await inboxApi.scan('/inbox', '/library');

        expect(response).toEqual(results);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.SCAN, {
            inboxPath: '/inbox',
            libraryPath: '/library',
        });
    });

    it('organize posts the selected results and library path', async () => {
        const results: ScanResult[] = [];
        mockApiClient.post.mockResolvedValue({ success: true, message: 'Organization complete' });

        await inboxApi.organize(results, '/library');

        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.ORGANIZE, {
            results,
            libraryPath: '/library',
        });
    });
});

describe('libraryApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetch requests the inventory using libraryPath query params', async () => {
        const inventory: SongMetadata[] = [
            {
                title: 'Track 1',
                artist: 'Artist',
                album: 'Album',
                trackNo: '01',
                genre: ['Rock'],
                format: '.mp3',
                absPath: '/library/Artist/Album/Track 1.mp3',
                playlists: ['Favorites'],
            },
        ];

        mockApiClient.get.mockResolvedValue({ inventory });

        const response = await libraryApi.fetch('/library');

        expect(response).toEqual(inventory);
        expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY, {
            params: { libraryPath: '/library' },
        });
    });

    it('regenerate posts the library path', async () => {
        const apiResponse = {
            success: true,
            message: 'Database regenerated',
            tracksProcessed: 25,
            playlistsGenerated: 3,
        };
        mockApiClient.post.mockResolvedValue(apiResponse);

        const response = await libraryApi.regenerate('/library');

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY_REGENERATE, {
            libraryPath: '/library',
        });
    });

    it('syncAppleMusic posts the library path', async () => {
        const apiResponse = { success: true, message: 'Sync complete' };
        mockApiClient.post.mockResolvedValue(apiResponse);

        const response = await libraryApi.syncAppleMusic('/library');

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY_SYNC_APPLE_MUSIC, {
            libraryPath: '/library',
        });
    });

    it('export posts the full export payload', async () => {
        const apiResponse = { success: true, successCount: 10, failedCount: 1 };
        mockApiClient.post.mockResolvedValue(apiResponse);

        const response = await libraryApi.export('/library', '/exports', 'copy', true);

        expect(response).toEqual(apiResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY_EXPORT, {
            libraryPath: '/library',
            destination: '/exports',
            mode: 'copy',
            preserveStructure: true,
        });
    });
});
