import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpenObject {
  id: string
  type: 'task' | 'request' | 'document' | 'file' | 'form' | 'search'
  label: string
  fullLabel: string
  route: string
}

interface OpenObjectsContextValue {
  objects: OpenObject[]
  activeId: string | null
  openObject: (obj: OpenObject) => void
  closeObject: (id: string) => void
  setActive: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OpenObjectsContext = createContext<OpenObjectsContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OpenObjectsProvider({ children }: { children: ReactNode }) {
  const [objects, setObjects] = useState<OpenObject[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const navigate = useNavigate()

  const openObject = useCallback((obj: OpenObject) => {
    setObjects(prev => {
      const exists = prev.some(o => o.id === obj.id)
      if (exists) return prev.map(o => o.id === obj.id ? obj : o)
      return [...prev, obj]
    })
    setActiveId(obj.id)
  }, [])

  const closeObject = useCallback((id: string) => {
    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id)
      const next = prev.filter(o => o.id !== id)

      if (id === activeId) {
        if (idx > 0) {
          const prevObj = prev[idx - 1]
          setActiveId(prevObj.id)
          navigate(prevObj.route)
        } else if (next.length > 0) {
          setActiveId(next[0].id)
          navigate(next[0].route)
        } else {
          setActiveId(null)
        }
      }

      return next
    })
  }, [activeId, navigate])

  const setActive = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  return (
    <OpenObjectsContext.Provider value={{ objects, activeId, openObject, closeObject, setActive }}>
      {children}
    </OpenObjectsContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOpenObjects() {
  const ctx = useContext(OpenObjectsContext)
  if (!ctx) throw new Error('useOpenObjects must be used within OpenObjectsProvider')
  return ctx
}
