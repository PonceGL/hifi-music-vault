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
            write: vi.fn((path, data, opts, cb) => cb(null))
        }
    };
});

describe('MusicBrainzService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('should perform a search with title and return mapped recordings', async () => {
            const mockResponse = {
                data: {
                    recordings: [
                        {
                            id: '1234',
                            title: 'Mock Title',
                            'artist-credit': [{ name: 'Mock Artist' }],
                            releases: [{ title: 'Mock Album', date: '2023' }]
                        }
                    ]
                }
            };
            
            vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

            const results = await MusicBrainzService.search('Mock Title');
            
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/recording'),
                expect.objectContaining({
                    params: {
                        query: 'recording:"Mock Title"',
                        fmt: 'json',
                        limit: 10
                    }
                })
            );
            
            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                id: '1234',
                title: 'Mock Title',
                artist: 'Mock Artist',
                album: 'Mock Album',
                date: '2023'
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
    });

    describe('updateMetadata', () => {
        it('should call ffmetadata write with correctly mapped fields', async () => {
            const metadata = {
                title: 'New Title',
                artist: 'New Artist',
                album: 'New Album',
                year: '2025'
            };

            await MusicBrainzService.updateMetadata('/path/to/track.mp3', metadata);

            expect(ffmetadata.write).toHaveBeenCalledWith(
                '/path/to/track.mp3',
                {
                    title: 'New Title',
                    artist: 'New Artist',
                    album: 'New Album',
                    date: '2025'
                },
                {},
                expect.any(Function)
            );
        });
    });
});
