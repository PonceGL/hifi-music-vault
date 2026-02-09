
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MusicTable } from "@/components/MusicTable"
import type { ScanResult } from "@/hooks/useMusicTable"
import { Loader2, Plus } from "lucide-react"
import { useAppConfig } from "@/hooks/useAppConfig"

interface CreatePlaylistDialogProps {
  libraryData: ScanResult[]
  onSuccess: () => void
  initialSelectedTracks?: string[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreatePlaylistDialog({ 
    libraryData, 
    onSuccess, 
    initialSelectedTracks = [],
    trigger,
    open: controlledOpen, 
    onOpenChange 
}: CreatePlaylistDialogProps) {
  const { config } = useAppConfig()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const [name, setName] = useState("")
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set(initialSelectedTracks))
  
  // Reset or update state when dialog opens or initial selection changes
  useEffect(() => {
      if (open) {
          setSelectedTracks(new Set(initialSelectedTracks))
          setName("")
          setError(null)
      }
  }, [open, initialSelectedTracks])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter a playlist name")
      return
    }

    if (selectedTracks.size === 0) {
      setError("Please select at least one track")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const response = await fetch(`${apiUrl}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libraryPath: config.libraryPath,
          name: name,
          tracks: Array.from(selectedTracks)
        }),
      })

      if (!response.ok) throw new Error('Failed to create playlist')

      setOpen(false)
      setName("")
      setSelectedTracks(new Set())
      onSuccess()
    } catch (err) {
      console.error(err)
      setError("Failed to create playlist")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
          <DialogTrigger asChild>
              {trigger}
          </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
            <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
            </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Select tracks from your library to add to the new playlist.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Playlist Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Favorites"
            />
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <MusicTable 
                data={libraryData} 
                enableSelection 
                selectedTracks={selectedTracks}
                onSelectionChange={setSelectedTracks}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2">
            <div className="mr-auto text-sm text-muted-foreground">
                {selectedTracks.size} tracks selected
            </div>
            <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Playlist"
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
