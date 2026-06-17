import type { ResponseData } from '@/types'
import { formatBytes, formatDuration } from '@/utils/formatJson'

interface Props {
  response: ResponseData
}

export function ResponseMeta({ response }: Props) {
  const cells = [
    { label: 'Время', value: formatDuration(response.duration) },
    { label: 'Размер', value: formatBytes(response.size) },
  ]
  return (
    <div className="flex items-center gap-4 text-xs text-text-secondary">
      {cells.map((c) => (
        <span key={c.label}>
          <span className="text-text-secondary/70">{c.label}:</span>{' '}
          <span className="text-text-primary font-mono">{c.value}</span>
        </span>
      ))}
    </div>
  )
}
