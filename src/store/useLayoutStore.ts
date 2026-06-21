import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutStore {
  sidebarWidth: number
  editorWidth: number
  rustyWidth: number
  sidebarCollapsed: boolean
  rustyCollapsed: boolean
  mobileTab: 'sidebar' | 'editor' | 'rusty'
  setSidebarWidth: (w: number) => void
  setEditorWidth: (w: number) => void
  setRustyWidth: (w: number) => void
  toggleSidebar: () => void
  toggleRusty: () => void
  setMobileTab: (tab: 'sidebar' | 'editor' | 'rusty') => void
}

export const LIMITS = {
  sidebar: { min: 180, max: 360 },
  editor: { min: 280, max: 700 },
  rusty: { min: 360, max: 600 },
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      sidebarWidth: 240,
      editorWidth: 420,
      rustyWidth: 360,
      sidebarCollapsed: false,
      rustyCollapsed: false,
      mobileTab: 'editor',
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setEditorWidth: (editorWidth) => set({ editorWidth }),
      setRustyWidth: (rustyWidth) => set({ rustyWidth }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      toggleRusty: () => set({ rustyCollapsed: !get().rustyCollapsed }),
      setMobileTab: (mobileTab) => set({ mobileTab }),
    }),
    {
      name: 'restbox:layout',
      partialize: (s) => ({
        sidebarWidth: s.sidebarWidth,
        editorWidth: s.editorWidth,
        rustyWidth: s.rustyWidth,
        sidebarCollapsed: s.sidebarCollapsed,
        rustyCollapsed: s.rustyCollapsed,
      }),
    },
  ),
)
