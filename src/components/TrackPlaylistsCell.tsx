import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppConfig } from "@/hooks/useAppConfig"
import { usePlaylistRefresh } from "@/hooks/usePlaylistRefresh";
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Music, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrackPlaylistsCellProps {
  trackPath: string
}

export function TrackPlaylistsCell({ trackPath }: TrackPlaylistsCellProps) {
  const { config } = useAppConfig()
  const navigate = useNavigate()
  const { refreshKey } = usePlaylistRefresh();
  const [playlists, setPlaylists] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!config.libraryPath) return;

      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const response = await fetch(
          `${apiUrl}/api/tracks/playlists?trackPath=${encodeURIComponent(trackPath)}&libraryPath=${encodeURIComponent(config.libraryPath)}`,
        );

        if (!response.ok) throw new Error("Failed to fetch playlists");

        const data = await response.json();
        setPlaylists(data.playlists || []);
      } catch (err) {
        console.error("Error fetching playlists for track:", err);
        setPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [trackPath, config.libraryPath, refreshKey]);

  const handlePlaylistClick = (playlistName: string) => {
    navigate(`/playlists/${encodeURIComponent(playlistName)}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Music className="h-3 w-3 animate-pulse text-muted-foreground" />
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">-</span>
    )
  }

  if (playlists.length === 1) {
    return (
      <Badge 
        variant="secondary" 
        className="cursor-pointer hover:bg-secondary/80 text-xs"
        onClick={(e) => {
          e.stopPropagation()
          handlePlaylistClick(playlists[0])
        }}
      >
        {playlists[0]}
      </Badge>
    )
  }

  const displayPlaylist = playlists[0]
  const remainingCount = playlists.length - 1

  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto py-1 px-2 gap-1 hover:bg-muted"
        >
          <Badge variant="secondary" className="text-xs">
            {displayPlaylist}
          </Badge>
          <span className="text-xs text-muted-foreground">+{remainingCount}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            In {playlists.length} playlists:
          </p>
          {playlists.map((playlist) => (
            <div
              key={playlist}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <Music className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{playlist}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
