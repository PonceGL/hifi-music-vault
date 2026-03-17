import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MusicBrainzService } from '../server/services/MusicBrainzService.js';
import axios from 'axios';
import ffmetadata from 'ffmetadata';

// Mock dependencias externas
vi.mock('axios');
vi.mock('ffmetadata', () => {
    return {
        default: {
            setFfmpegPath: vi.fn(),
            write: vi.fn((_path, _data, _opts, cb) => cb(null))
        }
    };
});

describe('MusicBrainzService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('should perform a search with title and return mapped recordings with genres', async () => {
            const mockResponse = {
                data: {
                    recordings: [
                        {
                            id: '1234',
                            title: 'Mock Title',
                            'artist-credit': [{ name: 'Mock Artist' }],
                            releases: [{ id: 'rel-1', title: 'Mock Album', date: '2023' }],
                            tags: [{ name: 'electronic' }, { name: 'ambient' }]
                        }
                    ]
                }
            };

            vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

            const results = await MusicBrainzService.search('Mock Title');

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                id: '1234',
                title: 'Mock Title',
                artist: 'Mock Artist',
                album: 'Mock Album',
                date: '2023',
                genres: ['electronic', 'ambient'],
                releaseId: 'rel-1',
                coverArtUrl: 'https://coverartarchive.org/release/rel-1/front-500'
            });
        });

        it('should build query with title, artist and album', async () => {
            vi.mocked(axios.get).mockResolvedValueOnce({ data: { recordings: [] } });

            await MusicBrainzService.search('Title', 'Artist', 'Album');

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/recording'),
                expect.objectContaining({
                    params: expect.objectContaining({
                        query: 'recording:"Title" AND artist:"Artist" AND release:"Album"'
                    })
                })
            );
        });

        it('should throw error if no parameters provided', async () => {
            await expect(MusicBrainzService.search()).rejects.toThrow('You must provide at least one search parameter');
        });

        it('should handle recordings with no tags gracefully', async () => {
            vi.mocked(axios.get).mockResolvedValueOnce({
                data: {
                    recordings: [{
                        id: '5678',
                        title: 'No Tags Song',
                        'artist-credit': [{ name: 'Artist' }],
                        releases: [{ id: 'rel-2', title: 'Album', date: '2020' }]
                    }]
                }
            });

            const results = await MusicBrainzService.search('No Tags Song');
            expect(results[0].genres).toEqual([]);
            expect(results[0].releaseId).toBe('rel-2');
            expect(results[0].coverArtUrl).toContain('rel-2');
        });
    });

    describe('lookupByMBID', () => {
        it('should fetch a single recording by MBID with genres and cover art', async () => {
            vi.mocked(axios.get).mockResolvedValueOnce({
                data: {
                    id: 'mbid-123',
                    title: 'Exact Song',
                    'artist-credit': [{ name: 'Exact Artist' }],
                    releases: [{ id: 'rel-exact', title: 'Exact Album', date: '2022-03-15' }],
                    genres: [{ name: 'rock' }, { name: 'indie' }]
                }
            });

            const result = await MusicBrainzService.lookupByMBID('mbid-123');

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/recording/mbid-123'),
                expect.objectContaining({
                    params: { inc: 'genres+releases+artist-credits', fmt: 'json' }
                })
            );

            expect(result).toEqual({
                id: 'mbid-123',
                title: 'Exact Song',
                artist: 'Exact Artist',
                album: 'Exact Album',
                date: '2022-03-15',
                genres: ['rock', 'indie'],
                releaseId: 'rel-exact',
                coverArtUrl: 'https://coverartarchive.org/release/rel-exact/front-500'
            });
        });

        it('should throw a descriptive error for 404 responses', async () => {
            vi.mocked(axios.get).mockRejectedValueOnce({
                response: { status: 404 }
            });

            await expect(MusicBrainzService.lookupByMBID('bad-id'))
                .rejects.toThrow('Recording with MBID "bad-id" not found');
        });
    });

    describe('getCoverArtUrl', () => {
        it('should return a valid Cover Art Archive URL', () => {
            const url = MusicBrainzService.getCoverArtUrl('abc-123');
            expect(url).toBe('https://coverartarchive.org/release/abc-123/front-500');
        });
    });

    describe('updateMetadata', () => {
        it('should call ffmetadata write with correctly mapped fields including genre', async () => {
            const metadata = {
                title: 'New Title',
                artist: 'New Artist',
                album: 'New Album',
                year: '2025',
                genre: 'Electronic'
            };

            await MusicBrainzService.updateMetadata('/path/to/track.flac', metadata);

            expect(ffmetadata.write).toHaveBeenCalledWith(
                '/path/to/track.flac',
                {
                    title: 'New Title',
                    artist: 'New Artist',
                    album: 'New Album',
                    date: '2025',
                    genre: 'Electronic'
                },
                {},
                expect.any(Function)
            );
        });
    });
});
