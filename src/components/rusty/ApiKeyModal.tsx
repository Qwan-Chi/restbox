import { useEffect, useState } from 'react'
import { useApiKeyStore } from '@/store/useApiKeyStore'
import { PROVIDERS, getProvider } from '@/services/providers'
import { checkApiKey, fetchModels } from '@/services/rusty'
import { useT } from '@/utils/i18n'
import { useI18nStore } from '@/store/useI18nStore'
import { cn } from '@/utils/cn'

interface Props {
  onClose: () => void
}

export function ApiKeyModal({ onClose }: Props) {
  const t = useT()
  const isEn = useI18nStore((s) => s.lang) === 'en'

  const providerId = useApiKeyStore((s) => s.providerId)
  const apiKey = useApiKeyStore((s) => s.apiKey)
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
  const [keyValue, setKeyValue] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saved, setSaved] = useState(false)
  const [dynamicModels, setDynamicModels] = useState<string[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsSource, setModelsSource] = useState<'api' | 'fallback' | null>(null)

  useEffect(() => {
    setTestResult(null)
    setSaved(false)
  }, [keyValue, providerId, model, customModel, customBaseUrl])

  useEffect(() => {
    if (provider.custom || !keyValue.trim()) {
      setDynamicModels([])
      setModelsSource(null)
      return
    }
    let cancelled = false
    setModelsLoading(true)
    void fetchModels(providerId, keyValue, provider.baseUrl).then((result) => {
      if (cancelled) return
      setDynamicModels(result.models)
      setModelsSource(result.source)
      setModelsLoading(false)
      if (result.source === 'api' && result.models.length > 0 && !result.models.includes(currentModel)) {
        setModel(result.models[0])
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, keyValue])

  const currentModel = provider.custom ? customModel : model || provider.defaultModel
  const baseUrl = provider.custom ? customBaseUrl : provider.baseUrl

  const handleSave = () => {
    setApiKey(keyValue)
    if (provider.custom) setCustomModel(customModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setApiKey(keyValue)
    if (provider.custom) setCustomModel(customModel)
    const result = await checkApiKey()
    setTestResult(result)
    setTesting(false)
  }

  const handleClear = () => {
    clear()
    setKeyValue('')
    setTestResult(null)
  }

  const canSave = keyValue.trim().length > 0 && (!provider.custom || (baseUrl.trim().length > 0 && currentModel.trim().length > 0))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[92vw] max-h-[90vh] flex flex-col bg-app-panel border border-app-border rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border shrink-0">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            {t('apikey.title')}
          </h3>
          <button onClick={onClose} className="btn-icon h-7 w-7 text-xs">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin p-5 space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-2 font-medium">
              {isEn ? 'Provider' : 'Провайдер'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id)
                    setKeyValue('')
                    setTestResult(null)
                  }}
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

          {provider.custom && (
            <>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-medium">
                  {isEn ? 'Base URL' : 'Base URL'}
                </label>
                <input
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="input-base font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-medium">
                  {isEn ? 'Model name' : 'Имя модели'}
                </label>
                <input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="input-base font-mono text-xs"
                />
              </div>
            </>
          )}

          {!provider.custom && (
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-medium flex items-center gap-2">
                {isEn ? 'Model' : 'Модель'}
                {modelsLoading && (
                  <span className="inline-block w-3 h-3 border border-app-border border-t-accent rounded-full animate-spin" />
                )}
                {modelsSource === 'api' && !modelsLoading && (
                  <span className="text-[10px] text-success">● API</span>
                )}
                {modelsSource === 'fallback' && !modelsLoading && keyValue.trim() && (
                  <span className="text-[10px] text-warning" title="Не удалось загрузить список моделей">
                    ● fallback
                  </span>
                )}
              </label>
              <select
                value={currentModel}
                onChange={(e) => setModel(e.target.value)}
                className="input-base text-xs"
              >
                {(dynamicModels.length > 0 ? dynamicModels : provider.models).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                {dynamicModels.length === 0 && modelsSource === null && keyValue.trim() && (
                  <option value={currentModel} disabled>
                    {isEn ? 'Loading models…' : 'Загрузка моделей…'}
                  </option>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
              {isEn ? 'API Key' : 'API-ключ'}
            </label>
            <div className="relative">
              <input
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
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
          </div>

          {testResult && (
            <div
              className={cn(
                'p-2.5 rounded-lg border text-xs',
                testResult.ok
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-error/30 bg-error/10 text-error',
              )}
            >
              {testResult.ok ? '✓' : '✗'} {testResult.message}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded transition-colors',
                canSave
                  ? 'bg-accent text-white hover:bg-accent/80'
                  : 'bg-app-hover text-text-secondary cursor-not-allowed',
              )}
            >
              {saved ? t('apikey.saved') : t('apikey.save')}
            </button>
            <button
              onClick={handleTest}
              disabled={!canSave || testing}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border border-app-border transition-colors',
                canSave && !testing
                  ? 'hover:bg-app-hover text-text-primary'
                  : 'text-text-secondary cursor-not-allowed',
              )}
            >
              {testing ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 border-2 border-app-border border-t-accent rounded-full animate-spin" />
                  {t('apiKey.testing')}
                </span>
              ) : (
                t('apikey.test')
              )}
            </button>
            {apiKey && (
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
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-info underline hover:opacity-80"
                >
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
