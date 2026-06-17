import { useRequestStore } from '@/store/useRequestStore'
import type { AuthType } from '@/types'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

const TYPES: { value: AuthType; labelKey: string }[] = [
  { value: 'none', labelKey: 'auth.noAuth' },
  { value: 'bearer', labelKey: 'auth.bearer' },
  { value: 'basic', labelKey: 'auth.basic' },
  { value: 'api-key', labelKey: 'auth.apiKey' },
]

export function AuthEditor() {
  const t = useT()
  const auth = useRequestStore((s) => s.current.auth)
  const setAuth = useRequestStore((s) => s.setAuth)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 flex-wrap">
        {TYPES.map((tp) => (
          <button
            key={tp.value}
            onClick={() => setAuth({ ...auth, type: tp.value })}
            className={cn(
              'px-2.5 py-1 text-xs rounded transition-colors',
              auth.type === tp.value
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-app-hover',
            )}
          >
            {t(tp.labelKey)}
          </button>
        ))}
      </div>

      {auth.type === 'none' && (
        <p className="text-xs text-text-secondary italic">{t('auth.none')}</p>
      )}

      {auth.type === 'bearer' && (
        <div>
          <label className="block text-xs text-text-secondary mb-1">{t('auth.token')}</label>
          <input
            value={auth.bearer ?? ''}
            onChange={(e) => setAuth({ ...auth, bearer: e.target.value })}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            className="input-base font-mono text-xs"
            type="password"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">{t('auth.username')}</label>
            <input
              value={auth.basic?.username ?? ''}
              onChange={(e) =>
                setAuth({ ...auth, basic: { username: e.target.value, password: auth.basic?.password ?? '' } })
              }
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">{t('auth.password')}</label>
            <input
              value={auth.basic?.password ?? ''}
              onChange={(e) =>
                setAuth({ ...auth, basic: { username: auth.basic?.username ?? '', password: e.target.value } })
              }
              className="input-base text-xs"
              type="password"
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">{t('auth.key')}</label>
            <input
              value={auth.apiKey?.key ?? ''}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  apiKey: {
                    key: e.target.value,
                    value: auth.apiKey?.value ?? '',
                    in: auth.apiKey?.in ?? 'header',
                  },
                })
              }
              placeholder="X-API-Key"
              className="input-base font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">{t('auth.value')}</label>
            <input
              value={auth.apiKey?.value ?? ''}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  apiKey: {
                    key: auth.apiKey?.key ?? '',
                    value: e.target.value,
                    in: auth.apiKey?.in ?? 'header',
                  },
                })
              }
              className="input-base font-mono text-xs"
              type="password"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-text-secondary mb-1">{t('auth.addTo')}</label>
            <div className="flex gap-1">
              {(['header', 'query'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    setAuth({
                      ...auth,
                      apiKey: {
                        key: auth.apiKey?.key ?? '',
                        value: auth.apiKey?.value ?? '',
                        in: opt,
                      },
                    })
                  }
                  className={cn(
                    'px-2.5 py-1 text-xs rounded transition-colors',
                    (auth.apiKey?.in ?? 'header') === opt
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-app-hover',
                  )}
                >
                  {opt === 'header' ? t('auth.header') : t('auth.queryParam')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
