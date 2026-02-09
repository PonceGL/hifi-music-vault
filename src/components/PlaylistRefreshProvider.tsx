import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { PlaylistRefreshContext } from '@/contexts/PlaylistRefreshContext'

export function PlaylistRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <PlaylistRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </PlaylistRefreshContext.Provider>
  )
}
