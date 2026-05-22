import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type HighlightZone = 'search' | 'sidebar' | 'content' | 'mode' | 'help' | 'documents' | null

interface TourHighlightContextValue {
  zone: HighlightZone
  setZone: (zone: HighlightZone) => void
}

const TourHighlightContext = createContext<TourHighlightContextValue>({
  zone: null,
  setZone: () => {},
})

export function TourHighlightProvider({ children }: { children: ReactNode }) {
  const [zone, setZone] = useState<HighlightZone>(null)
  return (
    <TourHighlightContext.Provider value={{ zone, setZone }}>
      {children}
    </TourHighlightContext.Provider>
  )
}

export function useTourHighlight() {
  return useContext(TourHighlightContext)
}
