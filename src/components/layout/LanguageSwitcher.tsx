import { useI18nStore, type Language } from '@/store/useI18nStore'
import { cn } from '@/utils/cn'

const LANGS: { value: Language; label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const lang = useI18nStore((s) => s.lang)
  const setLang = useI18nStore((s) => s.setLang)

  return (
    <div className="flex items-center rounded border border-app-border overflow-hidden">
      {LANGS.map((l) => (
        <button
          key={l.value}
          onClick={() => setLang(l.value)}
          className={cn(
            'px-2 py-1 text-[10px] font-semibold transition-colors',
            lang === l.value
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-app-hover',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
