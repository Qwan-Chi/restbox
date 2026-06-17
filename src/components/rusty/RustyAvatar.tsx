import { cn } from '@/utils/cn'
import type { RustyStatus } from '@/types'

interface Props {
  status: RustyStatus
  size?: number
}

export function RustyAvatar({ status, size = 32 }: Props) {
  const dotColor =
    status === 'thinking'
      ? 'bg-warning'
      : status === 'online'
        ? 'bg-success'
        : status === 'error'
          ? 'bg-error'
          : 'bg-text-secondary'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40',
          status === 'thinking' && 'animate-pulse',
        )}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.55 }} className="leading-none">🔩</span>
      </div>
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-app-panel',
          dotColor,
        )}
      />
    </div>
  )
}
