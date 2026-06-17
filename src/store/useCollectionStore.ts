import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Collection, RequestConfig } from '@/types'
import { storage, STORAGE_KEYS } from '@/utils/storage'

interface CollectionStore {
  collections: Collection[]
  activeCollectionId: string | null
  createCollection: (name: string) => string
  deleteCollection: (id: string) => void
  renameCollection: (id: string, name: string) => void
  addRequest: (collectionId: string, request: RequestConfig) => void
  removeRequest: (collectionId: string, requestId: string) => void
  setActive: (id: string | null) => void
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set) => ({
      collections: [],
      activeCollectionId: null,
      createCollection: (name) => {
        const id = uuid()
        const collection: Collection = {
          id,
          name: name.trim() || 'New Collection',
          requests: [],
          createdAt: Date.now(),
        }
        set((s) => ({ collections: [...s.collections, collection], activeCollectionId: id }))
        return id
      },
      deleteCollection: (id) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          activeCollectionId: s.activeCollectionId === id ? null : s.activeCollectionId,
        })),
      renameCollection: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
      addRequest: (collectionId, request) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: [...c.requests.filter((r) => r.id !== request.id), { ...request }] }
              : c,
          ),
        })),
      removeRequest: (collectionId, requestId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) } : c,
          ),
        })),
      setActive: (id) => set({ activeCollectionId: id }),
    }),
    {
      name: 'restbox:' + STORAGE_KEYS.collections,
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
