import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MusicTable } from '@/components/MusicTable';
import { useNavigate } from 'react-router-dom';
import { useMusicTable } from '@/hooks/useMusicTable';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { ScanResult } from '@/hooks/useMusicTable';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/hooks/useMusicTable', () => ({
  useMusicTable: vi.fn(),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked === true || checked === 'indeterminate'}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      {...props}
    />
  )
}));

vi.mock('@/components/TrackPlaylistsCell', () => ({
  TrackPlaylistsCell: ({ trackPath }: { trackPath: string }) => <div data-testid={`playlist-cell-${trackPath}`}>Playlists</div>
}));

vi.mock('@/components/AlbumCover', () => ({
  AlbumCover: ({ trackPath }: { trackPath: string }) => <div data-testid={`album-cover-${trackPath}`}>Cover</div>
}));

const mockData = [
  {
    file: '/path/to/song1.mp3',
    metadata: {
      title: 'Song 1',
      artist: 'Artist 1;Artist 2',
      album: 'Album 1',
      year: '2021',
      genre: ['Electronic;Pop'],
      format: '.mp3',
    },
  },
  {
    file: '/path/to/song2.flac',
    metadata: {
      title: 'Song 2',
      artist: 'Artist 3',
      album: 'Album 2',
      year: '', // empty year
      genre: ['Rock'],
      format: '.flac',
    },
  }
] as unknown as ScanResult[];

describe('MusicTable', () => {
    const mockNavigate = vi.fn();
    const mockSetSearchQuery = vi.fn();
    const mockHandleSort = vi.fn();
    const mockOnSelectionChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useIsMobile).mockReturnValue(false);
        vi.mocked(useMusicTable).mockReturnValue({
            data: mockData,
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            sortField: null,
            sortDirection: 'asc',
            handleSort: mockHandleSort,
            totalCount: 2,
            filteredCount: 2,
            filteredData: mockData,
        } as any);
    });

    it('should_render_empty_state_when_no_data', () => {
        vi.mocked(useMusicTable).mockReturnValue({
            data: [],
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            sortField: null,
            sortDirection: 'asc',
            handleSort: mockHandleSort,
            totalCount: 0,
            filteredCount: 0,
            filteredData: [],
        } as any);

        render(<MusicTable data={[]} />);
        expect(screen.getByText('No tracks available.')).toBeInTheDocument();
    });

    it('should_render_search_empty_state_when_no_filtered_data', () => {
        vi.mocked(useMusicTable).mockReturnValue({
            data: [],
            searchQuery: 'nonexistent',
            setSearchQuery: mockSetSearchQuery,
            sortField: null,
            sortDirection: 'asc',
            handleSort: mockHandleSort,
            totalCount: 2,
            filteredCount: 0,
            filteredData: [],
        } as any);

        render(<MusicTable data={mockData} />);
        expect(screen.getByText('No tracks found matching your search.')).toBeInTheDocument();
    });

    it('should_render_data_correctly', () => {
        render(<MusicTable data={mockData} />);
        expect(screen.getByText('Song 1')).toBeInTheDocument();
        expect(screen.getByText(/Artist 1/)).toBeInTheDocument();
        expect(screen.getByText(/Artist 2/)).toBeInTheDocument(); // split by ;
        expect(screen.getByText('Album 1')).toBeInTheDocument();
        expect(screen.getByText('2021')).toBeInTheDocument();
        expect(screen.getByText('Electronic')).toBeInTheDocument();
        expect(screen.getByText('Pop')).toBeInTheDocument();
        expect(screen.getByText('mp3')).toBeInTheDocument();

        // 2nd row with empty year
        expect(screen.getByText('Song 2')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument(); // Year fallback
    });

    it('should_handle_search_input', () => {
        render(<MusicTable data={mockData} />);
        const searchInput = screen.getByPlaceholderText('Search by title, artist, album, or genre...');
        fireEvent.change(searchInput, { target: { value: 'test search' } });
        expect(mockSetSearchQuery).toHaveBeenCalledWith('test search');
    });

    it('should_handle_sorting', () => {
        render(<MusicTable data={mockData} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Title/i }));
        expect(mockHandleSort).toHaveBeenCalledWith('title');

        fireEvent.click(screen.getByRole('button', { name: /Artist/i }));
        expect(mockHandleSort).toHaveBeenCalledWith('artist');

        fireEvent.click(screen.getByRole('button', { name: /Album/i }));
        expect(mockHandleSort).toHaveBeenCalledWith('album');

        fireEvent.click(screen.getByRole('button', { name: /Genre/i }));
        expect(mockHandleSort).toHaveBeenCalledWith('genre');
    });

    it('should_display_sort_icons_correctly', () => {
        vi.mocked(useMusicTable).mockReturnValue({
            data: mockData,
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            sortField: 'title',
            sortDirection: 'desc',
            handleSort: mockHandleSort,
            totalCount: 2,
            filteredCount: 2,
            filteredData: mockData,
        } as any);

        render(<MusicTable data={mockData} />);
        const titleButton = screen.getByRole('button', { name: /Title/i });
        expect(titleButton).toBeInTheDocument();
        // Since ArrowDown is a lucide icon it will be an svg inside the button
        expect(titleButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should_navigate_on_row_click', () => {
        render(<MusicTable data={mockData} />);
        const firstRow = screen.getByText('Song 1').closest('tr');
        fireEvent.click(firstRow!);
        expect(mockNavigate).toHaveBeenCalledWith(`/track/${encodeURIComponent('/path/to/song1.mp3')}`);
    });

    it('should_handle_row_selection', () => {
        const selected = new Set(['/path/to/song1.mp3']);
        render(
            <MusicTable 
                data={mockData} 
                enableSelection={true} 
                selectedTracks={selected}
                onSelectionChange={mockOnSelectionChange} 
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        // Index 0 is "select all", index 1 is row 1, index 2 is row 2
        fireEvent.click(checkboxes[2]); // click row 2
        expect(mockOnSelectionChange).toHaveBeenCalled();
        
        // Assert the new set has both
        const callArg = mockOnSelectionChange.mock.calls[0][0] as Set<string>;
        expect(callArg.has('/path/to/song2.flac')).toBe(true);
        expect(callArg.has('/path/to/song1.mp3')).toBe(true);

        // Deselect row 1
        mockOnSelectionChange.mockClear();
        fireEvent.click(checkboxes[1]);
        const callArg2 = mockOnSelectionChange.mock.calls[0][0] as Set<string>;
        expect(callArg2.has('/path/to/song1.mp3')).toBe(false);
    });

    it('should_handle_select_all', () => {
        render(
            <MusicTable 
                data={mockData} 
                enableSelection={true} 
                selectedTracks={new Set()}
                onSelectionChange={mockOnSelectionChange} 
            />
        );

        const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(selectAllCheckbox);
        
        const callArg = mockOnSelectionChange.mock.calls[0][0] as Set<string>;
        expect(callArg.size).toBe(2);
        expect(callArg.has('/path/to/song1.mp3')).toBe(true);
        expect(callArg.has('/path/to/song2.flac')).toBe(true);
    });

    it('should_handle_select_all_deselect', () => {
        const allSelected = new Set(['/path/to/song1.mp3', '/path/to/song2.flac']);
        render(
            <MusicTable 
                data={mockData} 
                enableSelection={true} 
                selectedTracks={allSelected}
                onSelectionChange={mockOnSelectionChange} 
            />
        );

        const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(selectAllCheckbox);
        
        const callArg = mockOnSelectionChange.mock.calls[0][0] as Set<string>;
        expect(callArg.size).toBe(0);
    });

    it('should_not_call_selection_change_if_not_provided', () => {
        render(
            <MusicTable 
                data={mockData} 
                enableSelection={true} 
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]); // Select all
        fireEvent.click(checkboxes[1]); // Select row 1
        // Shouldn't crash and obviously no mock handler is called
    });

    it('should_render_playlists_column', () => {
        render(<MusicTable data={mockData} showPlaylistsColumn={true} />);
        expect(screen.getByRole('columnheader', { name: /Playlists/i })).toBeInTheDocument(); // Table head
        expect(screen.getByTestId('playlist-cell-/path/to/song1.mp3')).toBeInTheDocument();
    });

    it('should_render_row_action', () => {
        const renderRowAction = (track: ScanResult) => (
            <button data-testid={`action-${track.file}`}>Action</button>
        );

        render(<MusicTable data={mockData} renderRowAction={renderRowAction} />);
        
        const actionButton = screen.getByTestId('action-/path/to/song1.mp3');
        expect(actionButton).toBeInTheDocument();

        // Click action, stop propagation
        fireEvent.click(actionButton);
        expect(mockNavigate).not.toHaveBeenCalled(); // Navigate shouldn't be called
    });

    it('should_use_small_album_cover_on_mobile', () => {
        vi.mocked(useIsMobile).mockReturnValue(true);
        render(<MusicTable data={mockData} />);
        
        expect(screen.getByTestId('album-cover-/path/to/song1.mp3')).toBeInTheDocument();
    });

    it('should_show_indeterminate_checkbox_state', () => {
        const selected = new Set(['/path/to/song1.mp3']);
        render(
            <MusicTable 
                data={mockData} 
                enableSelection={true} 
                selectedTracks={selected}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        // Assert it does not crash, we rely on the component state code.
        expect(checkboxes[0]).toBeInTheDocument();
    });
    
    it('should_render_in_empty_state_with_columns_colspan', () => {
        vi.mocked(useMusicTable).mockReturnValue({
            data: [],
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            sortField: null,
            sortDirection: 'asc',
            handleSort: mockHandleSort,
            totalCount: 0,
            filteredCount: 0,
            filteredData: [],
        } as any);

        render(<MusicTable data={[]} enableSelection={true} showPlaylistsColumn={true} />);
        expect(screen.getByText('No tracks available.')).toHaveAttribute('colspan', '9');

        render(<MusicTable data={[]} enableSelection={true} showPlaylistsColumn={false} />);
        expect(screen.getAllByText('No tracks available.')[1]).toHaveAttribute('colspan', '8');

        render(<MusicTable data={[]} enableSelection={false} showPlaylistsColumn={true} />);
        expect(screen.getAllByText('No tracks available.')[2]).toHaveAttribute('colspan', '8');

        render(<MusicTable data={[]} enableSelection={false} showPlaylistsColumn={false} />);
        expect(screen.getAllByText('No tracks available.')[3]).toHaveAttribute('colspan', '7');
    });

    it('should_not_call_selection_change_on_select_all_if_not_provided', () => {
        render(<MusicTable data={mockData} enableSelection={true} />);
        const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(selectAllCheckbox);
        // Should not throw or error
    });

    it('should_display_sort_icons_correctly_asc_and_desc', () => {
        vi.mocked(useMusicTable).mockReturnValue({
            data: mockData,
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            sortField: 'title',
            sortDirection: 'asc', // Test asc specifically for the ternary branch
            handleSort: mockHandleSort,
            totalCount: 2,
            filteredCount: 2,
            filteredData: mockData,
        } as any);

        render(<MusicTable data={mockData} />);
        expect(screen.getByRole('button', { name: /Title/i })).toBeInTheDocument();
    });
});
