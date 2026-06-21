import { useEffect, useRef, useState } from 'react'
import { useRusty } from '@/hooks/useRusty'
import { useRequestStore } from '@/store/useRequestStore'
import { useLayoutStore } from '@/store/useLayoutStore'
import { useApiKeyStore } from '@/store/useApiKeyStore'
import { getActiveConfig } from '@/store/useApiKeyStore'
import { getProvider } from '@/services/providers'
import { DEFAULT_TITLE } from '@/store/useRustyStore'
import { RustyAvatar } from '@/components/rusty/RustyAvatar'
import { RustyChat } from '@/components/rusty/RustyChat'
import { RustyChatList } from '@/components/rusty/RustyChatList'
import { ApiKeyModal } from '@/components/rusty/ApiKeyModal'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'
import type { RustyStatus } from '@/types'

export function RustyPanel() {
  const t = useT()
  const { status, autoAnalyze, clearActive, newChat, activeSession, messages } = useRusty()
  const response = useRequestStore((s) => s.response)
  const providerId = useApiKeyStore((s) => s.providerId)
  const toggleRusty = useLayoutStore((s) => s.toggleRusty)
  const [showList, setShowList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const lastRespKey = useRef<string | null>(null)

  const provider = getProvider(providerId)
  const apiReady = getActiveConfig().ready

  useEffect(() => {
    if (!response || !apiReady) return
    const key = `${response.timestamp}:${response.status}`
    if (lastRespKey.current === key) return
    lastRespKey.current = key
    void autoAnalyze()
  }, [response, apiReady, autoAnalyze])

  const statusKey: RustyStatus = !apiReady ? 'error' : status
  const statusLabelKey = !apiReady ? 'rusty.noApiKey' : `rusty.${status}`
  const statusColor = !apiReady
    ? 'text-error'
    : status === 'thinking'
      ? 'text-warning'
      : status === 'error'
        ? 'text-error'
        : status === 'online'
          ? 'text-success'
          : 'text-text-secondary'

  const sessionTitle = activeSession?.title ?? DEFAULT_TITLE

  return (
    <aside
    className="h-full flex flex-col bg-app-panel border-l border-app-border min-w-0 overflow-hidden relative w-full max-w-full"
    >
      <div className="flex items-center gap-1.5 px-2 py-2 border-b border-app-border min-w-0 w-full max-w-full">
        <RustyAvatar status={statusKey} size={28} />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-sm font-semibold text-text-primary leading-tight flex items-center gap-1 min-w-0">
            <span className="truncate">Rusty</span>
            <span className="text-[10px] font-normal text-text-secondary truncate">
              · {sessionTitle}
            </span>
          </div>
          <div className={cn('text-[11px] leading-tight flex items-center gap-1 min-w-0 truncate', statusColor)}>
            {t(statusLabelKey)}
            {apiReady && (
              <span className="text-text-secondary/60 truncate">
                · {provider.icon} {provider.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={toggleRusty}
          className="btn-icon h-7 w-7 border border-app-border"
          title="Свернуть"
        >
          ▶
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className={cn(
            'btn-icon h-7 w-7 border border-app-border',
            !apiReady && 'ring-2 ring-accent/40 animate-pulse',
          )}
          title={t('rusty.settings')}
        >
          ⚙
        </button>
        <button
          onClick={() => setShowList((v) => !v)}
          className={cn(
            'btn-icon h-7 w-7 border border-app-border',
            showList && 'bg-app-hover text-accent',
          )}
          title={t('rusty.chats')}
        >
          ☰
        </button>
        <button
          onClick={newChat}
          className="btn-icon h-7 w-7 border border-app-border"
          title={t('rusty.newChat')}
        >
          ✚
        </button>
        {messages.length > 0 && (
          <button
            onClick={clearActive}
            className="btn-icon h-7 px-2 text-[10px] border border-app-border"
            title={t('rusty.clearCurrent')}
          >
            {t('rusty.clear')}
          </button>
        )}
      </div>

      {showList && <RustyChatList onClose={() => setShowList(false)} />}

      {!apiReady && (
        <button
          onClick={() => setShowSettings(true)}
          className="m-3 p-3 rounded-lg border border-accent/40 bg-accent/10 text-xs text-text-primary hover:bg-accent/20 transition-colors text-left"
        >
          <p className="font-semibold mb-1 text-accent">{t('rusty.insertKey')}</p>
          <p className="text-text-secondary leading-relaxed">{t('rusty.insertKeyHint')}</p>
        </button>
      )}

      <RustyChat />

      {showSettings && <ApiKeyModal onClose={() => setShowSettings(false)} />}
    </aside>
  )
}
