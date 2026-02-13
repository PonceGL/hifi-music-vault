import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMusicTable, type ScanResult } from '../../hooks/useMusicTable';

describe('useMusicTable', () => {
  const mockData: ScanResult[] = [
    {
      file: '/path/song1.mp3',
      metadata: {
        title: 'Amazing Song',
        artist: 'Artist A',
        album: 'Album One',
        year: 2020,
        trackNo: '01',
        genre: ['Rock', 'Alternative'],
        format: '.mp3',
        absPath: '/path/song1.mp3',
        relPath: 'Artist A/Album One/song1.mp3',
      },
      proposedPath: '/library/Artist A/Album One/01 - Amazing Song.mp3',
      playlists: ['Favorites'],
    },
    {
      file: '/path/song2.flac',
      metadata: {
        title: 'Beautiful Track',
        artist: 'Artist B',
        album: 'Album Two',
        year: 2021,
        trackNo: '02',
        genre: ['Jazz'],
        format: '.flac',
        absPath: '/path/song2.flac',
        relPath: 'Artist B/Album Two/song2.flac',
      },
      proposedPath: '/library/Artist B/Album Two/02 - Beautiful Track.flac',
      playlists: [],
    },
    {
      file: '/path/song3.wav',
      metadata: {
        title: 'Café Música',
        artist: 'Artista C',
        album: 'Álbum Três',
        trackNo: '03',
        genre: ['Electronic', 'Ambient'],
        format: '.wav',
        absPath: '/path/song3.wav',
      },
      proposedPath: '/library/Artista C/Álbum Três/03 - Café Música.wav',
      playlists: ['Chill'],
    },
    {
      file: '/path/song4.mp3',
      metadata: {
        title: 'Dance Party!!!',
        artist: 'DJ Mix',
        album: 'Party Album',
        trackNo: '04',
        genre: ['Pop'],
        format: '.mp3',
        absPath: '/path/song4.mp3',
      },
      proposedPath: '/library/DJ Mix/Party Album/04 - Dance Party!!!.mp3',
      playlists: [],
    },
  ];

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      expect(result.current.data).toEqual(mockData);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.sortField).toBe('title');
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.totalCount).toBe(4);
      expect(result.current.filteredCount).toBe(4);
    });

    it('should handle empty data array', () => {
      const { result } = renderHook(() => useMusicTable([]));

      expect(result.current.data).toEqual([]);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.filteredCount).toBe(0);
    });
  });

  describe('Search functionality', () => {
    it('should filter by title', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Amazing');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Amazing Song');
    });

    it('should filter by artist', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Artist B');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.artist).toBe('Artist B');
    });

    it('should filter by album', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Album Two');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.album).toBe('Album Two');
    });

    it('should filter by genre', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Jazz');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.genre).toContain('Jazz');
    });

    it('should filter by multiple genres', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Electronic');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.genre).toContain('Electronic');
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('AMAZING');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Amazing Song');
    });

    it('should handle accents and diacritics', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Cafe Musica');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Café Música');
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Dance Party');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Dance Party!!!');
    });

    it('should return all data when search query is empty', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Amazing');
      });

      expect(result.current.filteredCount).toBe(1);

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.filteredCount).toBe(4);
    });

    it('should return all data when search query is only whitespace', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('   ');
      });

      expect(result.current.filteredCount).toBe(4);
    });

    it('should return empty array when no matches found', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('NonExistentSong');
      });

      expect(result.current.filteredCount).toBe(0);
      expect(result.current.data).toEqual([]);
    });

    it('should handle partial matches', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Amaz');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Amazing Song');
    });
  });

  describe('Sort functionality', () => {
    describe('Sort by title', () => {
      it('should sort by title in ascending order by default', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        expect(result.current.sortField).toBe('title');
        expect(result.current.sortDirection).toBe('asc');
        expect(result.current.data[0].metadata.title).toBe('Amazing Song');
        expect(result.current.data[1].metadata.title).toBe('Beautiful Track');
        expect(result.current.data[2].metadata.title).toBe('Café Música');
        expect(result.current.data[3].metadata.title).toBe('Dance Party!!!');
      });

      it('should toggle to descending when clicking title field', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        expect(result.current.sortDirection).toBe('asc');

        act(() => {
          result.current.handleSort('title');
        });

        expect(result.current.sortDirection).toBe('desc');
        expect(result.current.data[0].metadata.title).toBe('Dance Party!!!');
        expect(result.current.data[3].metadata.title).toBe('Amazing Song');
      });
    });

    describe('Sort by artist', () => {
      it('should sort by artist in ascending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('artist');
        });

        expect(result.current.sortField).toBe('artist');
        expect(result.current.sortDirection).toBe('asc');
        expect(result.current.data[0].metadata.artist).toBe('Artist A');
        expect(result.current.data[1].metadata.artist).toBe('Artist B');
        expect(result.current.data[2].metadata.artist).toBe('Artista C');
        expect(result.current.data[3].metadata.artist).toBe('DJ Mix');
      });

      it('should sort by artist in descending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('artist');
        });

        act(() => {
          result.current.handleSort('artist');
        });

        expect(result.current.sortDirection).toBe('desc');
        expect(result.current.data[0].metadata.artist).toBe('DJ Mix');
        expect(result.current.data[3].metadata.artist).toBe('Artist A');
      });
    });

    describe('Sort by album', () => {
      it('should sort by album in ascending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortField).toBe('album');
        expect(result.current.sortDirection).toBe('asc');
        const albums = result.current.data.map(d => d.metadata.album);
        expect(albums[0]).toBe('Album One');
        expect(albums[albums.length - 1]).toBe('Party Album');
      });

      it('should sort by album in descending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('album');
        });

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortDirection).toBe('desc');
        expect(result.current.data[0].metadata.album).toBe('Party Album');
        expect(result.current.data[3].metadata.album).toBe('Album One');
      });
    });

    describe('Sort by genre', () => {
      it('should sort by genre in ascending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('genre');
        });

        expect(result.current.sortField).toBe('genre');
        expect(result.current.sortDirection).toBe('asc');
        expect(result.current.data[0].metadata.genre[0]).toBe('Electronic');
        expect(result.current.data[1].metadata.genre[0]).toBe('Jazz');
        expect(result.current.data[2].metadata.genre[0]).toBe('Pop');
        expect(result.current.data[3].metadata.genre[0]).toBe('Rock');
      });

      it('should sort by genre in descending order', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('genre');
        });

        act(() => {
          result.current.handleSort('genre');
        });

        expect(result.current.sortDirection).toBe('desc');
        expect(result.current.data[0].metadata.genre[0]).toBe('Rock');
        expect(result.current.data[3].metadata.genre[0]).toBe('Electronic');
      });

      it('should handle empty genre array', () => {
        const dataWithEmptyGenre: ScanResult[] = [
          {
            ...mockData[0],
            metadata: { ...mockData[0].metadata, genre: [] },
          },
          mockData[1],
        ];

        const { result } = renderHook(() => useMusicTable(dataWithEmptyGenre));

        act(() => {
          result.current.handleSort('genre');
        });

        expect(result.current.data).toHaveLength(2);
      });
    });

    describe('Sort field switching', () => {
      it('should reset to ascending when changing sort field', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('album');
        });

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortDirection).toBe('desc');

        act(() => {
          result.current.handleSort('artist');
        });

        expect(result.current.sortField).toBe('artist');
        expect(result.current.sortDirection).toBe('asc');
      });

      it('should maintain sort direction when toggling same field', () => {
        const { result } = renderHook(() => useMusicTable(mockData));

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortDirection).toBe('asc');

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortDirection).toBe('desc');

        act(() => {
          result.current.handleSort('album');
        });

        expect(result.current.sortDirection).toBe('asc');
      });
    });
  });

  describe('Combined search and sort', () => {
    it('should filter and sort data', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Artist');
      });

      expect(result.current.filteredCount).toBe(3);

      act(() => {
        result.current.handleSort('artist');
      });

      expect(result.current.data[0].metadata.artist).toBe('Artist A');
      expect(result.current.data[1].metadata.artist).toBe('Artist B');
      expect(result.current.data[2].metadata.artist).toBe('Artista C');
    });

    it('should maintain sort when changing search query', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.handleSort('artist');
      });

      act(() => {
        result.current.handleSort('artist');
      });

      expect(result.current.sortDirection).toBe('desc');

      act(() => {
        result.current.setSearchQuery('Artist');
      });

      expect(result.current.sortDirection).toBe('desc');
      expect(result.current.data[0].metadata.artist).toBe('Artista C');
    });

    it('should update filtered count when search changes', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Rock');
      });

      expect(result.current.filteredCount).toBe(1);

      act(() => {
        result.current.setSearchQuery('Artist');
      });

      expect(result.current.filteredCount).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle data updates', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useMusicTable(data),
        { initialProps: { data: [mockData[0]] } }
      );

      expect(result.current.totalCount).toBe(1);

      rerender({ data: mockData });

      expect(result.current.totalCount).toBe(4);
    });

    it('should expose filteredData', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Amazing');
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].metadata.title).toBe('Amazing Song');
    });

    it('should handle unicode characters in search', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Três');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.album).toBe('Álbum Três');
    });

    it('should normalize multiple spaces in search query', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('Artist    A');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.artist).toBe('Artist A');
    });

    it('should handle search with leading/trailing spaces', () => {
      const { result } = renderHook(() => useMusicTable(mockData));

      act(() => {
        result.current.setSearchQuery('  Amazing  ');
      });

      expect(result.current.filteredCount).toBe(1);
      expect(result.current.data[0].metadata.title).toBe('Amazing Song');
    });
  });
});
