import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Music, Search, Save, Pencil, X } from "lucide-react"
import { AlbumCover } from "@/components/AlbumCover"
import { Badge } from "@/components/ui/badge"
import { MusicBrainzSearchDialog, type SelectedMetadata } from "@/components/MusicBrainzSearchDialog"

interface TrackMetadata {
  format?: {
    container?: string
    codec?: string
    lossless?: boolean
    numberOfChannels?: number
    bitrate?: number
    sampleRate?: number
    duration?: number
    tagTypes?: string[]
  }
  common?: {
    title?: string
    artist?: string
    artists?: string[]
    album?: string
    albumartist?: string
    year?: number
    track?: { no?: number | null; of?: number | null }
    disk?: { no?: number | null; of?: number | null }
    genre?: string[]
    comment?: string[]
    composer?: string[]
    date?: string
    label?: string[]
    copyright?: string
    encodedby?: string
    isrc?: string[]
    barcode?: string
    catalognumber?: string[]
    media?: string
    originaldate?: string
    originalyear?: number
    releasecountry?: string
    script?: string
    language?: string
    asin?: string
    musicbrainz_albumid?: string
    musicbrainz_recordingid?: string
    musicbrainz_trackid?: string
    musicbrainz_artistid?: string[]
  }
  native?: Record<string, unknown>
}

interface EditableFields {
  title: string
  artist: string
  album: string
  year: string
  genre: string
}

export function TrackDetailPage() {
  const { trackPath } = useParams<{ trackPath: string }>()
  const navigate = useNavigate()

  const [metadata, setMetadata] = useState<TrackMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editable metadata state
  const [isEditing, setIsEditing] = useState(false)
  const [editFields, setEditFields] = useState<EditableFields>({ title: "", artist: "", album: "", year: "", genre: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // MusicBrainz dialog
  const [mbDialogOpen, setMbDialogOpen] = useState(false)

  const decodedTrackPath = trackPath ? decodeURIComponent(trackPath) : null

  const fetchMetadata = useCallback(async () => {
    if (!decodedTrackPath) return
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const response = await fetch(
        `${apiUrl}/api/tracks/metadata?trackPath=${encodeURIComponent(decodedTrackPath)}`
      )
      if (!response.ok) throw new Error("Failed to fetch track metadata")
      const data = await response.json()
      setMetadata(data.metadata)
    } catch (err) {
      console.error(err)
      setError("Failed to load track details")
    } finally {
      setIsLoading(false)
    }
  }, [decodedTrackPath])

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  // Sync edit fields when metadata loads or changes
  useEffect(() => {
    if (metadata?.common) {
      setEditFields({
        title: metadata.common.title || "",
        artist: metadata.common.artist || metadata.common.artists?.join(", ") || "",
        album: metadata.common.album || "",
        year: metadata.common.year?.toString() || metadata.common.date?.substring(0, 4) || "",
        genre: metadata.common.genre?.join("; ") || ""
      })
    }
  }, [metadata])

  const handleStartEdit = () => {
    setIsEditing(true)
    setSaveMessage(null)
  }

  const handleCancelEdit = () => {
    // Reset fields to current metadata
    if (metadata?.common) {
      setEditFields({
        title: metadata.common.title || "",
        artist: metadata.common.artist || metadata.common.artists?.join(", ") || "",
        album: metadata.common.album || "",
        year: metadata.common.year?.toString() || metadata.common.date?.substring(0, 4) || "",
        genre: metadata.common.genre?.join("; ") || ""
      })
    }
    setIsEditing(false)
    setSaveMessage(null)
  }

  const handleSave = async () => {
    if (!decodedTrackPath) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
      const response = await fetch(`${apiUrl}/api/tracks/metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackPath: decodedTrackPath,
          metadata: {
            title: editFields.title || undefined,
            artist: editFields.artist || undefined,
            album: editFields.album || undefined,
            year: editFields.year || undefined,
            genre: editFields.genre || undefined,
          }
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save metadata")
      }

      setSaveMessage("Metadata saved successfully!")
      setIsEditing(false)

      // Re-fetch metadata to show updated data
      await fetchMetadata()
    } catch (err: any) {
      console.error(err)
      setSaveMessage(`Error: ${err.message || "Failed to save"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMusicBrainzSelect = (mbData: SelectedMetadata) => {
    setEditFields(prev => ({
      title: mbData.title || prev.title,
      artist: mbData.artist || prev.artist,
      album: mbData.album || prev.album,
      year: mbData.year || prev.year,
      genre: mbData.genre || prev.genre
    }))
    setIsEditing(true)
    setSaveMessage(null)
  }

  const openMusicBrainzSearch = () => {
    setMbDialogOpen(true)
  }

  // Detect if metadata is missing
  const hasUnknownFields =
    !metadata?.common?.title ||
    !metadata?.common?.artist ||
    !metadata?.common?.album

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return "Unknown"
    return `${Math.round(bitrate / 1000)} kbps`
  }

  const formatSampleRate = (sampleRate?: number) => {
    if (!sampleRate) return "Unknown"
    return `${(sampleRate / 1000).toFixed(1)} kHz`
  }

  if (isLoading) {
    return (
      <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
        <div className="flex flex-col items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-2">Loading track details...</p>
        </div>
      </main>
    )
  }

  if (error || !metadata) {
    return (
      <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
        <div className="w-full max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              {error || "Track not found"}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { common, format } = metadata
  const displayTitle = isEditing ? editFields.title : (common?.title || "Unknown Title")
  const displayArtist = isEditing ? editFields.artist : (common?.artist || common?.artists?.join(", ") || "Unknown Artist")
  const displayAlbum = isEditing ? editFields.album : (common?.album || "Unknown Album")
  const displayYear = isEditing ? editFields.year : (common?.year?.toString() || common?.date?.substring(0, 4) || "")

  return (
    <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Metadata
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={openMusicBrainzSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search MusicBrainz
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Save feedback message */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
            saveMessage.startsWith("Error")
              ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Unknown fields alert */}
        {hasUnknownFields && !isEditing && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This track has missing metadata. You can search MusicBrainz to auto-fill or edit manually.
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={handleStartEdit}>
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button size="sm" onClick={openMusicBrainzSearch}>
                <Search className="mr-1 h-3 w-3" />
                Search
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Header Section with Album Art */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              {decodedTrackPath ? (
                <AlbumCover trackPath={decodedTrackPath} size="lg" />
              ) : (
                <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center">
                  <Music className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <Input
                      value={editFields.title}
                      onChange={(e) => setEditFields(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Title"
                      className="text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Artist</label>
                    <Input
                      value={editFields.artist}
                      onChange={(e) => setEditFields(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Artist"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Album</label>
                    <Input
                      value={editFields.album}
                      onChange={(e) => setEditFields(prev => ({ ...prev, album: e.target.value }))}
                      placeholder="Album"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                    <Input
                      value={editFields.year}
                      onChange={(e) => setEditFields(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="Year"
                      className="max-w-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Genre</label>
                    <Input
                      value={editFields.genre}
                      onChange={(e) => setEditFields(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="Genre (e.g. Rock; Electronic)"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={openMusicBrainzSearch} className="mt-2">
                    <Search className="mr-2 h-4 w-4" />
                    Auto-fill from MusicBrainz
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-2 truncate">
                    {displayTitle}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-2">
                    {displayArtist}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {displayAlbum}
                  </p>
                  {displayYear && (
                    <p className="text-sm text-muted-foreground mt-1">{displayYear}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Track Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formatDuration(format?.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium uppercase">
                  {format?.container || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Codec</p>
                <p className="font-medium">{format?.codec || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <p className="font-medium">
                  {format?.lossless ? "Lossless" : "Lossy"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bitrate</p>
                <p className="font-medium">{formatBitrate(format?.bitrate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sample Rate</p>
                <p className="font-medium">{formatSampleRate(format?.sampleRate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Channels</p>
                <p className="font-medium">
                  {format?.numberOfChannels || "Unknown"}
                </p>
              </div>
              {common?.track?.no && (
                <div>
                  <p className="text-sm text-muted-foreground">Track Number</p>
                  <p className="font-medium">
                    {common.track.no}
                    {common.track.of ? ` / ${common.track.of}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Genre Section */}
          {common?.genre && common.genre.length > 0 && (
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {common.genre.map((g, i) => (
                  <Badge key={i} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Metadata Section */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 gap-3">
              {common?.albumartist && (
                <div>
                  <p className="text-sm text-muted-foreground">Album Artist</p>
                  <p className="font-medium">{common.albumartist}</p>
                </div>
              )}
              {common?.composer && common.composer.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Composer</p>
                  <p className="font-medium">{common.composer.join(", ")}</p>
                </div>
              )}
              {common?.label && common.label.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Label</p>
                  <p className="font-medium">{common.label.join(", ")}</p>
                </div>
              )}
              {common?.date && (
                <div>
                  <p className="text-sm text-muted-foreground">Release Date</p>
                  <p className="font-medium">{common.date}</p>
                </div>
              )}
              {common?.originaldate && (
                <div>
                  <p className="text-sm text-muted-foreground">Original Date</p>
                  <p className="font-medium">{common.originaldate}</p>
                </div>
              )}
              {common?.releasecountry && (
                <div>
                  <p className="text-sm text-muted-foreground">Release Country</p>
                  <p className="font-medium">{common.releasecountry}</p>
                </div>
              )}
              {common?.copyright && (
                <div>
                  <p className="text-sm text-muted-foreground">Copyright</p>
                  <p className="font-medium text-sm">{common.copyright}</p>
                </div>
              )}
              {common?.encodedby && (
                <div>
                  <p className="text-sm text-muted-foreground">Encoded By</p>
                  <p className="font-medium">{common.encodedby}</p>
                </div>
              )}
              {common?.isrc && common.isrc.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">ISRC</p>
                  <p className="font-medium">{common.isrc.join(", ")}</p>
                </div>
              )}
              {common?.barcode && (
                <div>
                  <p className="text-sm text-muted-foreground">Barcode</p>
                  <p className="font-medium">{common.barcode}</p>
                </div>
              )}
              {common?.catalognumber && common.catalognumber.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Catalog Number</p>
                  <p className="font-medium">{common.catalognumber.join(", ")}</p>
                </div>
              )}
              {common?.comment && common.comment.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="font-medium text-sm">{common.comment.join(" ")}</p>
                </div>
              )}
            </div>
          </div>

          {/* File Path Section */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">File Information</h2>
            <div>
              <p className="text-sm text-muted-foreground">File Path</p>
              <p className="font-mono text-sm break-all">{decodedTrackPath}</p>
            </div>
            {format?.tagTypes && format.tagTypes.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Tag Types</p>
                <p className="font-medium">{format.tagTypes.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MusicBrainz Search Dialog */}
      <MusicBrainzSearchDialog
        open={mbDialogOpen}
        onOpenChange={setMbDialogOpen}
        initialQuery={{
          title: editFields.title || undefined,
          artist: editFields.artist || undefined,
          album: editFields.album || undefined,
        }}
        onSelect={handleMusicBrainzSelect}
      />
    </main>
  )
}
