import { useEffect, useRef, useState } from 'react'
import type { HttpMethod } from '@/types'
import { cn } from '@/utils/cn'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

interface Props {
  value: HttpMethod
  onChange: (method: HttpMethod) => void
}

export function MethodSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1 rounded-l px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
          `text-method-${value.toLowerCase()}`,
          'bg-app-hover hover:bg-app-border',
          'border border-app-border border-r-0',
        )}
        style={{ minWidth: 88, justifyContent: 'center' }}
      >
        {value}
        <span className="text-text-secondary text-[10px]">▼</span>
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 mt-1 w-32 bg-app-panel border border-app-border rounded-md shadow-xl overflow-hidden">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => {
                onChange(m)
                setOpen(false)
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-app-hover transition-colors',
                `text-method-${m.toLowerCase()}`,
                m === value && 'bg-app-hover',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
