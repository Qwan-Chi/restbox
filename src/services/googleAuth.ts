import type { AuthUser } from '@/types'

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

let scriptLoading: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoading) return scriptLoading

  scriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('google-gsi-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('GIS load error')))
      return
    }
    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = GIS_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('GIS load error'))
    document.head.appendChild(script)
  })
  return scriptLoading
}

function base64UrlDecode(input: string): string {
  let s = input.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return atob(s)
}

interface GoogleJwtPayload {
  sub: string
  name?: string
  email?: string
  picture?: string
  given_name?: string
  family_name?: string
  exp?: number
}

export function decodeGoogleCredential(credential: string): AuthUser {
  const parts = credential.split('.')
  if (parts.length < 2) throw new Error('Invalid Google token')
  const payload = JSON.parse(base64UrlDecode(parts[1])) as GoogleJwtPayload
  return {
    id: payload.sub,
    provider: 'google',
    name: payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ') || 'Google User',
    email: payload.email ?? null,
    avatar: payload.picture ?? null,
    token: credential,
    expiresAt: payload.exp ? payload.exp * 1000 : null,
    loginAt: Date.now(),
  }
}

export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export function isGoogleConfigured(): boolean {
  return getGoogleClientId().trim().length > 0
}

export async function initGoogleAuth(
  onCredential: (user: AuthUser) => void,
  onError: (message: string) => void,
): Promise<void> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    onError('Google client_id not set')
    return
  }
  try {
    await loadGisScript()
  } catch (e) {
    onError(e instanceof Error ? e.message : 'GIS error')
    return
  }
  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: (resp: GoogleCredentialResponse) => {
      try {
        const user = decodeGoogleCredential(resp.credential)
        onCredential(user)
      } catch (e) {
        onError(e instanceof Error ? e.message : 'Token decode error')
      }
    },
    cancel_on_tap_outside: false,
    auto_select: false,
  })
}

export function renderGoogleButton(
  element: HTMLElement,
  options: { width?: number; locale?: string } = {},
): void {
  if (!window.google?.accounts?.id) return
  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    shape: 'rectangular',
    text: 'signin_with',
    width: options.width ?? 280,
    locale: options.locale ?? 'ru',
  })
}

interface GoogleCredentialResponse {
  credential: string
  select_by?: string
}
