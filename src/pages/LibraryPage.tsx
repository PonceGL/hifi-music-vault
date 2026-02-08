import { useAppConfig } from "@/hooks/useAppConfig"
import { useEffect, useState } from "react"
import { MusicTable } from "@/components/MusicTable"

interface SongMetadata {
    title: string
    artist: string
    album: string
    year?: number
    trackNo: string
    genre: string[]
    format: string
    absPath: string
    relPath?: string
}

interface ScanResult {
    file: string
    metadata: SongMetadata
    proposedPath: string
    playlists: string[]
}

export function LibraryPage() {
    const { config } = useAppConfig()
    const [scanResults, setScanResults] = useState<ScanResult[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const scanInbox = async () => {
            if (!config.inboxPath || !config.libraryPath) {
                console.error("Missing inbox or library path")
                return
            }

            setIsScanning(true)
            setError(null)

            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
                const response = await fetch(`${apiUrl}/api/scan`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inboxPath: config.inboxPath,
                        libraryPath: config.libraryPath,
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to scan inbox')
                }

                const data = await response.json()
                console.log("============================")
                console.log("SCAN RESULTS:")
                console.log("============================")
                console.log(`Found ${data.results.length} files to organize`)
                console.log(data.results)
                console.log("============================")

                setScanResults(data.results)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                console.error('Error scanning inbox:', err)
                setError(errorMessage)
            } finally {
                setIsScanning(false)
            }
        }

        // Auto-scan on mount
        scanInbox()
    }, [config.inboxPath, config.libraryPath])

    return (
        <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
            <h1 className="text-3xl font-bold">Music Library</h1>

            {isScanning && (
                <p className="text-muted-foreground">Scanning inbox...</p>
            )}

            {error && (
                <div className="w-full max-w-6xl p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Error: {error}
                    </p>
                </div>
            )}

            {!isScanning && !error && scanResults.length > 0 && (
                <div className="w-full max-w-6xl">
                    <MusicTable data={scanResults} />
                </div>
            )}

            {!isScanning && !error && scanResults.length === 0 && (
                <p className="text-muted-foreground">No files found in inbox</p>
            )}
        </main>
    )
}