import { useRusty } from '@/hooks/useRusty'
import { DEFAULT_TITLE } from '@/store/useRustyStore'
import { useT } from '@/utils/i18n'
import { useI18nStore } from '@/store/useI18nStore'
import { cn } from '@/utils/cn'

interface Props {
  onClose: () => void
}

function relativeTime(ts: number, t: (k: string) => string, lang: 'ru' | 'en'): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return t('chatList.justNow')
  if (min < 60) return `${min} ${t('chatList.minAgo')}`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} ${t('chatList.hourAgo')}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${t('chatList.dayAgo')}`
  return new Date(ts).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')
}

export function RustyChatList({ onClose }: Props) {
  const t = useT()
  const lang = useI18nStore((s) => s.lang)
  const { sessions, activeSessionId, newChat, switchChat, deleteSession } = useRusty()

  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  const handleNew = () => {
    newChat()
    onClose()
  }

  const handleSwitch = (id: string) => {
    switchChat(id)
    onClose()
  }

  return (
    <div className="flex flex-col max-h-[45%] border-b border-app-border bg-app-bg/50">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {t('chatList.title')} ({sessions.length})
        </span>
        <button
          onClick={handleNew}
          className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
        >
          {t('chatList.new')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1.5 pb-2">
        {sorted.map((s) => {
          const isActive = s.id === activeSessionId
          const isEmpty = s.messages.length === 0
          return (
            <div
              key={s.id}
              onClick={() => handleSwitch(s.id)}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors mb-0.5',
                isActive ? 'bg-accent/15 border border-accent/30' : 'hover:bg-app-hover border border-transparent',
              )}
            >
              <span className={cn('text-xs', isActive ? 'text-accent' : 'text-text-secondary')}>
                {isEmpty ? '💬' : '🔩'}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-xs truncate',
                    isActive ? 'text-text-primary font-medium' : 'text-text-primary',
                    s.title === DEFAULT_TITLE && 'text-text-secondary italic',
                  )}
                >
                  {s.title}
                </div>
                <div className="text-[10px] text-text-secondary flex gap-2">
                  <span>{relativeTime(s.updatedAt, t, lang)}</span>
                  {!isEmpty && <span>· {s.messages.length} {t('chatList.messages')}</span>}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(s.id)
                }}
                className="opacity-0 group-hover:opacity-100 btn-icon h-5 w-5 text-[10px] shrink-0"
                title={t('chatList.delete')}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
