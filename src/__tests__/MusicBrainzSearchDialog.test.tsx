import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

  const clickSearchSubmit = async () => {
    // The search form has a submit button with type="submit"
    const submitButtons = screen.getAllByRole('button', { name: /search/i })
    // The submit button is the one inside the form (type=submit), which is the last one
    const submitBtn = submitButtons.find(btn => btn.getAttribute('type') === 'submit') || submitButtons[submitButtons.length - 1]
    await userEvent.click(submitBtn)
  }

  it('renders the dialog with search fields and mode tabs', () => {
    renderDialog()
    expect(screen.getByText('Search MusicBrainz')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Song title')).toHaveValue('Test Song')
    expect(screen.getByPlaceholderText('Artist name')).toHaveValue('Test Artist')
  })

  it('shows error when searching with empty fields', async () => {
    renderDialog({ initialQuery: {} })
    await clickSearchSubmit()
    expect(screen.getByText('Please enter at least one search term')).toBeInTheDocument()
  })

  it('displays results with genres after a successful search', async () => {
    const mockResults = {
      results: [
        {
          id: '1', title: 'Found Song', artist: 'Found Artist', album: 'Found Album',
          date: '2024-01-01', genres: ['rock', 'indie'], releaseId: 'rel-1',
          coverArtUrl: 'https://coverartarchive.org/release/rel-1/front-500'
        }
      ]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockResults)
    } as Response)

    renderDialog()
    await clickSearchSubmit()

    await waitFor(() => {
      expect(screen.getByText('Found Song')).toBeInTheDocument()
    })
    expect(screen.getByText(/rock, indie/)).toBeInTheDocument()
  })

  it('shows field selection checkboxes when a result is selected', async () => {
    const mockResults = {
      results: [
        {
          id: '1', title: 'Song A', artist: 'Artist A', album: 'Album A',
          date: '2023-05-10', genres: ['electronic'], releaseId: 'rel-a',
          coverArtUrl: 'https://example.com/cover.jpg'
        }
      ]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockResults)
    } as Response)

    renderDialog()
    await clickSearchSubmit()

    await waitFor(() => expect(screen.getByText('Song A')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /select/i }))

    await waitFor(() => {
      expect(screen.getByText('Select fields to apply')).toBeInTheDocument()
      expect(screen.getByText('Genre')).toBeInTheDocument()
    })
  })

  it('calls onSelect with only checked fields when applying', async () => {
    const mockResults = {
      results: [
        {
          id: '1', title: 'Song B', artist: 'Artist B', album: 'Album B',
          date: '2022', genres: ['pop'], releaseId: 'rel-b',
          coverArtUrl: 'https://example.com/cover.jpg'
        }
      ]
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockResults)
    } as Response)

    renderDialog()
    await clickSearchSubmit()

    await waitFor(() => expect(screen.getByText('Song B')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /select/i }))

    await waitFor(() => expect(screen.getByText('Select fields to apply')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /apply selected fields/i }))

    expect(mockOnSelect).toHaveBeenCalledWith({
      title: 'Song B', artist: 'Artist B', album: 'Album B',
      year: '2022', genre: 'pop', coverArtUrl: 'https://example.com/cover.jpg'
    })
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('switches to MBID lookup mode and performs a lookup', async () => {
    const mockResult = {
      result: {
        id: 'mbid-exact', title: 'Exact Song', artist: 'Exact Artist',
        album: 'Exact Album', date: '2021-06-15', genres: ['jazz'],
        releaseId: 'rel-exact', coverArtUrl: 'https://example.com/cover-exact.jpg'
      }
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve(mockResult)
    } as Response)

    renderDialog()
    await userEvent.click(screen.getByText('Lookup by ID'))

    const mbidInput = screen.getByPlaceholderText(/e\.g\./i)
    await userEvent.type(mbidInput, 'mbid-exact')

    // Find the submit button in the lookup form (type=submit)
    const lookupButtons = screen.getAllByRole('button', { name: /lookup/i })
    const submitBtn = lookupButtons.find(btn => btn.getAttribute('type') === 'submit') || lookupButtons[lookupButtons.length - 1]
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Select fields to apply')).toBeInTheDocument()
      expect(screen.getAllByText('Exact Song').length).toBeGreaterThan(0)
    })
  })

  it('shows "No results found" when API returns empty results', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ results: [] })
    } as Response)

    renderDialog()
    await clickSearchSubmit()

    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
  })
})
