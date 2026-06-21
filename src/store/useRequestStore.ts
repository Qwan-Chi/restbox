import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  HttpMethod,
  KeyValuePair,
  RequestAuth,
  RequestConfig,
  ResponseData,
} from '@/types'

function emptyKv(): KeyValuePair {
  return { id: uuid(), key: '', value: '', enabled: true }
}

export function createDefaultRequest(): RequestConfig {
  return {
    id: uuid(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    headers: [emptyKv()],
    params: [emptyKv()],
    body: {
      type: 'none',
      content: '',
      formData: [emptyKv()],
    },
    auth: { type: 'none' },
  }
}

interface RequestStore {
  current: RequestConfig
  response: ResponseData | null
  isLoading: boolean
  error: string | null
  loadedCollectionId: string | null
  loadedRequestId: string | null

  setMethod: (method: HttpMethod) => void
  setUrl: (url: string) => void
  setName: (name: string) => void
  setHeaders: (headers: KeyValuePair[]) => void
  setParams: (params: KeyValuePair[]) => void
  setBody: (body: RequestConfig['body']) => void
  setAuth: (auth: RequestAuth) => void
  setResponse: (response: ResponseData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadRequest: (request: RequestConfig, collectionId?: string) => void
  reset: () => void
}

export const useRequestStore = create<RequestStore>((set) => ({
  current: createDefaultRequest(),
  response: null,
  isLoading: false,
  error: null,
  loadedCollectionId: null,
  loadedRequestId: null,

  setMethod: (method) => set((s) => ({ current: { ...s.current, method } })),
  setUrl: (url) => set((s) => ({ current: { ...s.current, url } })),
  setName: (name) => set((s) => ({ current: { ...s.current, name } })),
  setHeaders: (headers) => set((s) => ({ current: { ...s.current, headers } })),
  setParams: (params) => set((s) => ({ current: { ...s.current, params } })),
  setBody: (body) => set((s) => ({ current: { ...s.current, body } })),
  setAuth: (auth) => set((s) => ({ current: { ...s.current, auth } })),
  setResponse: (response) => set({ response }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  loadRequest: (request, collectionId) =>
    set({
      current: structuredClone(request),
      response: null,
      error: null,
      loadedCollectionId: collectionId ?? null,
      loadedRequestId: collectionId ? request.id : null,
    }),
  reset: () =>
    set({
      current: createDefaultRequest(),
      response: null,
      error: null,
      isLoading: false,
      loadedCollectionId: null,
      loadedRequestId: null,
    }),
}))

export { emptyKv }
