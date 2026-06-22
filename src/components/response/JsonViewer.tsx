import { useMemo, useState, useCallback } from 'react'
import { formatJson } from '@/utils/formatJson'
import { useT } from '@/utils/i18n'

interface Props {
  data: unknown
  search?: string
}

interface NodeProps {
  value: unknown
  path: string
  search: string
  defaultOpen: boolean
}

function matchesSearch(value: unknown, search: string): boolean {
  if (!search) return true
  if (typeof value === 'string') return value.toLowerCase().includes(search.toLowerCase())
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).toLowerCase().includes(search.toLowerCase())
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as object)) {
      if (k.toLowerCase().includes(search.toLowerCase()) || matchesSearch(v, search)) return true
    }
    if (Array.isArray(value)) {
      for (const v of value) if (matchesSearch(v, search)) return true
    }
  }
  return false
}

function CopyButton({ value }: { value: unknown }) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const text = typeof value === 'string' ? value : formatJson(value)
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      })
    },
    [value],
  )
  return (
    <button
      onClick={onCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary text-[10px] px-1"
      title={t('json.copy')}
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}

function JsonNode({ value, path, search, defaultOpen }: NodeProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (value === null) {
    return <span className="text-text-secondary italic">null</span>
  }
  if (value === undefined) {
    return <span className="text-text-secondary italic">undefined</span>
  }
  if (typeof value === 'string') {
    return <span className="text-warning">"{value}"</span>
  }
  if (typeof value === 'number') {
    return <span className="text-info">{value}</span>
  }
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-success' : 'text-error'}>{String(value)}</span>
  }

  const isArr = Array.isArray(value)
  const entries = isArr ? value.map((v, i) => [String(i), v] as const) : Object.entries(value as object)
  const count = entries.length

  if (count === 0) {
    return <span className="text-text-secondary">{isArr ? '[]' : '{}'}</span>
  }

  const childPath = (key: string) => (path ? `${path}.${key}` : key)
  const deepOpen = search ? true : defaultOpen

  return (
    <span className="group/block">
      <span
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer select-none inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
      >
        <span className="text-[10px] w-3 inline-block">{open ? '▾' : '▸'}</span>
        <span>{isArr ? '[' : '{'}</span>
      </span>
      {!open && (
        <span className="text-text-secondary/60 text-xs italic">
          {' '}
          {count} {isArr ? (count === 1 ? 'item' : 'items') : 'keys'}{' '}
        </span>
      )}
      {!open && <span className="text-text-secondary">{isArr ? ']' : '}'}</span>}
      {open && (
        <span className="block ml-4 border-l border-app-border/50 pl-2">
          {entries.map(([key, v]) => {
            const pm = search ? matchesSearch(v, search) || key.toLowerCase().includes(search.toLowerCase()) : true
            if (!pm && search) return null
            return (
              <div key={key} className="group flex items-start gap-1">
                <span className="text-accent/90 font-mono">{isArr ? '' : `"${key}":`}</span>
                <span className="flex-1 break-all">
                  <JsonNode value={v} path={childPath(key)} search={search} defaultOpen={deepOpen} />
                  <span className="text-text-secondary">,</span>
                </span>
                <CopyButton value={v} />
              </div>
            )
          })}
        </span>
      )}
      {open && <span className="text-text-secondary">{isArr ? ']' : '}'}</span>}
    </span>
  )
}

export function JsonViewer({ data }: Props) {
  const t = useT()
  const [search, setSearch] = useState('')

  const pretty = useMemo(() => {
    if (typeof data === 'string') return null
    return formatJson(data)
  }, [data])

  if (typeof data === 'string') {
    return (
      <div className="font-mono text-xs text-warning whitespace-pre-wrap break-all">{data}</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-app-border">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('json.search')}
          className="input-base py-1 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearch('')
          }}
        />
        <button
          onClick={() => navigator.clipboard?.writeText(pretty ?? '')}
          className="btn-icon px-2 py-1 border border-app-border text-xs whitespace-nowrap"
          title={t('json.copy')}
        >
          {t('json.copyAll')}
        </button>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-3">
        <pre className="font-mono text-xs leading-relaxed text-text-primary">
          <JsonNode value={data} path="" search={search.trim()} defaultOpen />
        </pre>
      </div>
    </div>
  )
}
