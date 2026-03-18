import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderIcon, ChevronRightIcon, HomeIcon } from "lucide-react"

interface Directory {
    name: string
    path: string
    type: "directory"
}

interface BrowseResponse {
    currentPath: string
    parentPath: string
    directories: Directory[]
}

interface FolderPickerProps {
    onSelect: (path: string) => void
    initialPath?: string
}

const INITIAL_PATH = "/"

export function FolderPicker({ onSelect, initialPath = INITIAL_PATH }: FolderPickerProps) {
    const [currentPath, setCurrentPath] = useState<string>(initialPath)
    const [parentPath, setParentPath] = useState<string>(INITIAL_PATH)
    const [directories, setDirectories] = useState<Directory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadDirectories(currentPath)
    }, [currentPath])

    const loadDirectories = async (path: string) => {
        setLoading(true)
        setError(null)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            const response = await fetch(
                `${apiUrl}/api/browse?path=${encodeURIComponent(path)}`
            )

            if (!response.ok) {
                throw new Error("Failed to load directories")
            }

            const data: BrowseResponse = await response.json()
            setCurrentPath(data.currentPath)
            setParentPath(data.parentPath)
            setDirectories(data.directories)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error")
            console.error("Error loading directories:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleNavigate = (path: string) => {
        setCurrentPath(path)
    }

    const handleSelectCurrent = () => {
        onSelect(currentPath)
    }

    const goToParent = () => {
        if (currentPath !== parentPath) {
            handleNavigate(parentPath)
        }
    }

    const goToHome = () => {
        handleNavigate(INITIAL_PATH)
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-2xl">
            {/* Header with current path */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToHome}
                    title="Go to home directory"
                    disabled={loading || currentPath === INITIAL_PATH}
                >
                    <HomeIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToParent}
                    disabled={loading || currentPath === INITIAL_PATH}
                >
                    ↑ Parent
                </Button>
                <div className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono truncate">
                    {currentPath}
                </div>
            </div>

            {/* Directory list */}
            <div className="border rounded-md min-h-[300px] max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-32 text-destructive">
                        Error: {error}
                    </div>
                ) : directories.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No subdirectories found
                    </div>
                ) : (
                    <div className="divide-y">
                        {directories.map((dir) => (
                            <button
                                key={dir.path}
                                onClick={() => handleNavigate(dir.path)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors text-left"
                            >
                                <FolderIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <span className="flex-1 truncate">{dir.name}</span>
                                <ChevronRightIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    onClick={handleSelectCurrent}
                    disabled={loading || currentPath === INITIAL_PATH}
                >
                    Select "{currentPath.split("/").pop() || currentPath}"
                </Button>
            </div>
        </div>
    )
}
