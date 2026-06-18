import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiKeyStore } from '@/store/useApiKeyStore'
import { PROVIDERS, getProvider } from '@/services/providers'
import { fetchModels } from '@/services/rusty'
import type { FetchModelsResult } from '@/services/rusty'
import { useT } from '@/utils/i18n'
import { useI18nStore } from '@/store/useI18nStore'
import { cn } from '@/utils/cn'

interface Props {
  onClose: () => void
}

type KeyStatus = 'idle' | 'loading' | 'ok' | 'error'

export function ApiKeyModal({ onClose }: Props) {
  const t = useT()
  const isEn = useI18nStore((s) => s.lang) === 'en'

  const providerId = useApiKeyStore((s) => s.providerId)
  const storedApiKey = useApiKeyStore((s) => s.apiKey)
  const model = useApiKeyStore((s) => s.model)
  const customBaseUrl = useApiKeyStore((s) => s.customBaseUrl)
  const customModel = useApiKeyStore((s) => s.customModel)
  const setProvider = useApiKeyStore((s) => s.setProvider)
  const setApiKey = useApiKeyStore((s) => s.setApiKey)
  const setModel = useApiKeyStore((s) => s.setModel)
  const setCustomBaseUrl = useApiKeyStore((s) => s.setCustomBaseUrl)
  const setCustomModel = useApiKeyStore((s) => s.setCustomModel)
  const clear = useApiKeyStore((s) => s.clear)

  const provider = getProvider(providerId)
  const currentModel = provider.custom ? customModel : model || provider.defaultModel
  const effectiveBaseUrl = provider.custom ? customBaseUrl : provider.baseUrl

  const [keyValue, setKeyValue] = useState(storedApiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const [models, setModels] = useState<string[]>([])
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('idle')
  const [keyError, setKeyError] = useState<string | null>(null)
  const isMounted = useRef(false)

  const runFetchModels = useCallback(
    async (key: string, pid: string, url: string, cModel?: string) => {
      if (!key.trim()) {
        setModels([])
        setKeyStatus('idle')
        setKeyError(null)
        return
      }
      setKeyStatus('loading')
      setKeyError(null)
      const result: FetchModelsResult = await fetchModels(pid, key, url, cModel)
      setModels(result.models)
      if (result.source === 'api' && result.models.length > 0) {
        setKeyStatus('ok')
      } else if (result.error) {
        setKeyStatus('error')
        setKeyError(result.error)
      } else {
        setKeyStatus('ok')
      }
    },
    [],
  )

  // Instant fetch on mount if stored key exists
  useEffect(() => {
    if (storedApiKey.trim()) {
      void runFetchModels(storedApiKey, providerId, effectiveBaseUrl, customModel)
    }
    isMounted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced fetch on key/provider change (not initial mount)
  useEffect(() => {
    if (!isMounted.current) return
    if (!keyValue.trim()) {
      setModels([])
      setKeyStatus('idle')
      setKeyError(null)
      return
    }
    const timer = setTimeout(() => {
      void runFetchModels(keyValue, providerId, effectiveBaseUrl, customModel)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyValue, providerId, customBaseUrl])

  const handleProviderChange = (pid: string) => {
    setProvider(pid)
    setKeyValue('')
    setModels([])
    setKeyStatus('idle')
    setKeyError(null)
  }

  const handleSave = () => {
    setApiKey(keyValue)
    if (provider.custom) setCustomModel(customModel)
    if (!provider.custom && models.length > 0 && !models.includes(currentModel)) {
      setModel(models[0])
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleTest = () => {
    void runFetchModels(keyValue, providerId, effectiveBaseUrl, customModel)
  }

  const handleClear = () => {
    clear()
    setKeyValue('')
    setModels([])
    setKeyStatus('idle')
    setKeyError(null)
  }

  const canSave =
    keyValue.trim().length > 0 &&
    (!provider.custom || (effectiveBaseUrl.trim().length > 0 && currentModel.trim().length > 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-[520px] max-w-[92vw] max-h-[90vh] flex flex-col bg-app-panel border border-app-border rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border shrink-0">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">{t('apikey.title')}</h3>
          <button onClick={onClose} className="btn-icon h-7 w-7 text-xs">✕</button>
        </div>

        <div className="overflow-y-auto scrollbar-thin p-5 space-y-4">
          {/* Provider grid */}
          <div>
            <label className="block text-xs text-text-secondary mb-2 font-medium">
              {isEn ? 'Provider' : 'Провайдер'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs transition-all',
                    providerId === p.id
                      ? 'border-accent bg-accent/10 text-text-primary'
                      : 'border-app-border text-text-secondary hover:text-text-primary hover:bg-app-hover',
                  )}
                  style={providerId === p.id ? { borderColor: p.color, boxShadow: `0 0 0 1px ${p.color}40` } : undefined}
                >
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span className="text-center leading-tight">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom: Base URL */}
          {provider.custom && (
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-medium">Base URL</label>
              <input
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="input-base font-mono text-xs"
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium flex items-center gap-2">
              {isEn ? 'API Key' : 'API-ключ'}
              {keyStatus === 'ok' && keyValue.trim() && <span className="text-success text-xs">✅</span>}
              {keyStatus === 'error' && <span className="text-error text-xs">❌</span>}
            </label>
            <div className="relative">
              <input
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                onBlur={() => {
                  if (keyValue.trim()) {
                    void runFetchModels(keyValue, providerId, effectiveBaseUrl, customModel)
                  }
                }}
                type={showKey ? 'text' : 'password'}
                placeholder={provider.keyPlaceholder}
                className="input-base font-mono text-xs pr-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSave) handleSave()
                }}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon h-6 w-6 text-[11px]"
                title={showKey ? t('apikey.hide') : t('apikey.show')}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            {keyStatus === 'error' && keyError && (
              <p className="mt-1 text-[11px] text-error">
                {keyError === '401'
                  ? isEn ? 'Invalid API key' : 'Неверный API-ключ'
                  : keyError === 'network'
                    ? isEn ? 'Network/CORS error — browser cannot reach this API directly' : 'Сетевая/CORS ошибка — браузер не может напрямую обратиться к этому API'
                    : isEn ? `Error: ${keyError}` : `Ошибка: ${keyError}`}
              </p>
            )}
          </div>

          {/* Model dropdown (non-custom) or text input (custom) */}
          {!provider.custom && (
            <ModelSelect
              models={models}
              currentModel={currentModel}
              keyStatus={keyStatus}
              onChange={(m) => setModel(m)}
              isEn={isEn}
              keyValue={keyValue}
            />
          )}

          {provider.custom && (keyStatus === 'error' || models.length === 0) && (
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-medium">
                {isEn ? 'Model name (manual)' : 'Имя модели (вручную)'}
              </label>
              <input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="input-base font-mono text-xs"
              />
            </div>
          )}

          {provider.custom && models.length > 0 && keyStatus === 'ok' && (
            <ModelSelect
              models={models}
              currentModel={currentModel}
              keyStatus={keyStatus}
              onChange={(m) => setCustomModel(m)}
              isEn={isEn}
              keyValue={keyValue}
            />
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded transition-colors',
                canSave ? 'bg-accent text-white hover:bg-accent/80' : 'bg-app-hover text-text-secondary cursor-not-allowed',
              )}
            >
              {saved ? t('apikey.saved') : t('apikey.save')}
            </button>
            <button
              onClick={handleTest}
              disabled={!canSave || keyStatus === 'loading'}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border border-app-border transition-colors',
                canSave && keyStatus !== 'loading'
                  ? 'hover:bg-app-hover text-text-primary'
                  : 'text-text-secondary cursor-not-allowed',
              )}
            >
              {keyStatus === 'loading' ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 border-2 border-app-border border-t-accent rounded-full animate-spin" />
                  {t('apiKey.testing')}
                </span>
              ) : (
                t('apikey.test')
              )}
            </button>
            {storedApiKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2 text-xs font-medium rounded border border-error/40 text-error hover:bg-error/10 transition-colors"
              >
                {t('apikey.remove')}
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-app-border text-[11px] text-text-secondary leading-relaxed space-y-1.5">
            <p>{t('apikey.storageNote')}</p>
            {provider.docsUrl && (
              <p>
                {t('apikey.getKey')}{' '}
                <a href={provider.docsUrl} target="_blank" rel="noreferrer" className="text-info underline hover:opacity-80">
                  {provider.docsUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModelSelect({
  models,
  currentModel,
  keyStatus,
  onChange,
  isEn,
  keyValue,
}: {
  models: string[]
  currentModel: string
  keyStatus: KeyStatus
  onChange: (m: string) => void
  isEn: boolean
  keyValue: string
}) {
  const hasModels = models.length > 0
  const noKey = !keyValue.trim()
  const loading = keyStatus === 'loading'

  // If current model not in loaded list, show it as first option
  const displayModels = hasModels && !models.includes(currentModel) && currentModel
    ? [currentModel, ...models]
    : models

  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1 font-medium flex items-center gap-2">
        {isEn ? 'Model' : 'Модель'}
        {loading && <span className="inline-block w-3 h-3 border border-app-border border-t-accent rounded-full animate-spin" />}
        {keyStatus === 'ok' && !loading && hasModels && <span className="text-[10px] text-success">● API</span>}
        {keyStatus === 'ok' && !loading && !hasModels && <span className="text-[10px] text-warning">● fallback</span>}
      </label>
      <select
        value={currentModel}
        onChange={(e) => onChange(e.target.value)}
        disabled={noKey || loading}
        className={cn('input-base text-xs', (noKey || loading) && 'opacity-50 cursor-not-allowed')}
      >
        {noKey && (
          <option value="" disabled>
            {isEn ? 'Enter API key to load models' : 'Введите ключ для загрузки моделей'}
          </option>
        )}
        {loading && (
          <option value="" disabled>
            {isEn ? 'Loading models…' : 'Загрузка моделей…'}
          </option>
        )}
        {displayModels.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}
