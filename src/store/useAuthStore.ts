import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'
import { storage } from '@/utils/storage'

interface AuthStore {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'restbox:auth',
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
