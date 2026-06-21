import { useEffect, useRef } from 'react'
import { useRustyStore } from '@/store/useRustyStore'
import { useT } from '@/utils/i18n'
import { RustyMessage } from './RustyMessage'
import { RustyActions } from './RustyActions'
import { RustyInput } from './RustyInput'

export function RustyChat() {
  const t = useT()
  const messages = useRustyStore((s) => {
    const sess = s.sessions.find((x) => x.id === s.activeSessionId)
    return sess?.messages ?? []
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full max-w-full">
      <div className="flex-1 overflow-auto scrollbar-thin px-3 py-3 space-y-3 min-w-0 w-full max-w-full">
        {messages.length === 0 ? (
          <div className="text-text-secondary text-xs mt-8 px-4 break-words max-w-full">
            <p className="mb-1">{t('rusty.hello')}</p>
            <p>{t('rusty.helloHint')}</p>
          </div>
        ) : (
          messages.map((m) => <RustyMessage key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <RustyActions />
      <RustyInput />
    </div>
  )
}
