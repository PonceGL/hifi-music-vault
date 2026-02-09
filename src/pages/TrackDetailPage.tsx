import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Music } from "lucide-react"
import { AlbumCover } from "@/components/AlbumCover"
import { Badge } from "@/components/ui/badge"

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

export function TrackDetailPage() {
  const { trackPath } = useParams<{ trackPath: string }>()
  const navigate = useNavigate()

  const [metadata, setMetadata] = useState<TrackMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedTrackPath = trackPath ? decodeURIComponent(trackPath) : null

  useEffect(() => {
    if (!decodedTrackPath) return

    const fetchMetadata = async () => {
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
    }

    fetchMetadata()
  }, [decodedTrackPath])

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

  return (
    <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
      <div className="w-full max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

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
              <h1 className="text-3xl font-bold mb-2 truncate">
                {common?.title || "Unknown Title"}
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                {common?.artist || common?.artists?.join(", ") || "Unknown Artist"}
              </p>
              <p className="text-lg text-muted-foreground">
                {common?.album || "Unknown Album"}
              </p>
              {common?.year && (
                <p className="text-sm text-muted-foreground mt-1">{common.year}</p>
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
    </main>
  )
}
