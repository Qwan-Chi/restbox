import { useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainPanel } from '@/components/layout/MainPanel'
import { RustyPanel } from '@/components/layout/RustyPanel'
import { ResizeHandle } from '@/components/layout/ResizeHandle'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { useLayoutStore, LIMITS } from '@/store/useLayoutStore'
import { useThemeStore, applyTheme } from '@/store/useThemeStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'

export default function App() {
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth)
  const setSidebarWidth = useLayoutStore((s) => s.setSidebarWidth)
  const rustyWidth = useLayoutStore((s) => s.rustyWidth)
  const setRustyWidth = useLayoutStore((s) => s.setRustyWidth)
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed)
  const rustyCollapsed = useLayoutStore((s) => s.rustyCollapsed)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)
  const toggleRusty = useLayoutStore((s) => s.toggleRusty)
  const mobileTab = useLayoutStore((s) => s.mobileTab)
  const setMobileTab = useLayoutStore((s) => s.setMobileTab)
  const theme = useThemeStore((s) => s.theme)
  const isMobile = useIsMobile()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const onSidebarResize = useCallback(
    (delta: number) => {
      const next = Math.max(LIMITS.sidebar.min, Math.min(LIMITS.sidebar.max, sidebarWidth + delta))
      setSidebarWidth(next)
    },
    [sidebarWidth, setSidebarWidth],
  )

  const onRustyResize = useCallback(
    (delta: number) => {
      const next = Math.max(LIMITS.rusty.min, Math.min(LIMITS.rusty.max, rustyWidth - delta))
      setRustyWidth(next)
    },
    [rustyWidth, setRustyWidth],
  )

  if (!user) {
    return <LoginScreen />
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen h-[100dvh] w-screen overflow-hidden bg-app-bg text-text-primary">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === 'sidebar' && <Sidebar />}
          {mobileTab === 'editor' && <MainPanel />}
          {mobileTab === 'rusty' && <RustyPanel />}
        </div>
        <MobileTabBar tab={mobileTab} onChange={setMobileTab} />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app-bg text-text-primary">
      {!sidebarCollapsed && (
        <>
          <div className="shrink-0 min-w-0 overflow-hidden" style={{ width: sidebarWidth }}>
            <Sidebar />
          </div>
          <ResizeHandle direction="horizontal" onResize={onSidebarResize} title="↔" />
        </>
      )}
      {sidebarCollapsed && <CollapsedBar label="☰" onClick={toggleSidebar} side="left" />}
      <MainPanel />
      {rustyCollapsed && <CollapsedBar label="🔩" onClick={toggleRusty} side="right" />}
      {!rustyCollapsed && (
        <>
          <ResizeHandle direction="horizontal" onResize={onRustyResize} title="↔" />
          <div className="shrink-0 min-w-0 overflow-hidden" style={{ width: rustyWidth }}>
            <RustyPanel />
          </div>
        </>
      )}
    </div>
  )
}

function CollapsedBar({ label, onClick, side }: { label: string; onClick: () => void; side: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 w-8 flex flex-col items-center justify-center bg-app-panel border-app-border hover:bg-app-hover transition-colors',
        side === 'left' ? 'border-r' : 'border-l',
      )}
      title="Развернуть"
    >
      <span className="text-lg">{label}</span>
      <span className="text-text-secondary text-[10px] mt-1">{side === 'left' ? '▶' : '◀'}</span>
    </button>
  )
}

function MobileTabBar({
  tab,
  onChange,
}: {
  tab: 'sidebar' | 'editor' | 'rusty'
  onChange: (t: 'sidebar' | 'editor' | 'rusty') => void
}) {
  const tabs: { value: 'sidebar' | 'editor' | 'rusty'; label: string; icon: string }[] = [
    { value: 'sidebar', label: 'Список', icon: '☰' },
    { value: 'editor', label: 'Запрос', icon: '🌐' },
    { value: 'rusty', label: 'Rusty', icon: '🔩' },
  ]
  return (
    <div className="flex border-t border-app-border bg-app-panel shrink-0">
      {tabs.map((tb) => (
        <button
          key={tb.value}
          onClick={() => onChange(tb.value)}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
            tab === tb.value ? 'text-accent' : 'text-text-secondary',
          )}
        >
          <span className="text-base">{tb.icon}</span>
          {tb.label}
        </button>
      ))}
    </div>
  )
}
