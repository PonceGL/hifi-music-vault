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
import { FolderPickerDialog } from "@/components/FolderPickerDialog"
import { FolderOpen, Loader2 } from "lucide-react"

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
    const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false)
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
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
                                        If checked, moves Artist/Album folders. If unchecked, moves only files.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Destination Selection */}
                        <div className="flex flex-col gap-3">
                            <Label>Destination Folder</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center overflow-hidden">
                                    <span className="truncate text-muted-foreground">
                                        {destination || "No folder selected"}
                                    </span>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setIsFolderPickerOpen(true)}>
                                    <FolderOpen className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {mode === 'move' && (
                            <div className="text-xs text-red-500">
                                Warning: Moving will delete this playlist and remove the tracks from your library database.
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
                </DialogContent>
            </Dialog>

            <FolderPickerDialog 
                open={isFolderPickerOpen} 
                onOpenChange={setIsFolderPickerOpen}
                onSelect={setDestination}
                title={mode === 'move' ? "Select Move Destination" : "Select Export Destination"}
            />
        </>
    )
}
