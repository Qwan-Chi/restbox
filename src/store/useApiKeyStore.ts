import { create } from 'zustand'
import { getProvider } from '@/services/providers'
import { storage } from '@/utils/storage'

const CONFIG_KEY = 'api-config'

interface StoredConfig {
  providerId: string
  apiKey: string
  model: string
  customBaseUrl: string
  customModel: string
}

function loadConfig(): StoredConfig {
  return (
    storage.get<StoredConfig>(CONFIG_KEY) ?? {
      providerId: 'deepseek',
      apiKey: '',
      model: '',
      customBaseUrl: '',
      customModel: '',
    }
  )
}

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

const initial = loadConfig()

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  providerId: initial.providerId,
  apiKey: initial.apiKey,
  model: initial.model,
  customBaseUrl: initial.customBaseUrl,
  customModel: initial.customModel,

  setProvider: (providerId) => {
    const p = getProvider(providerId)
    set({
      providerId,
      model: p.custom ? get().customModel || '' : p.defaultModel,
      apiKey: '',
    })
    saveConfig(get())
  },
  setApiKey: (apiKey) => {
    set({ apiKey: apiKey.trim() })
    saveConfig(get())
  },
  setModel: (model) => {
    set({ model })
    saveConfig(get())
  },
  setCustomBaseUrl: (customBaseUrl) => {
    set({ customBaseUrl })
    saveConfig(get())
  },
  setCustomModel: (customModel) => {
    set({ customModel, model: customModel })
    saveConfig(get())
  },
  clear: () => {
    set({ apiKey: '' })
    saveConfig(get())
  },
}))

function saveConfig(state: ApiKeyStore): void {
  storage.set<StoredConfig>(CONFIG_KEY, {
    providerId: state.providerId,
    apiKey: state.apiKey,
    model: state.model,
    customBaseUrl: state.customBaseUrl,
    customModel: state.customModel,
  })
}

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
