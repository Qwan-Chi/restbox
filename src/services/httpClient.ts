import type { KeyValuePair, RequestAuth, RequestConfig, ResponseData } from '@/types'
import { byteLength } from '@/utils/formatJson'

function buildHeaders(
  headers: KeyValuePair[],
  auth: RequestAuth,
  contentType?: string,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const h of headers) {
    if (h.enabled && h.key.trim()) result[h.key] = h.value
  }

  if (contentType) result['Content-Type'] = result['Content-Type'] || contentType

  switch (auth.type) {
    case 'bearer':
      if (auth.bearer) result['Authorization'] = `Bearer ${auth.bearer}`
      break
    case 'basic':
      if (auth.basic?.username) {
        const credentials = `${auth.basic.username}:${auth.basic.password ?? ''}`
        // Use unescape(encodeURIComponent()) to handle Unicode characters
        const token = btoa(unescape(encodeURIComponent(credentials)))
        result['Authorization'] = `Basic ${token}`
      }
      break
    case 'api-key':
      if (auth.apiKey?.key && auth.apiKey.in === 'header') {
        result[auth.apiKey.key] = auth.apiKey.value
      }
      break
    case 'none':
      break
  }

  return result
}

function buildUrl(url: string, params: KeyValuePair[], auth: RequestAuth): string {
  const search = new URLSearchParams()
  for (const p of params) {
    if (p.enabled && p.key.trim()) search.append(p.key, p.value)
  }
  if (auth.type === 'api-key' && auth.apiKey?.in === 'query' && auth.apiKey.key) {
    search.append(auth.apiKey.key, auth.apiKey.value)
  }
  const qs = search.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

function buildBody(
  config: RequestConfig,
  binaryFile?: File | null,
): { body: BodyInit | null; contentType?: string } {
  const { type, content, formData } = config.body
  switch (type) {
    case 'none':
      return { body: null }
    case 'json':
      return { body: content, contentType: 'application/json' }
    case 'raw':
      return { body: content, contentType: 'text/plain' }
    case 'form-data': {
      const fd = new FormData()
      for (const f of formData) {
        if (f.enabled && f.key.trim()) fd.append(f.key, f.value)
      }
      return { body: fd }
    }
    case 'binary':
      if (binaryFile) return { body: binaryFile }
      return { body: null }
  }
}

function networkError(message: string): ResponseData {
  return {
    status: 0,
    statusText: 'Network Error (CORS)',
    headers: {},
    body: null,
    rawBody: message,
    size: 0,
    duration: 0,
    timestamp: Date.now(),
    ok: false,
  }
}

const DEFAULT_TIMEOUT_MS = 30_000

export async function executeRequest(
  config: RequestConfig,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  binaryFile?: File | null,
): Promise<ResponseData> {
  const start = performance.now()

  if (!config.url.trim()) {
    return networkError('URL пустой. Укажи адрес запроса.')
  }

  let finalUrl: string
  try {
    finalUrl = buildUrl(config.url.trim(), config.params, config.auth)
  } catch {
    return networkError(`Некорректный URL: "${config.url}".`)
  }

  const { body, contentType } = buildBody(config, binaryFile)
  const headers = buildHeaders(config.headers, config.auth, contentType)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(finalUrl, {
      method: config.method,
      headers,
      body,
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timer)
    const duration = performance.now() - start
    const isTimeout = e instanceof DOMException && e.name === 'AbortError'
    const err = networkError(
      isTimeout
        ? `Запрос превысил лимит времени (${Math.round(timeoutMs / 1000)}с). Сервер не ответил вовремя.\n\nURL: ${finalUrl}`
        : `Не удалось выполнить запрос к ${finalUrl}.\n\nСкорее всего это CORS-ошибка или сервер недоступен.\n\nТехнически: ${
            e instanceof Error ? e.message : String(e)
          }`,
    )
    err.duration = duration
    return err
  }

  clearTimeout(timer)

  const duration = performance.now() - start
  const rawBody = await response.text()

  const respHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    respHeaders[key] = value
  })

  const contentLength = respHeaders['content-length']
  const size = contentLength ? parseInt(contentLength, 10) || byteLength(rawBody) : byteLength(rawBody)

  let parsedBody: unknown = rawBody
  const ct = (respHeaders['content-type'] || '').toLowerCase()
  if (ct.includes('application/json') || rawBody.trim().startsWith('{') || rawBody.trim().startsWith('[')) {
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      parsedBody = rawBody
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: respHeaders,
    body: parsedBody,
    rawBody,
    size,
    duration,
    timestamp: Date.now(),
    ok: response.ok,
  }
}

export { buildUrl, buildHeaders, buildBody }
