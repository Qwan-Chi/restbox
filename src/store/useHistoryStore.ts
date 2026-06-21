import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryItem } from '@/types'
import { storage, STORAGE_KEYS } from '@/utils/storage'

const MAX_ITEMS = 100

interface HistoryStore {
  items: HistoryItem[]
  add: (item: HistoryItem) => void
  rename: (id: string, name: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const items = [item, ...s.items].slice(0, MAX_ITEMS)
          return { items }
        }),
      rename: (id, name) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, name: name.trim() } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'restbox:' + STORAGE_KEYS.history,
      storage: {
        getItem: (name) => {
          const raw = storage.get(name.replace('restbox:', ''))
          return raw ? { state: raw, version: 0 } : null
        },
        setItem: (name, value) => storage.set(name.replace('restbox:', ''), (value as { state: unknown }).state),
        removeItem: (name) => storage.remove(name.replace('restbox:', '')),
      },
    },
  ),
)
