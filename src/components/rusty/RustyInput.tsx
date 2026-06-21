import { useState, type FormEvent } from 'react'
import { useRusty } from '@/hooks/useRusty'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

export function RustyInput() {
  const t = useT()
  const { ask, status, stop } = useRusty()
  const [text, setText] = useState('')
  const thinking = status === 'thinking'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (thinking) {
      stop()
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    void ask(trimmed)
  }

  return (
    <form onSubmit={submit} className="border-t border-app-border p-3 max-w-full">
      <div className="flex items-end gap-2 bg-app-input border border-app-border rounded-lg px-2 py-1.5 focus-within:border-accent transition-colors max-w-full">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit(e)
            }
          }}
          placeholder={t('rusty.inputPlaceholder')}
          rows={1}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary resize-none outline-none max-h-32 scrollbar-thin min-w-0"
        />
        <button
          type="submit"
          className={cn(
            'shrink-0 px-3 py-1.5 text-xs font-semibold rounded transition-colors',
            thinking
              ? 'bg-error/20 text-error border border-error/40 hover:bg-error/30'
              : 'bg-accent text-white hover:bg-accent/80',
          )}
        >
          {thinking ? t('rusty.stop') : 'Send'}
        </button>
      </div>
    </form>
  )
}
