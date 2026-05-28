import { createContext, useContext, useState, type ReactNode } from 'react'
import { track } from '../utils/analytics'

export type UserMode = 'basic' | 'standard' | 'expert'

interface UserModeContextType {
  mode: UserMode
  setMode: (mode: UserMode) => void
}

const UserModeContext = createContext<UserModeContextType | null>(null)

export function UserModeProvider({ children }: { children: ReactNode }) {
  const saved = localStorage.getItem('corpOsMode') as UserMode
  const initial: UserMode = ['basic', 'standard', 'expert'].includes(saved) ? saved : 'basic'
  const [mode, setModeState] = useState<UserMode>(initial)

  function setMode(m: UserMode) {
    localStorage.setItem('corpOsMode', m)
    setModeState(m)
    track('mode-switched', { mode: m })
  }

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  )
}

export function useUserMode() {
  const ctx = useContext(UserModeContext)

  if (!ctx) {
    throw new Error('useUserMode must be used within UserModeProvider')
  }

  return ctx
}