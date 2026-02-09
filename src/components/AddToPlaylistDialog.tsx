
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
  const [initialPlaylists, setInitialPlaylists] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch playlists when dialog opens
  useEffect(() => {
    if (open && config.libraryPath && track) {
      const fetchPlaylists = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const apiUrl =
            import.meta.env.VITE_API_URL || "http://localhost:3001";

          const [playlistsResponse, trackPlaylistsResponse] = await Promise.all(
            [
              fetch(
                `${apiUrl}/api/playlists?libraryPath=${encodeURIComponent(config.libraryPath)}`,
              ),
              fetch(
                `${apiUrl}/api/tracks/playlists?trackPath=${encodeURIComponent(track.file)}&libraryPath=${encodeURIComponent(config.libraryPath)}`,
              ),
            ],
          );

          if (!playlistsResponse.ok)
            throw new Error("Failed to fetch playlists");
          if (!trackPlaylistsResponse.ok)
            throw new Error("Failed to fetch track playlists");

          const playlistsData = await playlistsResponse.json();
          const trackPlaylistsData = await trackPlaylistsResponse.json();

          const validPlaylists = playlistsData.playlists.filter(
            (p: any) => !p.name.startsWith("00_Master"),
          );
          setPlaylists(validPlaylists);

          const trackPlaylistsSet = new Set<string>(
            trackPlaylistsData.playlists || [],
          );
          setInitialPlaylists(trackPlaylistsSet);
          setSelectedPlaylists(new Set<string>(trackPlaylistsSet));
        } catch (err) {
          console.error(err);
          setError("Failed to load playlists");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlaylists();
    }
  }, [open, config.libraryPath, track]);

  const handleToggle = (name: string, checked: boolean) => {
      const newSet = new Set(selectedPlaylists)
      if (checked) newSet.add(name)
      else newSet.delete(name)
      setSelectedPlaylists(newSet)
  }

  const handleConfirm = async () => {
      if (!track || !config.libraryPath) return;

      setIsSaving(true)
      try {
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
          
          const playlistsToAdd = Array.from(selectedPlaylists).filter(
            (pl) => !initialPlaylists.has(pl),
          );
          const playlistsToRemove = Array.from(initialPlaylists).filter(
            (pl) => !selectedPlaylists.has(pl),
          );

          const promises: Promise<Response>[] = [];

          playlistsToAdd.forEach((playlistName) => {
            promises.push(
              fetch(`${apiUrl}/api/playlists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  libraryPath: config.libraryPath,
                  name: playlistName,
                  tracks: [track.file],
                }),
              }),
            );
          });

          playlistsToRemove.forEach((playlistName) => {
            promises.push(
              fetch(
                `${apiUrl}/api/playlists/${encodeURIComponent(playlistName)}/tracks`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    libraryPath: config.libraryPath,
                    trackPath: track.file,
                  }),
                },
              ),
            );
          });

          await Promise.all(promises)

          onSuccess()
          onOpenChange(false)
      } catch (err) {
          console.error(err)
          setError("Failed to update playlists");
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
            Add{" "}
            <span className="font-medium text-foreground">
              {track.metadata.title}
            </span>{" "}
            to...
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
                <p className="text-center text-sm text-muted-foreground py-4">
                  No other playlists found.
                </p>
              ) : (
                playlists.map((pl) => (
                  <div
                    key={pl.name}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`pl-${pl.name}`}
                      checked={selectedPlaylists.has(pl.name)}
                      onCheckedChange={(c) => handleToggle(pl.name, !!c)}
                    />
                    <label
                      htmlFor={`pl-${pl.name}`}
                      className="flex-1 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {pl.name.includes("Genre") ? (
                        <Disc className="h-4 w-4 opacity-50" />
                      ) : (
                        <Music className="h-4 w-4 opacity-50" />
                      )}
                      <span>{pl.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {pl.count}
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
