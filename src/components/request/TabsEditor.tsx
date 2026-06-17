import { useState } from 'react'
import type { RequestTab } from '@/types'
import { cn } from '@/utils/cn'
import { useRequestStore } from '@/store/useRequestStore'
import { useT } from '@/utils/i18n'
import { HeadersEditor } from './HeadersEditor'
import { BodyEditor } from './BodyEditor'
import { ParamsEditor } from './ParamsEditor'
import { AuthEditor } from './AuthEditor'

const TABS: { value: RequestTab; labelKey: string }[] = [
  { value: 'params', labelKey: 'tabs.params' },
  { value: 'headers', labelKey: 'tabs.headers' },
  { value: 'body', labelKey: 'tabs.body' },
  { value: 'auth', labelKey: 'tabs.auth' },
]

export function TabsEditor() {
  const t = useT()
  const [tab, setTab] = useState<RequestTab>('params')
  const params = useRequestStore((s) => s.current.params)
  const headers = useRequestStore((s) => s.current.headers)
  const bodyType = useRequestStore((s) => s.current.body.type)
  const authType = useRequestStore((s) => s.current.auth.type)

  const counts: Record<RequestTab, number> = {
    params: params.filter((p) => p.enabled && p.key.trim()).length,
    headers: headers.filter((h) => h.enabled && h.key.trim()).length,
    body: bodyType === 'none' ? 0 : 1,
    auth: authType === 'none' ? 0 : 1,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-app-border">
        {TABS.map((tb) => {
          const badge = counts[tb.value]
          return (
            <button
              key={tb.value}
              onClick={() => setTab(tb.value)}
              className={cn(
                'px-4 py-2 text-xs font-medium transition-colors relative',
                tab === tb.value
                  ? 'text-text-primary border-b-2 border-accent -mb-px'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t(tb.labelKey)}
              {badge > 0 && (
                <span className="ml-1.5 text-[10px] text-text-secondary bg-app-hover rounded-full px-1.5 py-0.5">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {tab === 'params' && <ParamsEditor />}
        {tab === 'headers' && <HeadersEditor />}
        {tab === 'body' && <BodyEditor />}
        {tab === 'auth' && <AuthEditor />}
      </div>
    </div>
  )
}
