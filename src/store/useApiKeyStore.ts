import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProvider } from '@/services/providers'

interface ApiKeyStore {
  providerId: string
  apiKey: string
  model: string
  customBaseUrl: string
  customModel: string

  setProvider: (id: string) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setCustomBaseUrl: (url: string) => void
  setCustomModel: (model: string) => void
  clear: () => void
}

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(
    (set, get) => ({
      providerId: 'deepseek',
      apiKey: '',
      model: '',
      customBaseUrl: '',
      customModel: '',

      setProvider: (providerId) => {
        const p = getProvider(providerId)
        set({
          providerId,
          model: p.custom ? get().customModel || '' : p.defaultModel,
          apiKey: '',
        })
      },
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      setModel: (model) => set({ model }),
      setCustomBaseUrl: (customBaseUrl) => set({ customBaseUrl }),
      setCustomModel: (customModel) => set({ customModel, model: customModel }),
      clear: () => set({ apiKey: '' }),
    }),
    { name: 'restbox:api-config' },
  ),
)

export interface ActiveConfig {
  providerId: string
  provider: ReturnType<typeof getProvider>
  apiKey: string
  model: string
  baseUrl: string
  ready: boolean
}

export function getActiveConfig(): ActiveConfig {
  const s = useApiKeyStore.getState()
  const provider = getProvider(s.providerId)
  const baseUrl = provider.custom ? s.customBaseUrl : provider.baseUrl
  const model = provider.custom ? s.customModel || s.model : s.model || provider.defaultModel
  return {
    providerId: s.providerId,
    provider,
    apiKey: s.apiKey,
    model,
    baseUrl,
    ready: s.apiKey.trim().length > 0 && baseUrl.trim().length > 0 && model.trim().length > 0,
  }
}

export function hasStoredApiKey(): boolean {
  return getActiveConfig().ready
}
