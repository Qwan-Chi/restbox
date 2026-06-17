import { useRequestStore, emptyKv } from '@/store/useRequestStore'
import type { BodyType } from '@/types'
import { KeyValueEditor } from './KeyValueEditor'
import { isValidJson } from '@/utils/formatJson'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

const TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'none' },
  { value: 'json', label: 'JSON' },
  { value: 'form-data', label: 'form-data' },
  { value: 'raw', label: 'raw' },
  { value: 'binary', label: 'binary' },
]

export function BodyEditor() {
  const t = useT()
  const body = useRequestStore((s) => s.current.body)
  const setBody = useRequestStore((s) => s.setBody)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {TYPES.map((tp) => (
          <button
            key={tp.value}
            onClick={() => setBody({ ...body, type: tp.value })}
            className={cn(
              'px-2.5 py-1 text-xs rounded transition-colors',
              body.type === tp.value
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-app-hover',
            )}
          >
            {tp.label}
          </button>
        ))}
      </div>

      {body.type === 'none' && (
        <p className="text-xs text-text-secondary italic">{t('body.none')}</p>
      )}

      {(body.type === 'json' || body.type === 'raw' || body.type === 'binary') && (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={body.content}
            onChange={(e) => setBody({ ...body, content: e.target.value })}
            placeholder={body.type === 'json' ? t('body.jsonPlaceholder') : t('body.rawPlaceholder')}
            rows={12}
            className="input-base font-mono text-xs resize-y scrollbar-thin"
          />
          {body.type === 'json' && body.content.trim() !== '' && (
            <span className={cn('text-[11px]', isValidJson(body.content) ? 'text-success' : 'text-error')}>
              {isValidJson(body.content) ? t('body.validJson') : t('body.invalidJson')}
            </span>
          )}
        </div>
      )}

      {body.type === 'form-data' && (
        <KeyValueEditor
          items={body.formData.length ? body.formData : [emptyKv()]}
          onChange={(formData) => setBody({ ...body, formData })}
          keyPlaceholder="field"
          valuePlaceholder="value"
        />
      )}
    </div>
  )
}
