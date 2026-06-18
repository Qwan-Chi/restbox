import type { AuthUser } from '@/types'

const YANDEX_AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize'
const YANDEX_PROFILE_URL = 'https://login.yandex.ru/info'

export function getYandexClientId(): string {
  return import.meta.env.VITE_YANDEX_CLIENT_ID || ''
}

export function isYandexConfigured(): boolean {
  return getYandexClientId().trim().length > 0
}

export function getRedirectUri(): string {
  return window.location.origin + window.location.pathname
}

export function startYandexLogin(): void {
  const clientId = getYandexClientId()
  if (!clientId) return
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    force_confirm: 'true',
  })
  window.location.href = `${YANDEX_AUTHORIZE_URL}?${params.toString()}`
}

interface YandexRedirectResult {
  token: string
  expiresAt: number
}

export function parseYandexRedirect(): YandexRedirectResult | null {
  if (!window.location.hash) return null
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const params = new URLSearchParams(hash)
  const token = params.get('access_token')
  if (!token) return null
  const expiresIn = parseInt(params.get('expires_in') ?? '0', 10)
  const expiresAt = expiresIn > 0 ? Date.now() + expiresIn * 1000 : Date.now() + 3600 * 1000
  return { token, expiresAt }
}

export function clearYandexRedirect(): void {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

interface YandexProfile {
  id: string
  login?: string
  display_name?: string
  real_name?: string
  first_name?: string
  last_name?: string
  default_email?: string
  is_avatar_empty?: boolean
  default_avatar_id?: string
}

export async function fetchYandexProfile(token: string): Promise<AuthUser> {
  const res = await fetch(`${YANDEX_PROFILE_URL}?format=json`, {
    headers: { Authorization: `OAuth ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Yandex profile failed: ${res.status}`)
  }
  const profile = (await res.json()) as YandexProfile

  const name =
    profile.real_name ||
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.login ||
    'Yandex User'

  const avatar = profile.is_avatar_empty
    ? null
    : profile.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
      : null

  return {
    id: profile.id,
    provider: 'yandex',
    name,
    email: profile.default_email ?? null,
    avatar,
    token,
    expiresAt: null,
    loginAt: Date.now(),
  }
}
