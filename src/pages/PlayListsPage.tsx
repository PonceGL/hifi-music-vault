import { useAppConfig } from "@/hooks/useAppConfig"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MusicTable } from "@/components/MusicTable"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, MoreVertical, Trash2, ListPlus, MinusCircle, Disc, Music, HardDriveDownload, FolderSearch } from "lucide-react"
import type { ScanResult } from "@/hooks/useMusicTable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog"
import { CreatePlaylistDialog } from "@/components/CreatePlaylistDialog"
import { ExportPlaylistDialog } from "@/components/ExportPlaylistDialog"

interface Playlist {
    name: string
    count: number
    path: string
}

export function PlayListsPage() {
    const { config } = useAppConfig()
    const { name } = useParams<{ name: string }>()
    const navigate = useNavigate()

    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [playlistTracks, setPlaylistTracks] = useState<ScanResult[]>([])
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Add to Playlist State (reused logic)
    const [trackToAdd, setTrackToAdd] = useState<ScanResult | null>(null)
    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false)
    const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)
    const [initialTracksForCreate, setInitialTracksForCreate] = useState<string[]>([])

    // Delete Playlist State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Export Playlist State
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

    // Fetch List of Playlists
    useEffect(() => {
        if (name) return // Don't fetch list if viewing details
        
        const fetchPlaylists = async () => {
             if (!config.libraryPath) return
             setIsLoading(true)
             try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
                const response = await fetch(`${apiUrl}/api/playlists?libraryPath=${encodeURIComponent(config.libraryPath)}`)
                if (!response.ok) throw new Error('Failed to fetch playlists')
                const data = await response.json()
                setPlaylists(data.playlists)
             } catch (err) {
                 console.error(err)
                 setError('Failed to load playlists')
             } finally {
                 setIsLoading(false)
             }
        }

        fetchPlaylists()
    }, [config.libraryPath, name])

    // Fetch Playlist Details
    useEffect(() => {
        if (!name) return

        const fetchDetails = async () => {
             if (!config.libraryPath) return
             setIsLoading(true)
             try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
                const response = await fetch(`${apiUrl}/api/playlists/${encodeURIComponent(name)}?libraryPath=${encodeURIComponent(config.libraryPath)}`)
                if (!response.ok) throw new Error('Failed to fetch playlist details')
                const data = await response.json()
                
                // Adapt to ScanResult
                 const adapted: ScanResult[] = data.tracks.map((song: any) => ({
                    file: song.absPath,
                    metadata: song,
                    proposedPath: song.absPath,
                    playlists: []
                }))

                setPlaylistTracks(adapted)
             } catch (err) {
                 console.error(err)
                 setError('Failed to load playlist details')
             } finally {
                 setIsLoading(false)
             }
        }

        fetchDetails()
    }, [config.libraryPath, name])

    const handleRemoveTrack = async (trackPath: string) => {
        if (!name || !config.libraryPath) return

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            const response = await fetch(`${apiUrl}/api/playlists/${encodeURIComponent(name)}/tracks`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    libraryPath: config.libraryPath,
                    trackPath: trackPath
                }),
            })
            
            if (!response.ok) throw new Error('Failed to remove track')
            
            // Optimistic update
            setPlaylistTracks(prev => prev.filter(t => t.file !== trackPath))
        } catch (err) {
            console.error(err)
            // Re-fetch to be safe?
        }
    }

    const handleDeletePlaylist = async () => {
        if (!name || !config.libraryPath) return
        setIsDeleting(true)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            const response = await fetch(`${apiUrl}/api/playlists/${encodeURIComponent(name)}?libraryPath=${encodeURIComponent(config.libraryPath)}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) throw new Error('Failed to delete playlist')
            
            navigate('/playlists')
        } catch (err) {
            console.error(err)
            setError("Failed to delete playlist")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    const handleExport = async (destination: string, mode: 'copy' | 'move', preserveStructure: boolean) => {
        if (!name || !config.libraryPath) return

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
        const response = await fetch(`${apiUrl}/api/playlists/${encodeURIComponent(name)}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                libraryPath: config.libraryPath,
                destination,
                mode,
                preserveStructure
            }),
        })
        
        if (!response.ok) throw new Error('Failed to export playlist')
        
        const result = await response.json()
        console.log("Export Result:", result)

        if (mode === 'move') {
            // Playlist is deleted, navigate away
            navigate('/playlists')
        } else {
            // Just copy, maybe show success toast?
            // For now, simple logging/alert mechanism
            // alert(`Exported ${result.SuccessCount} tracks.`)
        }
    }

    const handleReveal = async (filePath: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            await fetch(`${apiUrl}/api/reveal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: filePath }),
            })
        } catch (err) {
            console.error("Failed to reveal file", err)
        }
    }

    const openCreatePlaylistWithTrack = () => {
        if (trackToAdd) {
            setInitialTracksForCreate([trackToAdd.file])
            setIsAddToPlaylistOpen(false)
            setIsCreatePlaylistOpen(true)
        }
    }

    if (isLoading) {
        return (
             <div className="w-full h-[50vh] flex flex-col justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Loading...</p>
            </div>
        )
    }

    if (error) {
         return (
             <div className="w-full p-8 flex justify-center">
                <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-200">
                    Error: {error}
                </div>
            </div>
        )
    }

    // --- Detail View ---
    if (name) {
        return (
            <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
                
                {/* Dialogs */}
                <AddToPlaylistDialog 
                    track={trackToAdd}
                    open={isAddToPlaylistOpen}
                    onOpenChange={setIsAddToPlaylistOpen}
                    onCreateNew={openCreatePlaylistWithTrack}
                    onSuccess={() => {
                        setTrackToAdd(null)
                    }}
                />

                <CreatePlaylistDialog 
                    libraryData={[]} // Not needed for this flow
                    open={isCreatePlaylistOpen}
                    onOpenChange={setIsCreatePlaylistOpen}
                    initialSelectedTracks={initialTracksForCreate}
                    onSuccess={() => {
                        console.log("Playlist created")
                        // Usually redirects, but we are in a playlist detail. 
                        // Maybe stay here? Navigate?
                        navigate('/playlists')
                    }}
                    trigger={null}
                />

                <ExportPlaylistDialog 
                    open={isExportDialogOpen}
                    onOpenChange={setIsExportDialogOpen}
                    playlistName={name}
                    trackCount={playlistTracks.length}
                    onConfirm={handleExport}
                />

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{name}"? 
                                {playlistTracks.length > 0 && ` It contains ${playlistTracks.length} tracks.`}
                                <br/>This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleDeletePlaylist()
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="w-full max-w-6xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/playlists')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                            <p className="text-muted-foreground">{playlistTracks.length} tracks</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary"
                            onClick={() => setIsExportDialogOpen(true)}
                        >
                            <HardDriveDownload className="mr-2 h-4 w-4" />
                            Export / Move
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Playlist
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-6xl">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground mt-2">Loading playlist...</p>
                        </div>
                    ) : (
                        <MusicTable 
                            data={playlistTracks} 
                            renderRowAction={(track) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => {
                                            setTrackToAdd(track)
                                            setIsAddToPlaylistOpen(true)
                                        }}>
                                            <ListPlus className="mr-2 h-4 w-4" />
                                            Add to another playlist
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleReveal(track.file)}>
                                            <FolderSearch className="mr-2 h-4 w-4" />
                                            Show in Finder
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600"
                                            onClick={() => handleRemoveTrack(track.file)}
                                        >
                                            <MinusCircle className="mr-2 h-4 w-4" />
                                            Remove from playlist
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        />
                    )}
                </div>
            </main>
        )
    }

    // --- List View ---
    return (
        <main className="w-full flex flex-col justify-start items-center p-8 gap-8">

            <div className="w-full max-w-6xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/library')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">Playlists</h1>
                <p className="text-muted-foreground">Your curated collections</p>
                        </div>
                    </div>
                </div>

             <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(pl => (
                    <div 
                        key={pl.name}
                        className="group relative flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/playlists/${encodeURIComponent(pl.name)}`)}
                    >
                        <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            {pl.name.toLowerCase().includes('genre') ? <Disc className="h-6 w-6" /> : <Music className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{pl.name}</h3>
                            <p className="text-sm text-muted-foreground">{pl.count} tracks</p>
                        </div>
                    </div>
                ))}

                {playlists.length === 0 && (
                     <div className="col-span-full text-center py-20 text-muted-foreground">
                        No playlists found. Scan some music to generate them!
                    </div>
                )}
             </div>
        </main>
    )
}