import { useState } from 'react'
import { useRusty } from '@/hooks/useRusty'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

export const RUSTY_QUICK_ACTIONS = [
  { labelKey: 'action.explain', promptRu: 'Объясни структуру этого ответа: что означает каждое поле, зачем оно нужно.', promptEn: 'Explain the structure of this response: what each field means and why it is needed.' },
  { labelKey: 'action.findProblems', promptRu: 'Найди аномалии и потенциальные проблемы в этом ответе API.', promptEn: 'Find anomalies and potential issues in this API response.' },
  { labelKey: 'action.codeJs', promptRu: 'Напиши JavaScript-код для обработки этого ответа. Включи проверку ошибок.', promptEn: 'Write JavaScript code to handle this response. Include error handling.' },
  { labelKey: 'action.codePython', promptRu: 'Напиши Python-код для обработки этого ответа с использованием requests.', promptEn: 'Write Python code to handle this response using the requests library.' },
  { labelKey: 'action.whatNext', promptRu: 'На основе этого ответа — что логично запросить следующим? Предложи следующие API-вызовы.', promptEn: 'Based on this response, what should be requested next? Suggest follow-up API calls.' },
  { labelKey: 'action.security', promptRu: 'Проверь этот ответ с точки зрения безопасности: нет ли утечки чувствительных данных или проблем.', promptEn: 'Check this response for security issues: sensitive data leaks or other problems.' },
] as const

import { useI18nStore } from '@/store/useI18nStore'

export function RustyActions() {
  const t = useT()
  const lang = useI18nStore((s) => s.lang)
  const { ask, status } = useRusty()
  const [hovered, setHovered] = useState<number | null>(null)
  const disabled = status === 'thinking'

  return (
    <div className="border-t border-app-border px-3 py-2 min-w-0">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1 min-w-0">
        {RUSTY_QUICK_ACTIONS.map((a, i) => (
          <button
            key={a.labelKey}
            onClick={() => ask(lang === 'ru' ? a.promptRu : a.promptEn)}
            disabled={disabled}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'shrink-0 px-2.5 py-1 text-[11px] rounded-full border transition-colors whitespace-nowrap',
              hovered === i
                ? 'border-accent text-accent bg-accent/10'
                : 'border-app-border text-text-secondary',
              disabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-text-primary',
            )}
          >
            {t(a.labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
