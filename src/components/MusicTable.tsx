import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useMusicTable, type ScanResult, type SortField } from "@/hooks/useMusicTable"

interface MusicTableProps {
    data: ScanResult[]
    enableSelection?: boolean
    selectedTracks?: Set<string> // Set of absolute file paths
    onSelectionChange?: (selected: Set<string>) => void
}

export function MusicTable({ 
    data, 
    enableSelection = false, 
    selectedTracks = new Set(), 
    onSelectionChange 
}: MusicTableProps) {
    const {
        data: sortedData,
        searchQuery,
        setSearchQuery,
        sortField,
        sortDirection,
        handleSort,
        totalCount,
        filteredCount,
        filteredData,
    } = useMusicTable(data)

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        )
    }

    const handleSelectAll = (checked: boolean) => {
        if (!onSelectionChange) return
        
        if (checked) {
            const allFiles = new Set(filteredData.map(item => item.file))
            onSelectionChange(allFiles)
        } else {
            onSelectionChange(new Set())
        }
    }

    const handleSelectRow = (file: string, checked: boolean) => {
        if (!onSelectionChange) return
        
        const newSelection = new Set(selectedTracks)
        if (checked) {
            newSelection.add(file)
        } else {
            newSelection.delete(file)
        }
        onSelectionChange(newSelection)
    }

    const allSelected = filteredData.length > 0 && filteredData.every(item => selectedTracks.has(item.file))
    const isIndeterminate = filteredData.some(item => selectedTracks.has(item.file)) && !allSelected

    return (
        <div className="w-full space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, artist, album, or genre..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {enableSelection && selectedTracks.size > 0 
                        ? `${selectedTracks.size} selected`
                        : `Showing ${filteredCount} of ${totalCount} tracks`
                    }
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {enableSelection && (
                                <TableHead className="w-[40px]">
                                    <Checkbox 
                                        checked={allSelected || (isIndeterminate ? "indeterminate" : false)}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    />
                                </TableHead>
                            )}
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("title")}
                                    className="h-8 px-2 hover:bg-transparent"
                                >
                                    Title
                                    {getSortIcon("title")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("artist")}
                                    className="h-8 px-2 hover:bg-transparent"
                                >
                                    Artist
                                    {getSortIcon("artist")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("album")}
                                    className="h-8 px-2 hover:bg-transparent"
                                >
                                    Album
                                    {getSortIcon("album")}
                                </Button>
                            </TableHead>
                            <TableHead className="w-[80px]">Year</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("genre")}
                                    className="h-8 px-2 hover:bg-transparent"
                                >
                                    Genre
                                    {getSortIcon("genre")}
                                </Button>
                            </TableHead>
                            <TableHead className="w-[80px]">Format</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    {searchQuery ? "No tracks found matching your search." : "No tracks available."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedData.map((item) => (
                                <TableRow key={item.file} data-state={selectedTracks.has(item.file) ? "selected" : undefined}>
                                    {enableSelection && (
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedTracks.has(item.file)}
                                                onCheckedChange={(checked) => handleSelectRow(item.file, !!checked)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">
                                        {item.metadata.title}
                                    </TableCell>
                                    <TableCell>{item.metadata.artist}</TableCell>
                                    <TableCell>{item.metadata.album}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.metadata.year || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.metadata.genre.map((g, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                                >
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground uppercase">
                                        {item.metadata.format.replace(".", "")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
