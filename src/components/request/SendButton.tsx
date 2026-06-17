import { useRequest } from '@/hooks/useRequest'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

interface Props {
  onSubmit?: () => void
}

export function SendButton({ onSubmit }: Props) {
  const t = useT()
  const { isLoading, send } = useRequest()

  const handleClick = () => {
    onSubmit?.()
    void send()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'px-5 py-2 text-xs font-semibold uppercase tracking-wide rounded-r transition-colors',
        'bg-accent text-white hover:bg-accent/80',
        'border border-accent',
        isLoading && 'opacity-70 cursor-wait',
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {t('send.sending')}
        </span>
      ) : (
        t('send.send')
      )}
    </button>
  )
}
