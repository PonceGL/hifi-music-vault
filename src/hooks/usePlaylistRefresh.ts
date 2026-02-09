import { useContext } from 'react'
import { PlaylistRefreshContext, type PlaylistRefreshContextType } from '@/contexts/PlaylistRefreshContext'

export function usePlaylistRefresh(): PlaylistRefreshContextType {
  const context = useContext(PlaylistRefreshContext)
  if (context === undefined) {
    throw new Error('usePlaylistRefresh must be used within a PlaylistRefreshProvider')
  }
  return context
}
