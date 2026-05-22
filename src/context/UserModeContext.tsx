import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserMode = 'basic' | 'standard' | 'expert'

interface UserModeContextType {
  mode: UserMode
  setMode: (mode: UserMode) => void
}

const UserModeContext = createContext<UserModeContextType | null>(null)

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UserMode>('basic')

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