import { useRequestStore } from '@/store/useRequestStore'
import { useRustyStore } from '@/store/useRustyStore'
import { useT } from '@/utils/i18n'
import { StatusBadge } from './StatusBadge'
import { ResponseMeta } from './ResponseMeta'
import { ResponseTabs } from './ResponseTabs'
import { cn } from '@/utils/cn'

export function ResponsePanel() {
  const t = useT()
  const response = useRequestStore((s) => s.response)
  const isLoading = useRequestStore((s) => s.isLoading)
  const anomalies = useRustyStore((s) => s.lastAnomalies)

  if (isLoading && !response) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-app-border border-t-accent rounded-full animate-spin" />
          {t('response.waiting')}
        </span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary text-sm gap-2 p-8">
        <span className="text-4xl opacity-40">📡</span>
        <p>{t('response.empty')}</p>
        <p className="text-xs text-text-secondary/70">{t('response.emptyHint')}</p>
      </div>
    )
  }

  const errorCount = anomalies.filter((a) => a.type === 'error').length
  const warnCount = anomalies.filter((a) => a.type === 'warning').length
  const hasProblems = errorCount + warnCount > 0
  const problemWord = errorCount + warnCount === 1 ? t('response.problem') : t('response.problems')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-app-border">
        <StatusBadge status={response.status} statusText={response.statusText} />
        <ResponseMeta response={response} />
        {hasProblems && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border',
              errorCount > 0
                ? 'bg-error/15 text-error border-error/40'
                : 'bg-warning/15 text-warning border-warning/40',
            )}
            title={anomalies.map((a) => a.message).join('\n')}
          >
            {errorCount > 0 ? '🔴' : '⚠️'} {errorCount + warnCount} {problemWord}
          </span>
        )}
      </div>

      {hasProblems && (
        <div className="px-4 py-2 border-b border-app-border bg-app-panel/50 max-h-32 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {anomalies.slice(0, 5).map((a, i) => (
              <li
                key={i}
                className={cn(
                  'text-[11px] flex items-start gap-1.5',
                  a.type === 'error' ? 'text-error' : a.type === 'warning' ? 'text-warning' : 'text-info',
                )}
              >
                <span>{a.type === 'error' ? '🔴' : a.type === 'warning' ? '🟡' : '🔵'}</span>
                <span>{a.message}</span>
              </li>
            ))}
            {anomalies.length > 5 && (
              <li className="text-[11px] text-text-secondary">…{anomalies.length - 5}</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ResponseTabs response={response} />
      </div>
    </div>
  )
}
