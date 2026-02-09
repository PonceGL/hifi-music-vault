import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FolderPicker } from "@/components/FolderPicker"
import { FolderOpen, Loader2, ArrowLeft } from "lucide-react"

interface ExportPlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlistName: string
  trackCount: number
  onConfirm: (destination: string, mode: 'copy' | 'move', preserveStructure: boolean) => Promise<void>
}

export function ExportPlaylistDialog({ 
    open, 
    onOpenChange, 
    playlistName, 
    trackCount, 
    onConfirm 
}: ExportPlaylistDialogProps) {
    const [mode, setMode] = useState<'copy' | 'move'>('copy')
    const [preserveStructure, setPreserveStructure] = useState(false)
    const [destination, setDestination] = useState<string | null>(null)
    const [isPickingFolder, setIsPickingFolder] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleConfirm = async () => {
        if (!destination) return
        setIsProcessing(true)
        try {
            await onConfirm(destination, mode, preserveStructure)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleFolderSelect = (path: string) => {
        setDestination(path)
        setIsPickingFolder(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                // Reset on close
                setIsPickingFolder(false)
            }
            onOpenChange(val)
        }}>
            <DialogContent className="bg-white">
                {isPickingFolder ? (
                    // --- Folder Selection View ---
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPickingFolder(false)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                Select Destination Folder
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                            <FolderPicker 
                                onSelect={handleFolderSelect}
                                initialPath={destination || undefined}
                            />
                        </div>
                    </>
                ) : (
                    // --- Main Config View ---
                    <>
                        <DialogHeader>
                            <DialogTitle>Export or Move Playlist</DialogTitle>
                            <DialogDescription>
                                Select an action for <strong>{trackCount} tracks</strong> in "{playlistName}".
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-6 py-4">
                            {/* Mode Selection */}
                            <div className="flex flex-col gap-3">
                                <Label>Action</Label>
                                <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'copy' | 'move')}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="copy" id="r-copy" />
                                        <Label htmlFor="r-copy">Copy (Keep originals)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="move" id="r-move" />
                                        <Label htmlFor="r-move" className="text-red-600 font-medium">Move (Remove from library)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Structure Option (Only for Move) */}
                            {mode === 'move' && (
                                <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                                    <Checkbox 
                                        id="structure" 
                                        checked={preserveStructure}
                                        onCheckedChange={(c) => setPreserveStructure(!!c)}
                                    />
                                    <div className="flex flex-col">
                                        <Label htmlFor="structure" className="cursor-pointer">Preserve Folder Structure</Label>
                                        <span className="text-xs text-muted-foreground">
                                            If checked, moves Artist/Album folders.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Destination Selection */}
                            <div className="flex flex-col gap-3">
                                <Label>Destination Folder</Label>
                                <div className="flex gap-2 w-full">
                                    <div 
                                        className="flex-1 h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center overflow-hidden"
                                        title={destination || "No folder selected"}
                                    >
                                        <span className="truncate text-muted-foreground w-full block">
                                            {destination || "No folder selected"}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="icon" onClick={() => setIsPickingFolder(true)} className="shrink-0">
                                        <FolderOpen className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {mode === 'move' && (
                                <div className="text-xs text-red-500">
                                    Warning: Tracks will be removed from your library database.
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button 
                                onClick={handleConfirm} 
                                disabled={!destination || isProcessing}
                                variant={mode === 'move' ? "destructive" : "default"}
                            >
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    mode === 'move' ? 'Move Files' : 'Copy Files'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
