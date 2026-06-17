import { useCallback, useRef } from 'react'
import { useRustyStore } from '@/store/useRustyStore'
import { useRequestStore } from '@/store/useRequestStore'
import { streamRustyResponse } from '@/services/rusty'
import type { RustyContext } from '@/types'

function buildContext(): RustyContext {
  const reqStore = useRequestStore.getState()
  const rustyStore = useRustyStore.getState()
  return {
    request: reqStore.current,
    response: reqStore.response,
    anomalies: rustyStore.lastAnomalies,
  }
}

function activeMessages(): Array<{ role: string; content: string }> {
  const s = useRustyStore.getState()
  const session = s.sessions.find((x) => x.id === s.activeSessionId)
  return (session?.messages ?? [])
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))
}

export function useRusty() {
  const sessions = useRustyStore((s) => s.sessions)
  const activeSessionId = useRustyStore((s) => s.activeSessionId)
  const status = useRustyStore((s) => s.status)
  const lastAnomalies = useRustyStore((s) => s.lastAnomalies)
  const activeSession = sessions.find((x) => x.id === activeSessionId) ?? null
  const messages = activeSession?.messages ?? []

  const addRustyMessage = useRustyStore((s) => s.addRustyMessage)
  const appendToMessage = useRustyStore((s) => s.appendToMessage)
  const finalizeMessage = useRustyStore((s) => s.finalizeMessage)
  const setMessage = useRustyStore((s) => s.setMessage)
  const setStatus = useRustyStore((s) => s.setStatus)
  const addUserMessage = useRustyStore((s) => s.addUserMessage)
  const touchTitle = useRustyStore((s) => s.touchTitle)

  const createSession = useRustyStore((s) => s.createSession)
  const deleteSession = useRustyStore((s) => s.deleteSession)
  const setActiveSession = useRustyStore((s) => s.setActiveSession)
  const renameSession = useRustyStore((s) => s.renameSession)
  const clearActive = useRustyStore((s) => s.clearActive)

  const abortRef = useRef<AbortController | null>(null)

  const stream = useCallback(
    async (userMessages: Array<{ role: string; content: string }>) => {
      const controller = new AbortController()
      abortRef.current = controller
      const rustyId = addRustyMessage()
      setStatus('thinking')

      let gotAny = false
      try {
        for await (const chunk of streamRustyResponse(userMessages, buildContext(), controller.signal)) {
          gotAny = true
          appendToMessage(rustyId, chunk)
        }
        setStatus('online')
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          setStatus('online')
        } else {
          setStatus('error')
          setMessage(rustyId, `⚠️ Ошибка: ${e instanceof Error ? e.message : String(e)}`)
        }
      } finally {
        finalizeMessage(rustyId)
        abortRef.current = null
      }
      return gotAny
    },
    [addRustyMessage, setStatus, appendToMessage, setMessage, finalizeMessage],
  )

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      addUserMessage(trimmed)
      touchTitle(trimmed)
      await stream(activeMessages())
    },
    [addUserMessage, touchTitle, stream],
  )

  const autoAnalyze = useCallback(async () => {
    const state = useRequestStore.getState()
    if (!state.response) return
    const rustyState = useRustyStore.getState()
    const session = rustyState.sessions.find((x) => x.id === rustyState.activeSessionId)
    if (!session) return
    const respKey = `${state.response.timestamp}:${state.response.status}`
    if (session.autoAnalyzedFor === respKey) return
    renameSession(session.id, session.title)
    useRustyStore.setState((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === session.id ? { ...sess, autoAnalyzedFor: respKey } : sess,
      ),
    }))
    touchTitle(`${state.current.method} ${state.current.url || 'запрос'}`)
    await stream(activeMessages())
  }, [stream, renameSession, touchTitle])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const newChat = useCallback(() => {
    abortRef.current?.abort()
    createSession()
  }, [createSession])

  const switchChat = useCallback(
    (id: string) => {
      abortRef.current?.abort()
      setActiveSession(id)
    },
    [setActiveSession],
  )

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    status,
    lastAnomalies,
    ask,
    autoAnalyze,
    stop,
    clearActive,
    newChat,
    switchChat,
    deleteSession,
    renameSession,
  }
}
