import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Search, Hash } from "lucide-react"

export interface MusicBrainzResult {
  id: string
  title: string
  artist: string
  album: string
  date?: string
  genres: string[]
  releaseId?: string
  coverArtUrl?: string
}

export interface SelectedMetadata {
  title?: string
  artist?: string
  album?: string
  year?: string
  genre?: string
  coverArtUrl?: string
}

interface MusicBrainzSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: {
    title?: string
    artist?: string
    album?: string
  }
  onSelect: (metadata: SelectedMetadata) => void
}

type SearchMode = "search" | "mbid"

export function MusicBrainzSearchDialog({ open, onOpenChange, initialQuery, onSelect }: MusicBrainzSearchDialogProps) {
  const [mode, setMode] = useState<SearchMode>("search")

  // Search fields
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")

  // MBID lookup field
  const [mbid, setMbid] = useState("")

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<MusicBrainzResult[]>([])
  const [error, setError] = useState<string | null>(null)

  // Selection preview with checkboxes
  const [selectedResult, setSelectedResult] = useState<MusicBrainzResult | null>(null)
  const [checkedFields, setCheckedFields] = useState<Record<string, boolean>>({
    title: true,
    artist: true,
    album: true,
    year: true,
    genre: true,
    coverArt: true
  })

  useEffect(() => {
    if (open) {
      if (initialQuery) {
        setTitle(initialQuery.title || "")
        setArtist(initialQuery.artist || "")
        setAlbum(initialQuery.album || "")
      }
      setResults([])
      setError(null)
      setSelectedResult(null)
      setMbid("")
      setCheckedFields({ title: true, artist: true, album: true, year: true, genre: true, coverArt: true })
    }
  }, [open, initialQuery])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!title && !artist && !album) {
      setError("Please enter at least one search term")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])
    setSelectedResult(null)

    try {
      const params = new URLSearchParams()
      if (title) params.append("title", title)
      if (artist) params.append("artist", artist)
      if (album) params.append("album", album)

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const res = await fetch(`${apiUrl}/api/musicbrainz/search?${params.toString()}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Search failed")
      }

      const data = await res.json()
      setResults(data.results || [])

      if (data.results?.length === 0) {
        setError("No results found.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during search")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedMbid = mbid.trim()
    if (!trimmedMbid) {
      setError("Please enter a MusicBrainz Recording ID")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])
    setSelectedResult(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const res = await fetch(`${apiUrl}/api/musicbrainz/lookup?mbid=${encodeURIComponent(trimmedMbid)}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Lookup failed")
      }

      const data = await res.json()
      if (data.result) {
        setSelectedResult(data.result)
        setCheckedFields({ title: true, artist: true, album: true, year: true, genre: true, coverArt: true })
      }
    } catch (err: any) {
      setError(err.message || "Failed to lookup recording")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResult = (result: MusicBrainzResult) => {
    setSelectedResult(result)
    setCheckedFields({ title: true, artist: true, album: true, year: true, genre: true, coverArt: true })
  }

  const toggleField = (field: string) => {
    setCheckedFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleConfirmSelection = () => {
    if (!selectedResult) return

    const metadata: SelectedMetadata = {}
    if (checkedFields.title) metadata.title = selectedResult.title
    if (checkedFields.artist) metadata.artist = selectedResult.artist
    if (checkedFields.album) metadata.album = selectedResult.album
    if (checkedFields.year && selectedResult.date) metadata.year = selectedResult.date.substring(0, 4)
    if (checkedFields.genre && selectedResult.genres.length > 0) metadata.genre = selectedResult.genres.join("; ")
    if (checkedFields.coverArt && selectedResult.coverArtUrl) metadata.coverArtUrl = selectedResult.coverArtUrl

    onSelect(metadata)
    onOpenChange(false)
  }

  const handleBackToResults = () => {
    setSelectedResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search MusicBrainz</DialogTitle>
          <DialogDescription>
            Search the MusicBrainz database or paste a Recording ID for exact results.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
          <button
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
              mode === "search"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { setMode("search"); setError(null); setSelectedResult(null) }}
          >
            <Search className="inline-block mr-1.5 h-3.5 w-3.5" />
            Search
          </button>
          <button
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
              mode === "mbid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { setMode("mbid"); setError(null); setSelectedResult(null) }}
          >
            <Hash className="inline-block mr-1.5 h-3.5 w-3.5" />
            Lookup by ID
          </button>
        </div>

        {/* If we have a selected result, show the confirmation panel with checkboxes */}
        {selectedResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Select fields to apply</h3>
              <Button variant="ghost" size="sm" onClick={handleBackToResults}>
                ← Back to results
              </Button>
            </div>

            {/* Cover art preview */}
            {selectedResult.coverArtUrl && (
              <div className="flex items-start gap-4">
                <img
                  src={selectedResult.coverArtUrl}
                  alt="Album cover"
                  className="w-24 h-24 rounded-md object-cover bg-muted"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="flex-1 min-w-0 pt-1">
                  <p className="font-medium truncate">{selectedResult.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedResult.artist}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedResult.album}</p>
                </div>
              </div>
            )}

            {/* Checkboxes per field */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <FieldCheckbox
                label="Title"
                value={selectedResult.title}
                checked={checkedFields.title}
                onCheckedChange={() => toggleField("title")}
              />
              <FieldCheckbox
                label="Artist"
                value={selectedResult.artist}
                checked={checkedFields.artist}
                onCheckedChange={() => toggleField("artist")}
              />
              <FieldCheckbox
                label="Album"
                value={selectedResult.album}
                checked={checkedFields.album}
                onCheckedChange={() => toggleField("album")}
              />
              {selectedResult.date && (
                <FieldCheckbox
                  label="Year"
                  value={selectedResult.date.substring(0, 4)}
                  checked={checkedFields.year}
                  onCheckedChange={() => toggleField("year")}
                />
              )}
              {selectedResult.genres.length > 0 && (
                <FieldCheckbox
                  label="Genre"
                  value={selectedResult.genres.join(", ")}
                  checked={checkedFields.genre}
                  onCheckedChange={() => toggleField("genre")}
                />
              )}
              {selectedResult.coverArtUrl && (
                <FieldCheckbox
                  label="Cover Art"
                  value="Available"
                  checked={checkedFields.coverArt}
                  onCheckedChange={() => toggleField("coverArt")}
                />
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleConfirmSelection}>
                Apply Selected Fields
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Search Mode */}
            {mode === "search" && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-title">Title</Label>
                    <Input id="search-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-artist">Artist</Label>
                    <Input id="search-artist" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-album">Album</Label>
                    <Input id="search-album" value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Album name" />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </form>
            )}

            {/* MBID Lookup Mode */}
            {mode === "mbid" && (
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mbid-input">MusicBrainz Recording ID</Label>
                  <Input
                    id="mbid-input"
                    value={mbid}
                    onChange={(e) => setMbid(e.target.value)}
                    placeholder="e.g. 3bd76d40-7f0e-36b7-9348-91a33afee20e"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this on the MusicBrainz website in the Recording page URL.
                  </p>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
                  Lookup
                </Button>
              </form>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                {error}
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Results ({results.length})</h3>
                <div className="grid gap-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectResult(result)}
                    >
                      {result.coverArtUrl && (
                        <img
                          src={result.coverArtUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover bg-muted shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.artist} • {result.album}
                          {result.date && ` (${result.date.substring(0, 4)})`}
                        </p>
                        {result.genres.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {result.genres.join(", ")}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSelectResult(result) }}>
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Small helper component for the checkbox field rows */
function FieldCheckbox({
  label,
  value,
  checked,
  onCheckedChange
}: {
  label: string
  value: string
  checked: boolean
  onCheckedChange: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={`field-${label}`} checked={checked} onCheckedChange={onCheckedChange} />
      <label htmlFor={`field-${label}`} className="flex-1 cursor-pointer">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium truncate">{value}</p>
      </label>
    </div>
  )
}
