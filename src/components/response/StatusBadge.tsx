import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

interface Props {
  status: number
  statusText: string
}

export function StatusBadge({ status, statusText }: Props) {
  const t = useT()
  const cls =
    status === 0
      ? 'bg-method-head/15 text-method-head border-method-head/40'
      : status >= 200 && status < 300
        ? 'bg-success/15 text-success border-success/40'
        : status >= 300 && status < 400
          ? 'bg-info/15 text-info border-info/40'
          : status >= 400 && status < 500
            ? 'bg-error/15 text-error border-error/40'
            : 'bg-error/25 text-error border-error/60'

  const label = status === 0 ? t('status.networkError') : `${status} ${statusText || ''}`.trim()

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border', cls)}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 0 ? 'bg-method-head' : status >= 200 && status < 300 ? 'bg-success' : 'bg-error',
        )}
      />
      {label}
    </span>
  )
}
