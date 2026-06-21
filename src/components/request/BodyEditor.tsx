import { useRequestStore, emptyKv } from '@/store/useRequestStore'
import type { BodyType } from '@/types'
import { KeyValueEditor } from './KeyValueEditor'
import { JsonCodeEditor } from './JsonCodeEditor'
import { BinaryFileUpload } from './BinaryFileUpload'
import { isValidJson, formatJson } from '@/utils/formatJson'
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

  const handleFormat = () => {
    if (body.type === 'json' && isValidJson(body.content)) {
      setBody({ ...body, content: formatJson(JSON.parse(body.content)) })
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex gap-1 items-center">
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
        {body.type === 'json' && (
          <button
            onClick={handleFormat}
            disabled={!isValidJson(body.content)}
            className={cn(
              'ml-auto px-2 py-1 text-[11px] rounded border transition-colors',
              isValidJson(body.content)
                ? 'border-app-border text-text-secondary hover:text-text-primary hover:bg-app-hover'
                : 'border-app-border text-text-secondary/40 cursor-not-allowed',
            )}
            title="Ctrl+Shift+F"
          >
            Format
          </button>
        )}
      </div>

      {body.type === 'none' && (
        <p className="text-xs text-text-secondary italic">{t('body.none')}</p>
      )}

      {body.type === 'json' && (
        <div className="flex flex-col gap-1.5 flex-1 min-h-0">
          <div className="flex-1 min-h-[200px] border border-app-border rounded overflow-hidden bg-app-input">
            <JsonCodeEditor
              value={body.content}
              onChange={(content) => setBody({ ...body, content })}
              placeholder={t('body.jsonPlaceholder')}
            />
          </div>
          {body.content.trim() !== '' && (
            <span className={cn('text-[11px]', isValidJson(body.content) ? 'text-success' : 'text-error')}>
              {isValidJson(body.content) ? t('body.validJson') : t('body.invalidJson')}
            </span>
          )}
        </div>
      )}

      {body.type === 'raw' && (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={body.content}
            onChange={(e) => setBody({ ...body, content: e.target.value })}
            placeholder={t('body.rawPlaceholder')}
            rows={12}
            className="input-base font-mono text-xs resize-y scrollbar-thin"
          />
        </div>
      )}

      {body.type === 'binary' && (
        <BinaryFileUpload />
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
