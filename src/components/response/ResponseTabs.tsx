import { useState } from 'react'
import type { ResponseData, ResponseTab } from '@/types'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'
import { JsonViewer } from './JsonViewer'

interface Props {
  response: ResponseData
}

export function ResponseTabs({ response }: Props) {
  const t = useT()
  const [tab, setTab] = useState<ResponseTab>('body')

  const TABS: { value: ResponseTab; labelKey: string }[] = [
    { value: 'body', labelKey: 'response.body' },
    { value: 'headers', labelKey: 'response.headers' },
    { value: 'timeline', labelKey: 'response.timeline' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-app-border">
        {TABS.map((tb) => (
          <button
            key={tb.value}
            onClick={() => setTab(tb.value)}
            className={cn(
              'px-4 py-1.5 text-xs font-medium transition-colors',
              tab === tb.value
                ? 'text-text-primary border-b-2 border-accent -mb-px'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'body' && <BodyTab response={response} />}
        {tab === 'headers' && <HeadersTab response={response} />}
        {tab === 'timeline' && <TimelineTab response={response} />}
      </div>
    </div>
  )
}

function BodyTab({ response }: { response: ResponseData }) {
  const t = useT()
  if (response.status === 0) {
    return (
      <div className="p-4 font-mono text-xs text-error whitespace-pre-wrap break-all">
        {response.rawBody}
      </div>
    )
  }
  if (!response.rawBody) {
    return <div className="p-4 text-xs text-text-secondary italic">{t('response.bodyEmpty')}</div>
  }
  return <JsonViewer data={response.body} />
}

function HeadersTab({ response }: { response: ResponseData }) {
  const t = useT()
  const entries = Object.entries(response.headers)
  if (!entries.length) {
    return <div className="p-4 text-xs text-text-secondary italic">{t('response.noHeaders')}</div>
  }
  return (
    <div className="overflow-auto scrollbar-thin h-full">
      <table className="w-full text-xs">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-b border-app-border/50 hover:bg-app-hover/40">
              <td className="px-3 py-1.5 font-mono text-accent/90 align-top w-1/3 break-all">{k}</td>
              <td className="px-3 py-1.5 font-mono text-text-primary break-all">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimelineTab({ response }: { response: ResponseData }) {
  const t = useT()
  const lines: { val: string; label: string }[] = [
    { val: new Date(response.timestamp).toISOString(), label: t('response.received') },
    { val: `${response.duration.toFixed(0)}ms`, label: t('response.totalTime') },
    { val: `${response.size} bytes`, label: t('response.bodySize') },
    { val: response.ok ? t('response.success') : t('response.failure'), label: t('response.fetchResult') },
  ]
  return (
    <div className="p-4 font-mono text-xs space-y-1">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-3">
          <span className="text-text-secondary">{String(i).padStart(2, '0')}</span>
          <span className="text-info">{l.val}</span>
          <span className="text-text-secondary">— {l.label}</span>
        </div>
      ))}
      <div className="pt-3 mt-3 border-t border-app-border text-text-secondary">
        <div>Status: {response.status} {response.statusText}</div>
      </div>
    </div>
  )
}
