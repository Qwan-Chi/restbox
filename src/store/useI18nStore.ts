import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ru' | 'en'

interface I18nStore {
  lang: Language
  setLang: (lang: Language) => void
  toggle: () => void
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set, get) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === 'ru' ? 'en' : 'ru' }),
    }),
    { name: 'restbox:lang' },
  ),
)
