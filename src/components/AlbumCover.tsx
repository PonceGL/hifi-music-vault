import { useState } from "react"
import { Music } from "lucide-react"

interface AlbumCoverProps {
  trackPath: string
  size?: "sm" | "md" | "lg"
}

export function AlbumCover({ trackPath, size = "sm" }: AlbumCoverProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
  const coverUrl = `${apiUrl}/api/tracks/cover?trackPath=${encodeURIComponent(trackPath)}`

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (hasError) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-md bg-muted flex items-center justify-center flex-shrink-0`}
      >
        <Music className={`${iconSizes[size]} text-muted-foreground`} />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-muted flex-shrink-0 relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Music className={`${iconSizes[size]} text-muted-foreground animate-pulse`} />
        </div>
      )}
      <img
        src={coverUrl}
        alt="Album cover"
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}
