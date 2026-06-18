import { useState } from 'react'
import { useRusty } from '@/hooks/useRusty'
import { useRustyStore, DEFAULT_TITLE } from '@/store/useRustyStore'
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
  const renameSession = useRustyStore((s) => s.renameSession)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  const handleNew = () => {
    newChat()
    onClose()
  }

  const handleSwitch = (id: string) => {
    if (editingId) return
    switchChat(id)
    onClose()
  }

  const handleStartRename = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title === DEFAULT_TITLE ? '' : title)
  }

  const handleConfirmRename = () => {
    if (editingId) {
      const name = editValue.trim() || DEFAULT_TITLE
      renameSession(editingId, name)
    }
    setEditingId(null)
    setEditValue('')
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
          const isEditing = editingId === s.id

          return (
            <div
              key={s.id}
              onClick={() => handleSwitch(s.id)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                handleStartRename(s.id, s.title)
              }}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors mb-0.5',
                isActive ? 'bg-accent/15 border border-accent/30' : 'hover:bg-app-hover border border-transparent',
              )}
            >
              <span className={cn('text-xs shrink-0', isActive ? 'text-accent' : 'text-text-secondary')}>
                {isEmpty ? '💬' : '🔩'}
              </span>

              {isEditing ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename()
                    if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
                  }}
                  onBlur={handleConfirmRename}
                  autoFocus
                  placeholder={DEFAULT_TITLE}
                  className="flex-1 min-w-0 bg-app-input border border-accent rounded px-1.5 py-0.5 text-xs text-text-primary focus:outline-none"
                />
              ) : (
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
              )}

              {!isEditing && (
                <div className="flex items-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartRename(s.id, s.title)
                    }}
                    className="opacity-0 group-hover:opacity-100 btn-icon h-5 w-5 text-[10px]"
                    title="Переименовать"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(s.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 btn-icon h-5 w-5 text-[10px]"
                    title={t('chatList.delete')}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="px-3 py-1.5 text-[10px] text-text-secondary/60 border-t border-app-border/50">
        Двойной клик — переименовать
      </div>
    </div>
  )
}
