import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useRequestStore } from '@/store/useRequestStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useRustyStore } from '@/store/useRustyStore'
import { executeRequest } from '@/services/httpClient'
import { detectAnomalies } from '@/utils/detectAnomaly'
import type { HistoryItem, RequestConfig } from '@/types'

export function useRequest() {
  const { current, response, isLoading, error } = useRequestStore()
  const setResponse = useRequestStore((s) => s.setResponse)
  const setLoading = useRequestStore((s) => s.setLoading)
  const setError = useRequestStore((s) => s.setError)
  const addHistory = useHistoryStore((s) => s.add)
  const setAnomalies = useRustyStore((s) => s.setAnomalies)

  const send = useCallback(
    async (config?: RequestConfig) => {
      const req = config ?? current
      setLoading(true)
      setError(null)
      try {
        const res = await executeRequest(req)
        setResponse(res)
        const anomalies = detectAnomalies(res)
        setAnomalies(anomalies)

        const historyItem: HistoryItem = {
          id: uuid(),
          request: JSON.parse(JSON.stringify(req)),
          response: res,
          timestamp: Date.now(),
        }
        addHistory(historyItem)
        return res
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [current, setLoading, setError, setResponse, setAnomalies, addHistory],
  )

  return {
    current,
    response,
    isLoading,
    error,
    send,
  }
}
