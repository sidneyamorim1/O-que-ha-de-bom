import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'oQueHaDeBom.selecao'

function loadInitial() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { selectedAge: null, selectedColor: null }
    return JSON.parse(raw)
  } catch {
    return { selectedAge: null, selectedColor: null }
  }
}

export function AppProvider({ children }) {
  const [selectedAge, setSelectedAge] = useState(() => loadInitial().selectedAge)
  const [selectedColor, setSelectedColor] = useState(() => loadInitial().selectedColor)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedAge, selectedColor }))
    } catch {
      // sessionStorage indisponível (modo privado, etc.) — segue sem persistir
    }
  }, [selectedAge, selectedColor])

  function resetSelecao() {
    setSelectedAge(null)
    setSelectedColor(null)
  }

  return (
    <AppContext.Provider
      value={{ selectedAge, setSelectedAge, selectedColor, setSelectedColor, resetSelecao }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa estar dentro de um AppProvider')
  return ctx
}
