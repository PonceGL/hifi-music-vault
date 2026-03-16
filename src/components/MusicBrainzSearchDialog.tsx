import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"

export interface MusicBrainzResult {
  id: string
  title: string
  artist: string
  album: string
  date?: string
}

interface MusicBrainzSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: {
    title?: string
    artist?: string
    album?: string
  }
  onSelect: (metadata: { title: string; artist: string; album: string; year?: string }) => void
}

export function MusicBrainzSearchDialog({ open, onOpenChange, initialQuery, onSelect }: MusicBrainzSearchDialogProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<MusicBrainzResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && initialQuery) {
      setTitle(initialQuery.title || "")
      setArtist(initialQuery.artist || "")
      setAlbum(initialQuery.album || "")
      setResults([])
      setError(null)
    }
  }, [open, initialQuery])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!title && !artist && !album) {
      setError("Please put at least one search term")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const params = new URLSearchParams()
      if (title) params.append("title", title)
      if (artist) params.append("artist", artist)
      if (album) params.append("album", album)

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const res = await fetch(`${apiUrl}/api/musicbrainz/search?${params.toString()}`)
      
      if (!res.ok) {
         const data = await res.json()
         throw new Error(data.error || "Failed to fetch from MusicBrainz")
      }

      const data = await res.json()
      setResults(data.results || [])
      
      if (data.results?.length === 0) {
        setError("No results found.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred during search")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (result: MusicBrainzResult) => {
    onSelect({
      title: result.title,
      artist: result.artist,
      album: result.album,
      year: result.date ? result.date.substring(0, 4) : undefined
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search MusicBrainz</DialogTitle>
          <DialogDescription>
            Search the MusicBrainz database to auto-fill metadata for this track.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-title">Title</Label>
              <Input
                id="search-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-artist">Artist</Label>
              <Input
                id="search-artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-album">Album</Label>
              <Input
                id="search-album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Results ({results.length})</h3>
            <div className="grid gap-3">
              {results.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.artist} • {result.album}</p>
                    {result.date && <p className="text-xs text-muted-foreground mt-0.5">{result.date}</p>}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleSelect(result)}>
                    Use this
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
