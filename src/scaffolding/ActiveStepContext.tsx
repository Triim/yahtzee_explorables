import { createContext, useContext, useState, type ReactNode } from 'react'

interface ActiveStepContextType {
  activeStepId: string | null
  setActiveStepId: (id: string | null) => void
  activeSceneId: string | null
  setActiveSceneId: (id: string | null) => void
}

const ActiveStepContext = createContext<ActiveStepContextType | undefined>(undefined)

export function ActiveStepProvider({ children }: { children: ReactNode }) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)

  return (
    <ActiveStepContext.Provider
      value={{
        activeStepId,
        setActiveStepId,
        activeSceneId,
        setActiveSceneId,
      }}
    >
      {children}
    </ActiveStepContext.Provider>
  )
}

export function useActiveStepContext() {
  const context = useContext(ActiveStepContext)
  if (context === undefined) {
    throw new Error('useActiveStepContext must be used within ActiveStepProvider')
  }
  return context
}
