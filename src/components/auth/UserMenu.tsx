import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/utils/cn'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
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

  if (!user) return null

  const initials = user.name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const providerLabel = user.provider === 'google' ? 'Google' : 'Яндекс'

  return (
    <div ref={ref} className="relative border-t border-app-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-app-hover transition-colors"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-app-border" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-semibold text-accent">
            {initials || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-medium text-text-primary truncate">{user.name}</div>
          <div className="text-[10px] text-text-secondary truncate">{user.email ?? providerLabel}</div>
        </div>
        <span className="text-text-secondary text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-app-bg border border-app-border rounded-md shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-app-border">
            <div className="text-xs font-medium text-text-primary truncate">{user.name}</div>
            {user.email && <div className="text-[10px] text-text-secondary truncate">{user.email}</div>}
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-accent">
              {user.provider === 'google' ? '🇬' : '🟡'} {providerLabel}
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); logout() }}
            className={cn('w-full text-left px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors')}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}
