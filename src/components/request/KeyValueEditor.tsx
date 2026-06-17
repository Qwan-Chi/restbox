import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import type { KeyValuePair } from '@/types'
import { useT } from '@/utils/i18n'
import { cn } from '@/utils/cn'

interface Props {
  items: KeyValuePair[]
  onChange: (items: KeyValuePair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'key',
  valuePlaceholder = 'value',
}: Props) {
  const t = useT()
  const update = useCallback(
    (id: string, patch: Partial<KeyValuePair>) => {
      onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    },
    [items, onChange],
  )

  const add = useCallback(() => {
    onChange([...items, { id: uuid(), key: '', value: '', enabled: true }])
  }, [items, onChange])

  const remove = useCallback(
    (id: string) => {
      const next = items.filter((it) => it.id !== id)
      onChange(next.length ? next : [{ id: uuid(), key: '', value: '', enabled: true }])
    },
    [items, onChange],
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 px-1 text-xs text-text-secondary">
        <span />
        <span>Key</span>
        <span>Value</span>
        <span />
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 items-center">
          <label className="flex items-center justify-center cursor-pointer" title={t('kv.enable')}>
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => update(item.id, { enabled: e.target.checked })}
              className="accent-accent w-3.5 h-3.5"
            />
          </label>
          <input
            value={item.key}
            onChange={(e) => update(item.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className={cn(
              'input-base py-1.5 text-xs font-mono',
              !item.enabled && 'opacity-40',
            )}
          />
          <input
            value={item.value}
            onChange={(e) => update(item.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className={cn(
              'input-base py-1.5 text-xs font-mono',
              !item.enabled && 'opacity-40',
            )}
          />
          <button
            onClick={() => remove(item.id)}
            className="btn-icon h-7 w-7 text-xs"
            title={t('kv.delete')}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="self-start mt-1 text-xs text-accent hover:text-accent/80 transition-colors"
      >
        {t('kv.add')}
      </button>
    </div>
  )
}
