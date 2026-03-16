import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MusicBrainzSearchDialog } from '../components/MusicBrainzSearchDialog'

describe('MusicBrainzSearchDialog', () => {
  const mockOnSelect = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  const renderDialog = (props = {}) => {
    return render(
      <MusicBrainzSearchDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSelect={mockOnSelect}
        initialQuery={{ title: 'Test Song', artist: 'Test Artist' }}
        {...props}
      />
    )
  }

  it('renders the dialog with search fields pre-filled from initialQuery', () => {
    renderDialog()
    
    expect(screen.getByText('Search MusicBrainz')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Song title')).toHaveValue('Test Song')
    expect(screen.getByPlaceholderText('Artist name')).toHaveValue('Test Artist')
    expect(screen.getByPlaceholderText('Album name')).toHaveValue('')
  })

  it('shows error when searching with empty fields', async () => {
    renderDialog({ initialQuery: {} })
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    await userEvent.click(searchButton)
    
    expect(screen.getByText('Please put at least one search term')).toBeInTheDocument()
  })

  it('displays results after a successful search', async () => {
    const mockResults = {
      results: [
        { id: '1', title: 'Found Song', artist: 'Found Artist', album: 'Found Album', date: '2024-01-01' }
      ]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    } as Response)

    renderDialog()
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    await userEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Found Song')).toBeInTheDocument()
    })

    expect(screen.getByText(/Found Artist/)).toBeInTheDocument()
  })

  it('calls onSelect when "Use this" is clicked on a result', async () => {
    const mockResults = {
      results: [
        { id: '1', title: 'Song A', artist: 'Artist A', album: 'Album A', date: '2023-05-10' }
      ]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    } as Response)

    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByText('Song A')).toBeInTheDocument()
    })

    const useButton = screen.getByRole('button', { name: /use this/i })
    await userEvent.click(useButton)

    expect(mockOnSelect).toHaveBeenCalledWith({
      title: 'Song A',
      artist: 'Artist A',
      album: 'Album A',
      year: '2023'
    })

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows "No results found" when API returns empty results', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] })
    } as Response)

    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
  })
})
