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
import { useMusicTable, type ScanResult, type SortField } from "@/hooks/useMusicTable"

interface MusicTableProps {
    data: ScanResult[]
}

export function MusicTable({ data }: MusicTableProps) {
    const {
        data: sortedData,
        searchQuery,
        setSearchQuery,
        sortField,
        sortDirection,
        handleSort,
        totalCount,
        filteredCount,
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
                    Showing {filteredCount} of {totalCount} tracks
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
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
                                <TableRow key={item.file}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {item.metadata.trackNo}
                                    </TableCell>
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
