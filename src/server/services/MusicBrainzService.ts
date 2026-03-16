import axios from 'axios';
import ffmetadata from 'ffmetadata';
import ffmpegStatic from 'ffmpeg-static';

// Configure ffmetadata to use the static ffmpeg binary downloaded via npm
if (ffmpegStatic) {
    ffmetadata.setFfmpegPath(ffmpegStatic);
}

export interface MusicBrainzRecording {
    id: string;
    title: string;
    artist: string;
    album: string;
    date?: string;
    genres: string[];
    releaseId?: string;
    coverArtUrl?: string;
}

export class MusicBrainzService {
    private static readonly BASE_URL = 'https://musicbrainz.org/ws/2';
    private static readonly COVER_ART_URL = 'https://coverartarchive.org';
    private static readonly USER_AGENT = 'HiFiMusicVault/1.0.0 ( local-app )';

    /**
     * Build a cover art URL for a given release ID
     */
    static getCoverArtUrl(releaseId: string): string {
        return `${this.COVER_ART_URL}/release/${releaseId}/front-500`;
    }

    /**
     * Search recordings in MusicBrainz
     */
    static async search(title?: string, artist?: string, album?: string): Promise<MusicBrainzRecording[]> {
        const queryParts: string[] = [];

        if (title) queryParts.push(`recording:"${title}"`);
        if (artist) queryParts.push(`artist:"${artist}"`);
        if (album) queryParts.push(`release:"${album}"`);

        const query = queryParts.join(' AND ');
        if (!query) {
            throw new Error('You must provide at least one search parameter (title, artist, or album)');
        }

        try {
            const response = await axios.get(`${this.BASE_URL}/recording`, {
                params: {
                    query,
                    fmt: 'json',
                    limit: 10
                },
                headers: {
                    'User-Agent': this.USER_AGENT
                }
            });

            const recordings = response.data.recordings || [];

            return recordings.map((rec: any) => {
                const artistCredit = rec['artist-credit']?.[0]?.name || 'Unknown Artist';
                const release = rec.releases?.[0] || {};
                const releaseId = release.id || undefined;
                const genres = (rec.tags || [])
                    .map((t: any) => t.name)
                    .filter(Boolean);

                return {
                    id: rec.id,
                    title: rec.title,
                    artist: artistCredit,
                    album: release.title || 'Unknown Album',
                    date: release.date,
                    genres,
                    releaseId,
                    coverArtUrl: releaseId ? this.getCoverArtUrl(releaseId) : undefined
                };
            });
        } catch (error) {
            console.error('Error searching MusicBrainz:', error);
            throw new Error('Failed to search MusicBrainz API');
        }
    }

    /**
     * Lookup a specific recording by its MusicBrainz ID (MBID)
     */
    static async lookupByMBID(recordingId: string): Promise<MusicBrainzRecording> {
        try {
            const response = await axios.get(`${this.BASE_URL}/recording/${recordingId}`, {
                params: {
                    inc: 'genres+releases+artist-credits',
                    fmt: 'json'
                },
                headers: {
                    'User-Agent': this.USER_AGENT
                }
            });

            const rec = response.data;
            const artistCredit = rec['artist-credit']?.[0]?.name || 'Unknown Artist';
            const release = rec.releases?.[0] || {};
            const releaseId = release.id || undefined;
            const genres = (rec.genres || [])
                .map((g: any) => g.name)
                .filter(Boolean);

            return {
                id: rec.id,
                title: rec.title,
                artist: artistCredit,
                album: release.title || 'Unknown Album',
                date: release.date,
                genres,
                releaseId,
                coverArtUrl: releaseId ? this.getCoverArtUrl(releaseId) : undefined
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Recording with MBID "${recordingId}" not found`);
            }
            console.error('Error looking up MusicBrainz recording:', error);
            throw new Error('Failed to lookup MusicBrainz recording');
        }
    }

    /**
     * Update metadata on local file using ffmetadata.
     * Supports: title, artist, album, year, genre.
     */
    static async updateMetadata(trackPath: string, metadata: {
        title?: string;
        artist?: string;
        album?: string;
        year?: string;
        genre?: string;
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            const ffMeta: Record<string, string> = {};
            if (metadata.title) ffMeta.title = metadata.title;
            if (metadata.artist) ffMeta.artist = metadata.artist;
            if (metadata.album) ffMeta.album = metadata.album;
            if (metadata.year) ffMeta.date = metadata.year;
            if (metadata.genre) ffMeta.genre = metadata.genre;

            ffmetadata.write(trackPath, ffMeta, {}, (err: Error | null) => {
                if (err) {
                    console.error('Error writing metadata:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
