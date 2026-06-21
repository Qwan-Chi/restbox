import { describe, it, expect } from 'vitest'
import { detectAnomalies } from './detectAnomaly'
import type { ResponseData } from '@/types'

function makeResponse(overrides: Partial<ResponseData> = {}): ResponseData {
  return {
    status: 200,
    statusText: 'OK',
    headers: {},
    body: null,
    rawBody: '',
    size: 0,
    duration: 100,
    timestamp: Date.now(),
    ok: true,
    ...overrides,
  }
}

describe('detectAnomalies — status codes', () => {
  it('detects CORS / network error (status 0)', () => {
    const anomalies = detectAnomalies(makeResponse({ status: 0 }))
    expect(anomalies).toHaveLength(1)
    expect(anomalies[0].type).toBe('error')
    expect(anomalies[0].message).toContain('CORS')
  })

  it('detects 401 Unauthorized', () => {
    const anomalies = detectAnomalies(makeResponse({ status: 401, ok: false }))
    expect(anomalies.some((a) => a.type === 'error' && a.message.includes('401'))).toBe(true)
  })

  it('detects 429 rate limit', () => {
    const anomalies = detectAnomalies(makeResponse({ status: 429, ok: false }))
    expect(anomalies.some((a) => a.type === 'warning' && a.message.includes('429'))).toBe(true)
  })
})

describe('detectAnomalies — body inspection', () => {
  it('warns about empty body on 2xx', () => {
    const anomalies = detectAnomalies(makeResponse({ body: null }))
    expect(anomalies.some((a) => a.type === 'info' && a.message.includes('пустое'))).toBe(true)
  })

  it('detects success: false in body', () => {
    const anomalies = detectAnomalies(makeResponse({ body: { success: false } }))
    expect(anomalies.some((a) => a.type === 'error' && a.field === 'success')).toBe(true)
  })

  it('detects error message fields', () => {
    const anomalies = detectAnomalies(makeResponse({ body: { error: 'Something went wrong' } }))
    expect(anomalies.some((a) => a.type === 'warning' && a.field === 'error')).toBe(true)
  })

  it('detects null id fields', () => {
    const anomalies = detectAnomalies(makeResponse({ body: { id: null, name: 'Test' } }))
    expect(anomalies.some((a) => a.type === 'warning' && a.field === 'id')).toBe(true)
  })

  it('detects secret-like fields', () => {
    const anomalies = detectAnomalies(makeResponse({ body: { token: 'abc123', name: 'x' } }))
    expect(anomalies.some((a) => a.type === 'warning' && a.field === 'token')).toBe(true)
  })

  it('detects empty arrays', () => {
    const anomalies = detectAnomalies(makeResponse({ body: { items: [] } }))
    expect(anomalies.some((a) => a.type === 'info' && a.message.includes('Пустой массив'))).toBe(true)
  })

  it('detects slow responses (>3s)', () => {
    const anomalies = detectAnomalies(makeResponse({ duration: 5000 }))
    expect(anomalies.some((a) => a.type === 'warning' && a.message.includes('медленно'))).toBe(true)
  })

  it('returns no anomalies for clean response', () => {
    const anomalies = detectAnomalies(
      makeResponse({
        body: { id: 1, name: 'OK', items: [1, 2, 3] },
        duration: 100,
      }),
    )
    expect(anomalies).toHaveLength(0)
  })
})
