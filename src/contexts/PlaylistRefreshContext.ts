import { createContext } from 'react'

export interface PlaylistRefreshContextType {
  refreshKey: number
  triggerRefresh: () => void
}

export const PlaylistRefreshContext = createContext<PlaylistRefreshContextType | undefined>(undefined)
