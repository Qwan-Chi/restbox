import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useI18nStore } from '@/store/useI18nStore'
import { useT } from '@/utils/i18n'
import { initGoogleAuth, isGoogleConfigured, renderGoogleButton } from '@/services/googleAuth'
import { isYandexConfigured, startYandexLogin } from '@/services/yandexAuth'
import type { AuthUser } from '@/types'

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const lang = useI18nStore((s) => s.lang)
  const t = useT()
  const [error, setError] = useState('')
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const googleOn = isGoogleConfigured()
  const yandexOn = isYandexConfigured()
  const hasOAuth = googleOn || yandexOn

  useEffect(() => {
    if (!googleOn) return
    let cancelled = false
    void initGoogleAuth(
      (user) => login(user),
      (msg) => setError(`${t('login.error')}: ${msg}`),
    ).then(() => {
      if (cancelled || !googleBtnRef.current) return
      renderGoogleButton(googleBtnRef.current, { width: 280, locale: lang })
    })
    return () => {
      cancelled = true
    }
  }, [googleOn, login, lang, t])

  const handleSkip = () => {
    const guest: AuthUser = {
      id: 'guest',
      provider: 'guest',
      name: t('user.guest'),
      email: null,
      avatar: null,
      token: '',
      expiresAt: null,
      loginAt: Date.now(),
    }
    login(guest)
  }

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
            <p className="text-sm text-text-secondary mt-1">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            {googleOn && <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />}

            {yandexOn && (
              <button
                onClick={startYandexLogin}
                className="w-full py-2.5 px-4 rounded-md bg-[#FC3F1D] text-white text-sm font-medium hover:bg-[#FC3F1D]/90 transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-bold">Я</span>
                {t('login.yandex')}
              </button>
            )}

            {hasOAuth && (
              <div className="flex items-center w-full gap-3 my-1">
                <div className="flex-1 h-px bg-app-border" />
                <span className="text-[10px] uppercase tracking-wide text-text-secondary">{t('login.or')}</span>
                <div className="flex-1 h-px bg-app-border" />
              </div>
            )}

            <button
              onClick={handleSkip}
              className="w-full py-3 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
            >
              {hasOAuth ? t('login.guest') : 'Продолжить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
