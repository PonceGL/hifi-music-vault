
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { ScanResult } from "@/hooks/useMusicTable" // Type import
import { useAppConfig } from "@/hooks/useAppConfig"
import { Loader2, Plus, Disc, Music } from "lucide-react"

interface AddToPlaylistDialogProps {
  track: ScanResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNew: () => void
  onSuccess: () => void
}

interface Playlist {
    name: string
    count: number
}

export function AddToPlaylistDialog({ 
    track, 
    open, 
    onOpenChange,
    onCreateNew,
    onSuccess 
}: AddToPlaylistDialogProps) {
  const { config } = useAppConfig()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch playlists when dialog opens
  useEffect(() => {
      if (open && config.libraryPath) {
          const fetchPlaylists = async () => {
             setIsLoading(true)
             setError(null)
             try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
                const response = await fetch(`${apiUrl}/api/playlists?libraryPath=${encodeURIComponent(config.libraryPath)}`)
                if (!response.ok) throw new Error('Failed to fetch playlists')
                const data = await response.json()
                // Filter out genre playlists or master library if desired, but user might want to add to them? 
                // Usually Genre/Master are auto-generated. Let's keep them but maybe sort custom ones first.
                // actually, user likely shouldn't modify "00_Master" manually via this UI if it's auto-gen. 
                // But for now let's just show all except maybe master.
                const validPlaylists = data.playlists.filter((p: any) => !p.name.startsWith('00_Master'))
                setPlaylists(validPlaylists)
                setSelectedPlaylists(new Set())
             } catch (err) {
                 console.error(err)
                 setError("Failed to load playlists")
             } finally {
                 setIsLoading(false)
             }
          }
          fetchPlaylists()
      }
  }, [open, config.libraryPath])

  const handleToggle = (name: string, checked: boolean) => {
      const newSet = new Set(selectedPlaylists)
      if (checked) newSet.add(name)
      else newSet.delete(name)
      setSelectedPlaylists(newSet)
  }

  const handleConfirm = async () => {
      if (!track || !config.libraryPath || selectedPlaylists.size === 0) return

      setIsSaving(true)
      try {
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
          
          // Add to each selected playlist
          // We can do this in parallel
          const promises = Array.from(selectedPlaylists).map(playlistName => {
              return fetch(`${apiUrl}/api/playlists`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      libraryPath: config.libraryPath,
                      name: playlistName,
                      tracks: [track.file] // Add single track
                  }),
              })
          })

          await Promise.all(promises)

          onSuccess()
          onOpenChange(false)
      } catch (err) {
          console.error(err)
          setError("Failed to add to playlists")
      } finally {
          setIsSaving(false)
      }
  }

  if (!track) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription className="truncate">
            Add <span className="font-medium text-foreground">{track.metadata.title}</span> to...
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-sm p-4 text-center">{error}</div>
            ) : (
                <div className="space-y-2">
                     <Button 
                        variant="ghost" 
                        className="w-full justify-start font-normal text-primary hover:text-primary/80 hover:bg-primary/10"
                        onClick={onCreateNew}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Playlist...
                    </Button>
                    
                    <div className="border-t my-2"></div>

                    {playlists.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">No other playlists found.</p>
                    ) : (
                        playlists.map(pl => (
                            <div key={pl.name} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                                <Checkbox 
                                    id={`pl-${pl.name}`}
                                    checked={selectedPlaylists.has(pl.name)}
                                    onCheckedChange={(c) => handleToggle(pl.name, !!c)}
                                />
                                <label 
                                    htmlFor={`pl-${pl.name}`}
                                    className="flex-1 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {pl.name.includes('Genre') ? <Disc className="h-4 w-4 opacity-50" /> : <Music className="h-4 w-4 opacity-50" />}
                                    <span>{pl.name}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">{pl.count}</span>
                                </label>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={isSaving || selectedPlaylists.size === 0}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Playlist
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
