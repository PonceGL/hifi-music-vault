import { useAppConfig } from "@/hooks/useAppConfig"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MusicTable } from "@/components/MusicTable"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Music, Disc } from "lucide-react"
import type { ScanResult } from "@/hooks/useMusicTable"

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
                <div className="w-full max-w-6xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/playlists')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">{name}</h1>
                            <p className="text-muted-foreground">{playlistTracks.length} tracks</p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-6xl">
                    <MusicTable data={playlistTracks} />
                </div>
            </main>
        )
    }

    // --- List View ---
    return (
        <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
             <div className="flex flex-col items-center gap-2">
                <h1 className="text-3xl font-bold">Playlists</h1>
                <p className="text-muted-foreground">Your curated collections</p>
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