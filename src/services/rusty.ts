import type { RustyContext } from '@/types'
import { formatBytes, formatDuration } from '@/utils/formatJson'
import { useI18nStore } from '@/store/useI18nStore'
import { getActiveConfig } from '@/store/useApiKeyStore'
import type { ActiveConfig } from '@/store/useApiKeyStore'
import { getProvider } from '@/services/providers'

const SYSTEM_PROMPT_RU = `Ты — Rusty, AI-ассистент встроенный в REST-клиент Restbox.
Твоя работа: помогать разработчикам понимать ответы API.

Что ты умеешь:
- Объяснять структуру JSON-ответа простым языком
- Находить аномалии: неожиданные null, пустые массивы, ошибки в теле при статусе 200, несоответствия типов
- Предлагать готовый код обработки ответа на JavaScript, TypeScript, Python, Go, Rust
- Объяснять HTTP-статусы и что с ними делать
- Помогать дебаггить CORS-ошибки и проблемы с авторизацией
- Отвечать на вопросы про конкретный API

Стиль общения:
- Лаконично, без воды
- Используй Markdown: заголовки, код в блоках, списки
- Обращайся к пользователю на "ты"
- Если видишь проблему — говори прямо
- Имя: Rusty (не представляйся каждый раз)
- Отвечай на русском языке`

const SYSTEM_PROMPT_EN = `You are Rusty, an AI assistant built into the Restbox REST client.
Your job: help developers understand API responses.

What you can do:
- Explain JSON response structure in plain language
- Find anomalies: unexpected nulls, empty arrays, errors in body with 200 status, type mismatches
- Suggest ready-to-use handling code in JavaScript, TypeScript, Python, Go, Rust
- Explain HTTP statuses and what to do about them
- Help debug CORS errors and authorization issues
- Answer questions about a specific API

Communication style:
- Concise, no fluff
- Use Markdown: headings, code blocks, lists
- Address the user directly
- If you see a problem — say it straight
- Name: Rusty (do not introduce yourself every time)
- Respond in English`

function getSystemPrompt(): string {
  const lang = useI18nStore.getState().lang
  return lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_RU
}

export function getApiKey(): string {
  return getActiveConfig().apiKey
}

export function hasApiKey(): boolean {
  return getActiveConfig().ready
}

export interface FetchModelsResult {
  models: string[]
  source: 'api' | 'fallback'
  error?: string
}

const ANTHROPIC_FALLBACK = [
  'claude-sonnet-4-20250514',
  'claude-opus-4-20250514',
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
  'claude-3-opus-latest',
]

function getModelsUrl(providerId: string, baseUrl: string): string {
  switch (providerId) {
    case 'deepseek':
      return 'https://api.deepseek.com/v1/models'
    case 'openai':
      return 'https://api.openai.com/v1/models'
    case 'anthropic':
      return 'https://api.anthropic.com/v1/models'
    case 'groq':
      return 'https://api.groq.com/openai/v1/models'
    case 'mistral':
      return 'https://api.mistral.ai/v1/models'
    case 'custom':
      return `${baseUrl.replace(/\/$/, '')}/models`
    default:
      return `${baseUrl.replace(/\/$/, '')}/models`
  }
}

function getModelsHeaders(providerId: string, apiKey: string): Record<string, string> {
  if (providerId === 'anthropic') {
    return {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }
  }
  return { Authorization: `Bearer ${apiKey}` }
}

function parseModels(providerId: string, data: unknown): string[] {
  const raw: unknown = (data as { data?: unknown })?.data ?? (data as { models?: unknown })?.models ?? data
  if (!Array.isArray(raw)) return []

  const extractId = (item: unknown): string | null => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      if (typeof obj.id === 'string') return obj.id
    }
    return null
  }

  switch (providerId) {
    case 'openai':
      return raw
        .map(extractId)
        .filter((m): m is string => m !== null && m.startsWith('gpt-'))
        .sort((a, b) => b.localeCompare(a))

    case 'groq':
      return raw
        .filter((item): boolean => {
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>
            return obj.active === true || obj.active === undefined
          }
          return true
        })
        .map(extractId)
        .filter((m): m is string => m !== null)
        .sort()

    default:
      return raw
        .map(extractId)
        .filter((m): m is string => m !== null && m.length > 0)
        .sort()
  }
}

function getFallbackModels(providerId: string, customModel?: string): string[] {
  if (providerId === 'anthropic') return ANTHROPIC_FALLBACK
  if (providerId === 'custom') return customModel ? [customModel] : []
  return getProvider(providerId).models
}

export async function fetchModels(
  providerId: string,
  apiKey: string,
  baseUrl: string,
  customModel?: string,
): Promise<FetchModelsResult> {
  if (!apiKey.trim()) {
    return { models: [], source: 'fallback' }
  }

  const url = getModelsUrl(providerId, baseUrl)
  const headers = getModelsHeaders(providerId, apiKey)

  try {
    const res = await fetch(url, { headers })

    if (res.status === 401) {
      return { models: [], source: 'fallback', error: '401' }
    }

    if (res.status === 404 && providerId === 'anthropic') {
      return { models: ANTHROPIC_FALLBACK, source: 'fallback' }
    }

    if (!res.ok) {
      return {
        models: getFallbackModels(providerId, customModel),
        source: 'fallback',
        error: `${res.status}`,
      }
    }

    const data = await res.json()
    const models = parseModels(providerId, data)

    if (models.length === 0) {
      return {
        models: getFallbackModels(providerId, customModel),
        source: 'fallback',
      }
    }

    return { models, source: 'api' }
  } catch (e) {
    return {
      models: getFallbackModels(providerId, customModel),
      source: 'fallback',
      error: e instanceof Error ? e.message : 'network',
    }
  }
}

export function buildContextMessage(context: RustyContext): string {
  const { request, response, anomalies } = context
  const lang = useI18nStore.getState().lang
  const isEn = lang === 'en'
  const lines: string[] = []

  lines.push(isEn ? `The user just performed a request:` : `Пользователь только что выполнил запрос:`)
  lines.push('')
  lines.push(
    isEn
      ? `**Request:** ${request.method} ${request.url}`
      : `**Запрос:** ${request.method} ${request.url}`,
  )
  if (request.body.type !== 'none' && request.body.content.trim()) {
    lines.push(isEn ? `**Request body:**` : `**Тело запроса:**`)
    lines.push('```')
    lines.push(request.body.content.slice(0, 2000))
    lines.push('```')
  }

  if (response) {
    lines.push(
      isEn
        ? `**Status:** ${response.status} ${response.statusText}`
        : `**Статус:** ${response.status} ${response.statusText}`,
    )
    lines.push(isEn ? `**Time:** ${formatDuration(response.duration)}` : `**Время:** ${formatDuration(response.duration)}`)
    lines.push(isEn ? `**Size:** ${formatBytes(response.size)}` : `**Размер:** ${formatBytes(response.size)}`)
    lines.push('')
    lines.push(isEn ? `**Response headers:**` : `**Заголовки ответа:**`)
    lines.push('```')
    const hdrs = Object.entries(response.headers).slice(0, 20)
    for (const [k, v] of hdrs) lines.push(`${k}: ${v}`)
    lines.push('```')
    lines.push('')
    lines.push(isEn ? `**Response body:**` : `**Тело ответа:**`)
    lines.push('```json')
    const raw = typeof response.body === 'string' ? response.rawBody : JSON.stringify(response.body, null, 2)
    lines.push(raw.slice(0, 4000))
    lines.push('```')
  } else {
    lines.push(
      isEn
        ? '**Response:** missing (request not performed or failed with a network error).'
        : '**Ответ:** отсутствует (запрос не выполнен или завершился ошибкой сети).',
    )
  }

  if (anomalies.length > 0) {
    lines.push('')
    lines.push(isEn ? '**Detected anomalies:**' : '**Обнаруженные аномалии:**')
    for (const a of anomalies) {
      const icon = a.type === 'error' ? '🔴' : a.type === 'warning' ? '🟡' : '🔵'
      lines.push(`- ${icon} ${a.message}`)
    }
  }

  lines.push('')
  lines.push(isEn ? 'Analyze the response.' : 'Проанализируй ответ.')
  return lines.join('\n')
}

export interface RustyMessagePayload {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function* streamRustyResponse(
  messages: Array<{ role: string; content: string }>,
  context: RustyContext,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const config = getActiveConfig()
  if (!config.ready) {
    const lang = useI18nStore.getState().lang
    yield lang === 'en'
      ? '⚠️ API key not configured. Click ⚙ to set up a provider and key.'
      : '⚠️ API-ключ не настроен. Нажми ⚙, чтобы выбрать провайдера и ввести ключ.'
    return
  }

  const systemPrompt = getSystemPrompt()
  const contextMsg = buildContextMessage(context)

  if (config.provider.apiFormat === 'anthropic') {
    yield* streamAnthropic(config, systemPrompt, contextMsg, messages, signal)
  } else {
    yield* streamOpenAI(config, systemPrompt, contextMsg, messages, signal)
  }
}

async function* streamOpenAI(
  config: ActiveConfig,
  systemPrompt: string,
  contextMsg: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const payloadMessages: RustyMessagePayload[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextMsg },
    ...messages.map((m) => ({
      role: m.role === 'rusty' ? ('assistant' as const) : (m.role as 'user' | 'system'),
      content: m.content,
    })),
  ]

  let res: Response
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: payloadMessages,
        stream: true,
        temperature: 0.5,
        max_tokens: 2048,
      }),
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    yield `⚠️ Network error: ${e instanceof Error ? e.message : String(e)}`
    return
  }

  if (!res.ok) {
    yield await formatError(res, config)
    return
  }

  yield* parseOpenAISSE(res, signal)
}

async function* streamAnthropic(
  config: ActiveConfig,
  systemPrompt: string,
  contextMsg: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const chatMessages = [
    { role: 'user' as const, content: contextMsg },
    ...messages.map((m) => ({
      role: m.role === 'rusty' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    })),
  ]

  let res: Response
  try {
    res = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model,
        system: systemPrompt,
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
      }),
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    yield `⚠️ Network error: ${e instanceof Error ? e.message : String(e)}`
    return
  }

  if (!res.ok) {
    yield await formatError(res, config)
    return
  }

  yield* parseAnthropicSSE(res, signal)
}

async function* parseOpenAISSE(res: Response, signal?: AbortSignal): AsyncGenerator<string> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel().catch(() => {})
        return
      }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const delta = json?.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length > 0) yield delta
        } catch {
          /* skip */
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function* parseAnthropicSSE(res: Response, signal?: AbortSignal): AsyncGenerator<string> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel().catch(() => {})
        return
      }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      let currentEvent = ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) {
          currentEvent = ''
          continue
        }
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim()
          continue
        }
        if (trimmed.startsWith('data:')) {
          const data = trimmed.slice(5).trim()
          try {
            const json = JSON.parse(data)
            if (
              (currentEvent === 'content_block_delta' || json.type === 'content_block_delta') &&
              json?.delta?.type === 'text_delta'
            ) {
              const text = json.delta.text
              if (typeof text === 'string' && text.length > 0) yield text
            }
            if (json.type === 'message_stop') return
          } catch {
            /* skip */
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function formatError(res: Response, config: ActiveConfig): Promise<string> {
  let detail = ''
  try {
    const errBody = await res.json()
    detail = errBody?.error?.message || errBody?.message || JSON.stringify(errBody)
  } catch {
    detail = await res.text().catch(() => '')
  }
  const providerName = config.provider.name
  if (res.status === 401) {
    return `⚠️ ${providerName}: invalid API key (401). Check your key in ⚙ settings.`
  }
  if (res.status === 403) {
    return `⚠️ ${providerName}: access forbidden (403). Possibly CORS or insufficient permissions.`
  }
  if (res.status === 429) {
    return `⚠️ ${providerName}: rate limit (429). Slow down or check your plan.`
  }
  return `⚠️ ${providerName} error (${res.status} ${res.statusText}).\n\n${detail}`
}

export async function checkApiKey(): Promise<{ ok: boolean; message: string }> {
  const config = getActiveConfig()
  if (!config.ready) return { ok: false, message: 'Not configured' }
  const lang = useI18nStore.getState().lang
  const okMsg = lang === 'en' ? 'Connected' : 'Подключено'

  try {
    if (config.provider.apiFormat === 'anthropic') {
      const res = await fetch(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      if (res.ok) return { ok: true, message: okMsg }
      if (res.status === 401) return { ok: false, message: lang === 'en' ? 'Invalid key (401)' : 'Неверный ключ (401)' }
      return { ok: false, message: `${config.provider.name}: ${res.status}` }
    }

    const res = await fetch(`${config.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    })
    if (res.ok) return { ok: true, message: okMsg }
    if (res.status === 401) return { ok: false, message: lang === 'en' ? 'Invalid key (401)' : 'Неверный ключ (401)' }
    return { ok: false, message: `${config.provider.name}: ${res.status}` }
  } catch {
    return { ok: false, message: lang === 'en' ? 'Network error' : 'Сеть недоступна' }
  }
}
