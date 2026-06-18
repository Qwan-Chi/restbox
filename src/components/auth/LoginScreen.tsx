import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { initGoogleAuth, renderGoogleButton, isGoogleConfigured } from '@/services/googleAuth'
import { startYandexLogin, isYandexConfigured } from '@/services/yandexAuth'
import { cn } from '@/utils/cn'

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [yandexLoading, setYandexLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    void initGoogleAuth(
      (user) => { if (!cancelled) login(user) },
      (msg) => { if (!cancelled) setError(msg) },
    ).then(() => {
      if (!cancelled && googleBtnRef.current && isGoogleConfigured()) {
        renderGoogleButton(googleBtnRef.current, { width: 280, locale: 'ru' })
      }
    })
    return () => { cancelled = true }
  }, [login])

  const handleYandex = () => {
    setError(null)
    if (!isYandexConfigured()) { setError('Yandex client_id not set'); return }
    setYandexLoading(true)
    startYandexLogin()
  }

  const googleReady = isGoogleConfigured()
  const yandexReady = isYandexConfigured()

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-app-panel border border-app-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 flex items-center justify-center mb-4">
              <span className="text-4xl">🔩</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Restbox</h1>
            <p className="text-sm text-text-secondary mt-1">REST-клиент с AI-ассистентом Rusty</p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col items-stretch">
              <div ref={googleBtnRef} className={cn('flex justify-center min-h-[44px]', !googleReady && 'opacity-40 pointer-events-none')} />
              {!googleReady && (
                <button disabled className="w-full py-3 px-4 rounded-md border border-app-border bg-app-input text-sm text-text-secondary flex items-center justify-center gap-2">
                  <GoogleIcon /> Войти через Google
                </button>
              )}
            </div>
            <button
              onClick={handleYandex}
              disabled={!yandexReady || yandexLoading}
              className={cn(
                'w-full py-3 px-4 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                yandexReady ? 'border-app-border bg-app-input hover:bg-app-hover text-text-primary' : 'border-app-border bg-app-input opacity-40 text-text-secondary cursor-not-allowed',
              )}
            >
              <YandexIcon /> {yandexLoading ? 'Перенаправление…' : 'Войти через Яндекс'}
            </button>
          </div>
          {error && <div className="mt-4 p-3 rounded-lg border border-error/30 bg-error/10 text-xs text-error">⚠️ {error}</div>}
          {!googleReady && !yandexReady && (
            <div className="mt-5 p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning/90 leading-relaxed">
              <p className="font-semibold mb-1">OAuth не настроен</p>
              <p className="text-text-secondary">
                Добавь <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> и/или{' '}
                <code className="font-mono">VITE_YANDEX_CLIENT_ID</code> в файл <code className="font-mono">.env</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function YandexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#FC3F1D" d="M13.1 21H9.6v-7.5L4 4h3.6l4.4 6.9L16.4 4H20l-6.9 9.5V21z"/>
    </svg>
  )
}
