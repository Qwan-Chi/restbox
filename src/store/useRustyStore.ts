import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Anomaly, ChatSession, RustyMessage, RustyStatus } from '@/types'
import { storage } from '@/utils/storage'

const DEFAULT_TITLE = 'Новый чат'

function newSession(): ChatSession {
  const now = Date.now()
  return {
    id: uuid(),
    title: DEFAULT_TITLE,
    messages: [],
    autoAnalyzedFor: null,
    createdAt: now,
    updatedAt: now,
  }
}

interface RustyStore {
  sessions: ChatSession[]
  activeSessionId: string
  status: RustyStatus
  lastAnomalies: Anomaly[]

  createSession: () => string
  deleteSession: (id: string) => void
  setActiveSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  touchTitle: (title: string) => void

  setStatus: (status: RustyStatus) => void
  setAnomalies: (anomalies: Anomaly[]) => void

  addUserMessage: (content: string) => string
  addRustyMessage: () => string
  appendToMessage: (id: string, chunk: string) => void
  finalizeMessage: (id: string) => void
  setMessage: (id: string, content: string) => void
  clearActive: () => void
}

function patchActive(s: RustyStore, fn: (session: ChatSession) => ChatSession): Partial<RustyStore> {
  return {
    sessions: s.sessions.map((sess) => (sess.id === s.activeSessionId ? fn(sess) : sess)),
  }
}

const initialSession = newSession()

export const useRustyStore = create<RustyStore>()(
  persist(
    (set) => ({
      sessions: [initialSession],
      activeSessionId: initialSession.id,
      status: 'idle',
      lastAnomalies: [],

      createSession: () => {
        const session = newSession()
        set((s) => ({ sessions: [session, ...s.sessions], activeSessionId: session.id, status: 'idle' }))
        return session.id
      },
      deleteSession: (id) =>
        set((s) => {
          if (s.sessions.length <= 1) {
            const fresh = newSession()
            return { sessions: [fresh], activeSessionId: fresh.id }
          }
          const sessions = s.sessions.filter((sess) => sess.id !== id)
          const activeSessionId = s.activeSessionId === id ? sessions[0].id : s.activeSessionId
          return { sessions, activeSessionId }
        }),
      setActiveSession: (id) => set({ activeSessionId: id, status: 'idle' }),
      renameSession: (id, title) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => (sess.id === id ? { ...sess, title, updatedAt: Date.now() } : sess)),
        })),
      touchTitle: (title) =>
        set((s) =>
          patchActive(s, (sess) =>
            sess.title === DEFAULT_TITLE && title.trim()
              ? { ...sess, title: title.trim().slice(0, 50), updatedAt: Date.now() }
              : sess,
          ),
        ),

      setStatus: (status) => set({ status }),
      setAnomalies: (lastAnomalies) => set({ lastAnomalies }),

      addUserMessage: (content) => {
        const id = uuid()
        const message: RustyMessage = { id, role: 'user', content, timestamp: Date.now() }
        set((s) =>
          patchActive(s, (sess) => ({
            ...sess,
            messages: [...sess.messages, message],
            updatedAt: Date.now(),
          })),
        )
        return id
      },
      addRustyMessage: () => {
        const id = uuid()
        const message: RustyMessage = { id, role: 'rusty', content: '', timestamp: Date.now(), isStreaming: true }
        set((s) =>
          patchActive(s, (sess) => ({
            ...sess,
            messages: [...sess.messages, message],
            updatedAt: Date.now(),
          })),
        )
        return id
      },
      appendToMessage: (id, chunk) =>
        set((s) =>
          patchActive(s, (sess) => ({
            ...sess,
            messages: sess.messages.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
            updatedAt: Date.now(),
          })),
        ),
      finalizeMessage: (id) =>
        set((s) =>
          patchActive(s, (sess) => ({
            ...sess,
            messages: sess.messages.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)),
          })),
        ),
      setMessage: (id, content) =>
        set((s) =>
          patchActive(s, (sess) => ({
            ...sess,
            messages: sess.messages.map((m) => (m.id === id ? { ...m, content } : m)),
          })),
        ),
      clearActive: () =>
        set((s) => ({
          status: 'idle',
          sessions: s.sessions.map((sess) =>
            sess.id === s.activeSessionId
              ? { ...sess, messages: [], autoAnalyzedFor: null, title: DEFAULT_TITLE, updatedAt: Date.now() }
              : sess,
          ),
        })),
    }),
    {
      name: 'restbox:rusty-sessions',
      storage: {
        getItem: (name) => {
          const raw = storage.get(name.replace('restbox:', ''))
          return raw ? { state: raw, version: 0 } : null
        },
        setItem: (name, value) => storage.set(name.replace('restbox:', ''), (value as { state: unknown }).state),
        removeItem: (name) => storage.remove(name.replace('restbox:', '')),
      },
      partialize: (s) => ({
        sessions: s.sessions,
        activeSessionId: s.activeSessionId,
      }),
    },
  ),
)

export { DEFAULT_TITLE }
