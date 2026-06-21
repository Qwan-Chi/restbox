import { describe, it, expect } from 'vitest'
import { buildUrl, buildHeaders, buildBody } from './httpClient'
import type { RequestConfig, RequestAuth } from '@/types'

function makeConfig(overrides: Partial<RequestConfig> = {}): RequestConfig {
  return {
    id: 'test',
    name: 'test',
    method: 'GET',
    url: 'https://api.example.com',
    headers: [],
    params: [],
    body: { type: 'none', content: '', formData: [] },
    auth: { type: 'none' },
    ...overrides,
  }
}

describe('buildUrl', () => {
  it('returns URL unchanged when no params', () => {
    expect(buildUrl('https://api.example.com', [], { type: 'none' })).toBe(
      'https://api.example.com',
    )
  })

  it('appends enabled params as query string', () => {
    const params = [
      { id: '1', key: 'foo', value: 'bar', enabled: true },
      { id: '2', key: 'baz', value: 'qux', enabled: true },
    ]
    const result = buildUrl('https://api.example.com', params, { type: 'none' })
    expect(result).toContain('foo=bar')
    expect(result).toContain('baz=qux')
    expect(result).toContain('?')
  })

  it('skips disabled params', () => {
    const params = [
      { id: '1', key: 'foo', value: 'bar', enabled: true },
      { id: '2', key: 'baz', value: 'qux', enabled: false },
    ]
    const result = buildUrl('https://api.example.com', params, { type: 'none' })
    expect(result).toContain('foo=bar')
    expect(result).not.toContain('baz=qux')
  })

  it('skips empty keys', () => {
    const params = [{ id: '1', key: '', value: 'val', enabled: true }]
    expect(buildUrl('https://api.example.com', params, { type: 'none' })).toBe(
      'https://api.example.com',
    )
  })

  it('appends to URL that already has query params', () => {
    const params = [{ id: '1', key: 'foo', value: 'bar', enabled: true }]
    const result = buildUrl('https://api.example.com?a=1', params, { type: 'none' })
    expect(result).toContain('&foo=bar')
  })
})

describe('buildHeaders', () => {
  it('returns empty for no headers', () => {
    expect(buildHeaders([], { type: 'none' })).toEqual({})
  })

  it('includes enabled headers', () => {
    const headers = [
      { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
      { id: '2', key: 'X-Custom', value: 'yes', enabled: true },
    ]
    expect(buildHeaders(headers, { type: 'none' })).toEqual({
      'Content-Type': 'application/json',
      'X-Custom': 'yes',
    })
  })

  it('skips disabled headers', () => {
    const headers = [
      { id: '1', key: 'A', value: '1', enabled: true },
      { id: '2', key: 'B', value: '2', enabled: false },
    ]
    expect(buildHeaders(headers, { type: 'none' })).toEqual({ A: '1' })
  })

  it('adds Bearer auth header', () => {
    const auth: RequestAuth = { type: 'bearer', bearer: 'my-token' }
    expect(buildHeaders([], auth)).toEqual({ Authorization: 'Bearer my-token' })
  })

  it('adds Basic auth header', () => {
    const auth: RequestAuth = { type: 'basic', basic: { username: 'user', password: 'pass' } }
    const result = buildHeaders([], auth)
    expect(result.Authorization).toMatch(/^Basic /)
    // base64("user:pass") = "dXNlcjpwYXNz"
    expect(result.Authorization).toBe('Basic dXNlcjpwYXNz')
  })

  it('handles Unicode in Basic auth', () => {
    const auth: RequestAuth = { type: 'basic', basic: { username: 'пользователь', password: 'пароль' } }
    const result = buildHeaders([], auth)
    // Should not throw, should produce valid base64
    expect(result.Authorization).toMatch(/^Basic /)
    // Decode back using the reverse of unescape(encodeURIComponent(...))
    const decoded = decodeURIComponent(escape(atob(result.Authorization.slice(6))))
    expect(decoded).toBe('пользователь:пароль')
  })

  it('adds API key in header', () => {
    const auth: RequestAuth = {
      type: 'api-key',
      apiKey: { key: 'X-API-Key', value: 'secret', in: 'header' },
    }
    expect(buildHeaders([], auth)).toEqual({ 'X-API-Key': 'secret' })
  })
})

describe('buildBody', () => {
  it('returns null for none type', () => {
    const config = makeConfig({ body: { type: 'none', content: '', formData: [] } })
    expect(buildBody(config)).toEqual({ body: null })
  })

  it('returns JSON body with content-type', () => {
    const config = makeConfig({ body: { type: 'json', content: '{"a":1}', formData: [] } })
    const result = buildBody(config)
    expect(result.body).toBe('{"a":1}')
    expect(result.contentType).toBe('application/json')
  })

  it('returns raw body with text content-type', () => {
    const config = makeConfig({ body: { type: 'raw', content: 'hello', formData: [] } })
    const result = buildBody(config)
    expect(result.body).toBe('hello')
    expect(result.contentType).toBe('text/plain')
  })

  it('returns FormData for form-data type', () => {
    const config = makeConfig({
      body: {
        type: 'form-data',
        content: '',
        formData: [
          { id: '1', key: 'name', value: 'test', enabled: true },
          { id: '2', key: 'skip', value: 'no', enabled: false },
        ],
      },
    })
    const result = buildBody(config)
    expect(result.body).toBeInstanceOf(FormData)
    const fd = result.body as FormData
    expect(fd.get('name')).toBe('test')
    expect(fd.get('skip')).toBeNull()
  })

  it('returns File for binary type when file provided', () => {
    const config = makeConfig({ body: { type: 'binary', content: '', formData: [] } })
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const result = buildBody(config, mockFile)
    expect(result.body).toBe(mockFile)
  })

  it('returns null for binary type when no file', () => {
    const config = makeConfig({ body: { type: 'binary', content: '', formData: [] } })
    const result = buildBody(config, null)
    expect(result.body).toBeNull()
  })
})
