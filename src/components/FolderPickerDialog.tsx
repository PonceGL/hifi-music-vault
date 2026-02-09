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
import { Folder, ArrowLeft, ChevronRight, Loader2 } from "lucide-react"

interface FolderPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (path: string) => void
  title?: string
}

interface DirectoryItem {
    name: string
    path: string
    type: 'directory'
}

interface BrowseResponse {
    currentPath: string
    parentPath: string
    directories: DirectoryItem[]
}

export function FolderPickerDialog({ open, onOpenChange, onSelect, title = "Select Folder" }: FolderPickerDialogProps) {
    const [currentPath, setCurrentPath] = useState<string>("/")
    const [history, setHistory] = useState<BrowseResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPath = async (path: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            const response = await fetch(`${apiUrl}/api/browse?path=${encodeURIComponent(path)}`)
            if (!response.ok) throw new Error("Failed to load directory")
            const data = await response.json()
            setHistory(data)
            setCurrentPath(data.currentPath)
        } catch(err) {
            console.error(err)
            setError("Failed to load folder")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            // Start at root or user home? Backend defaults to '/' if no query.
            // Maybe we can try to smart guess or just ask backend for a reasonable default.
            // For now, let's assume the user starts where the backend puts them (root or cwd).
            // Actually, let's start at a safe default if possible, or just root.
            fetchPath("/") 
        }
    }, [open])

    const handleNavigate = (path: string) => {
        fetchPath(path)
    }

    const handleSelectCurrent = () => {
        onSelect(currentPath)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Navigate to the destination folder and click "Select This Folder".
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center gap-2 p-2 bg-muted rounded overflow-hidden text-sm font-mono whitespace-nowrap">
                     <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                     <span className="truncate" title={currentPath}>{currentPath}</span>
                </div>

                <div className="flex-1 border rounded-md overflow-y-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <p>{error}</p>
                            <Button variant="link" onClick={() => fetchPath(currentPath)}>Retry</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                             {history?.parentPath && history.parentPath !== currentPath && (
                                <button 
                                    className="flex items-center gap-2 p-3 hover:bg-muted/50 text-left w-full border-b"
                                    onClick={() => handleNavigate(history.parentPath)}
                                >
                                    <ArrowLeft className="h-4 w-4 text-primary" />
                                    <span className="font-medium">.. (Up)</span>
                                </button>
                            )}
                            
                            {history?.directories.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No subfolders found.
                                </div>
                            )}

                            {history?.directories.map((dir) => (
                                <button
                                    key={dir.path}
                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 text-left w-full border-b last:border-0"
                                    onClick={() => handleNavigate(dir.path)}
                                >
                                    <Folder className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                                    <span className="flex-1 truncate">{dir.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <div className="flex gap-2">
                        {/* Option to create folder? Complexity.. skip for now unless requested */}
                        <Button onClick={handleSelectCurrent}>
                            Select This Folder
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
