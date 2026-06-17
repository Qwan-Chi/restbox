export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type BodyType = 'none' | 'json' | 'form-data' | 'raw' | 'binary'

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface RequestAuth {
  type: AuthType
  bearer?: string
  basic?: { username: string; password: string }
  apiKey?: { key: string; value: string; in: 'header' | 'query' }
}

export interface RequestConfig {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  params: KeyValuePair[]
  body: {
    type: BodyType
    content: string
    formData: KeyValuePair[]
  }
  auth: RequestAuth
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  rawBody: string
  size: number
  duration: number
  timestamp: number
  ok: boolean
}

export interface HistoryItem {
  id: string
  request: RequestConfig
  response: ResponseData
  timestamp: number
}

export interface Collection {
  id: string
  name: string
  requests: RequestConfig[]
  createdAt: number
}

export type RustyMessageRole = 'user' | 'rusty' | 'system'

export interface RustyMessage {
  id: string
  role: RustyMessageRole
  content: string
  timestamp: number
  isStreaming?: boolean
}

export interface Anomaly {
  type: 'warning' | 'error' | 'info'
  message: string
  field?: string
}

export type CodeLanguage = 'javascript' | 'typescript' | 'python' | 'curl' | 'go' | 'rust'

export type RustyStatus = 'idle' | 'online' | 'thinking' | 'error'

export type ApiFormat = 'openai' | 'anthropic'

export interface ProviderConfig {
  id: string
  name: string
  apiFormat: ApiFormat
  baseUrl: string
  models: string[]
  defaultModel: string
  keyPrefix: string
  keyPlaceholder: string
  docsUrl: string
  icon: string
  color: string
  custom: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: RustyMessage[]
  autoAnalyzedFor: string | null
  createdAt: number
  updatedAt: number
}

export interface RustyContext {
  request: RequestConfig
  response: ResponseData | null
  anomalies: Anomaly[]
}

export type RequestTab = 'headers' | 'body' | 'params' | 'auth'
export type ResponseTab = 'body' | 'headers' | 'timeline'
