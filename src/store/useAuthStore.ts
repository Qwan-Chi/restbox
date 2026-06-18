import { create } from 'zustand'
import type { AuthUser } from '@/types'
import { storage } from '@/utils/storage'

const AUTH_KEY = 'auth'

function loadUser(): AuthUser | null {
  return storage.get<AuthUser>(AUTH_KEY)
}

interface AuthStore {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: loadUser(),
  login: (user) => {
    storage.set(AUTH_KEY, user)
    set({ user })
  },
  logout: () => {
    storage.remove(AUTH_KEY)
    set({ user: null })
  },
}))
