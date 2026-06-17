import { useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainPanel } from '@/components/layout/MainPanel'
import { RustyPanel } from '@/components/layout/RustyPanel'
import { ResizeHandle } from '@/components/layout/ResizeHandle'
import { useLayoutStore, LIMITS } from '@/store/useLayoutStore'

export default function App() {
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth)
  const setSidebarWidth = useLayoutStore((s) => s.setSidebarWidth)
  const rustyWidth = useLayoutStore((s) => s.rustyWidth)
  const setRustyWidth = useLayoutStore((s) => s.setRustyWidth)

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app-bg text-text-primary">
      <div className="shrink-0" style={{ width: sidebarWidth }}>
        <Sidebar />
      </div>
      <ResizeHandle direction="horizontal" onResize={onSidebarResize} title="↔" />
      <MainPanel />
      <ResizeHandle direction="horizontal" onResize={onRustyResize} title="↔" />
      <RustyPanel />
    </div>
  )
}
