import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutStore {
  sidebarWidth: number
  editorWidth: number
  rustyWidth: number
  setSidebarWidth: (w: number) => void
  setEditorWidth: (w: number) => void
  setRustyWidth: (w: number) => void
}

export const LIMITS = {
  sidebar: { min: 180, max: 420 },
  editor: { min: 280, max: 900 },
  rusty: { min: 320, max: 800 },
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarWidth: 240,
      editorWidth: 420,
      rustyWidth: 360,
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setEditorWidth: (editorWidth) => set({ editorWidth }),
      setRustyWidth: (rustyWidth) => set({ rustyWidth }),
    }),
    { name: 'restbox:layout' },
  ),
)
