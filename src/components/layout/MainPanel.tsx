import { useCallback } from 'react'
import { useRequestStore } from '@/store/useRequestStore'
import { useLayoutStore, LIMITS } from '@/store/useLayoutStore'
import { MethodSelect } from '@/components/request/MethodSelect'
import { UrlInput } from '@/components/request/UrlInput'
import { SendButton } from '@/components/request/SendButton'
import { TabsEditor } from '@/components/request/TabsEditor'
import { ResponsePanel } from '@/components/response/ResponsePanel'
import { ResizeHandle } from '@/components/layout/ResizeHandle'

export function MainPanel() {
  const method = useRequestStore((s) => s.current.method)
  const setMethod = useRequestStore((s) => s.setMethod)
  const editorWidth = useLayoutStore((s) => s.editorWidth)
  const setEditorWidth = useLayoutStore((s) => s.setEditorWidth)

  const onEditorResize = useCallback(
    (delta: number) => {
      const next = Math.max(LIMITS.editor.min, Math.min(LIMITS.editor.max, editorWidth + delta))
      setEditorWidth(next)
    },
    [editorWidth, setEditorWidth],
  )

  return (
    <main className="flex-1 flex flex-col bg-app-bg min-w-[300px]">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-stretch border-b border-app-border"
      >
        <MethodSelect value={method} onChange={setMethod} />
        <UrlInput />
        <SendButton />
      </form>

      <div className="flex flex-1 min-h-0">
        <div className="shrink-0 border-r border-app-border flex flex-col min-w-0 overflow-hidden" style={{ width: editorWidth }}>
          <TabsEditor />
        </div>
        <ResizeHandle direction="horizontal" onResize={onEditorResize} title="↔" />
        <div className="flex-1 flex flex-col min-w-0">
          <ResponsePanel />
        </div>
      </div>
    </main>
  )
}
